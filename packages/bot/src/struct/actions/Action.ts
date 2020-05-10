import ReikaClient from '../../client/ReikaClient';
import { Case, Actions, ms } from '@mewchan/common';
import { Message, GuildMember, User, TextChannel, MessageEmbed, Constants as DjsConstants, Guild } from 'discord.js';
import { permissionLevel } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';

export interface OptionalData {
  reason?: string;
  duration?: number;
  refID?: number;
  nsfw?: boolean;
}

export default abstract class Action<T extends Actions> {
  public static readonly SEVERITY = [
    DjsConstants.Colors.GREEN,
    DjsConstants.Colors.YELLOW,
    DjsConstants.Colors.ORANGE,
    DjsConstants.Colors.RED
  ];

  public static readonly ACTIONS = {
    0: 'WARN',
    1: 'MUTE',
    2: 'KICK',
    3: 'SOFTBAN',
    4: 'BAN',
    5: 'UNBAN'
  };

  public static async history(target: User, guild: Guild, nsfw = false) {
    const history = new MessageEmbed();

    const cases = await (target.client as ReikaClient).cases.find({
      where: {
        guildID: guild.id,
        targetID: target.id
      }
    });

    let severity = 0;
    const actions = [0, 0, 0, 0, 0];

    for (const cs of cases) {
      switch (cs.action) {
        case Actions.WARN:
          severity += 0.25;
          break;
        case Actions.KICK:
          severity += 0.5;
          break;
        case Actions.SOFTBAN:
          severity += 0.5;
          break;
        case Actions.MUTE:
          severity += 1;
          break;
        case Actions.BAN:
          severity += 2;
          break;
      }

      actions[cs.action]++;
    }

    severity = Math.round(severity);
    if (severity > 3) severity = 3;

    return history
      .setColor(Action.SEVERITY[severity])
      .setAuthor(`${target.tag} (${target.id})`, nsfw ? undefined : target.displayAvatarURL())
      .setFooter(`Warns ${actions[0]} | Mutes ${actions[1]} | Kicks ${actions[2]} | Softbans ${actions[3]} | Bans ${actions[4]}`);
  }

  public static async logCase(
    target: User,
    guild: Guild,
    cs: Case<Actions>,
    mod?: GuildMember | null,
    nsfw = false,
    duration?: number | null
  ) {
    const log = new MessageEmbed();

    if (mod) log.setAuthor(`${mod.user.tag} (${mod.id})`, mod.user.displayAvatarURL());

    let ref: Case<any> | undefined;
    if (cs.refID) ref = await (target.client as ReikaClient).cases.findOne({ caseID: cs.refID, guildID: guild.id });

    log
      .addField('Member', `${target.tag} (${target.id})`)
      .addField('Action', Action.ACTIONS[cs.action].toLowerCase());
    if (duration) log.addField('Duration', ms(duration, true));
    log.addField('Reason', cs.reason!);
    if (ref) {
      const chan = (target.client as ReikaClient).settings.get(guild.id, 'modLogsChannel');
      if (chan) log.addField('Reference', `[${ref.caseID}](https://discordapp.com/channels/${ref.guildID}/${chan}/${ref.message})`);
    }

    let color!: number;
    switch (cs.action) {
      case Actions.WARN:
        color = DjsConstants.Colors.YELLOW;
        break;
      case Actions.MUTE:
        color = DjsConstants.Colors.YELLOW;
        break;
      case Actions.KICK:
      case Actions.SOFTBAN:
        color = DjsConstants.Colors.ORANGE;
        break;
      case Actions.BAN:
        color = DjsConstants.Colors.RED;
        break;
      case Actions.UNBAN:
        color = DjsConstants.Colors.GREEN;
        break;
    }

    log
      .setFooter(`Case ${cs.caseID}`)
      .setTimestamp()
      .setColor(color);

    if (!nsfw) log.setThumbnail(target.displayAvatarURL());

    return log;
  }

  public readonly mod = this.msg.member!;
  public readonly case: Case<T>;
  public readonly client = this.msg.client as ReikaClient;
  public readonly guild = this.msg.guild!;
  public readonly duration?: number;

  public readonly nsfw: boolean;

  protected _dead = false;

  public constructor(
    action: T,
    public readonly msg: Message,
    public readonly target: GuildMember | User,
    optional?: OptionalData
  ) {
    this.nsfw = optional?.nsfw ?? false;
    this.duration = optional?.duration;

    const cs = new Case<T>();

    if (msg.guild!.lastCase == null) {
      msg.channel.send('Something went wrong here, for some reason this server does not have a set last case ID, please inform developer.');
      this._dead = true;
    }

    cs.caseID = (msg.guild!.lastCase ?? 0) + 1;
    cs.action = action;
    cs.guildID = msg.guild!.id;
    cs.createdAt = new Date();

    const prefix = this.client.settings.get(msg.guild!.id, 'prefix', process.env.COMMAND_PREFIX!);
    cs.reason = optional?.reason
      ? optional.reason
      : MESSAGES.CASES.DEFAULTS.REASON(prefix, cs.caseID);

    if (action === Actions.MUTE) cs.unmuteRoles = (target as GuildMember).roles.cache.map(r => r.id).filter(r => r !== msg.guild!.id);

    if (optional?.duration) {
      cs.resolved = false;
      cs.actionExpires = new Date(optional.duration + Date.now());
    }

    if (optional?.refID) cs.refID = optional.refID;

    cs.modID = msg.author.id;
    cs.targetID = target.id;

    this.case = cs;
  }

  public get targetUser() {
    return this.target instanceof GuildMember ? this.target.user : this.target;
  }

  public async execute(): Promise<string | null> {
    try {
      const failure = await this.prepare();
      if (failure !== null) return failure;
      await this.run();
      await this.finish();
      this.guild.lastCase++;
      return null;
    } catch (err) {
      return err.toString();
    }
  }

  protected async prepare(): Promise<any> {
    if (this._dead) return 'Something went wrong at some point, there\'s likely more output above';
    if (!(this.target instanceof GuildMember)) return null;

    const targetCan = permissionLevel(this.target);
    const modCan = permissionLevel(this.mod);

    if (targetCan >= modCan) {
      return `You can't ${Action.ACTIONS[this.case.action].toLowerCase()} ${this.targetUser.tag}, what are you doing?`;
    }

    return null;
  }

  protected abstract async run(): Promise<any>;

  protected async finish(): Promise<any> {
    const settings = this.client.settings.get(this.guild.id);
    const { modLogsChannel } = settings || {};

    if (modLogsChannel) {
      const embed = await Action.logCase(this.targetUser, this.guild, this.case, this.mod, this.nsfw, this.duration);
      const channel = this.guild.channels.cache.get(modLogsChannel) as TextChannel | undefined;

      const id = await channel?.send(embed)
        .then(m => m.id)
        .catch(() => null);

      if (id) this.case.message = id;
    }

    return this.client.cases.save(this.case);
  }
}
