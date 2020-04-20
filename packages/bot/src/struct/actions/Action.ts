import ReikaClient from '../../client/ReikaClient';
import { Case, Actions, ms } from '@reika/common';
import { Message, GuildMember, User, TextChannel, MessageEmbed, Constants as DjsConstants } from 'discord.js';
import { permissionLevel } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';

export interface OptionalData {
  reason?: string;
  duration?: number;
  refID?: number;
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
    2: 'UNMUTE',
    3: 'KICK',
    4: 'SOFTBAN',
    5: 'BAN',
    6: 'UNBAN'
  };

  public static async logCase(mod: GuildMember, target: User, cs: Case<Actions>) {
    const log = new MessageEmbed()
      .setAuthor(`${mod.user.tag} (${mod.id})`, mod.user.displayAvatarURL());

    let ref: Case<any> | undefined;
    if (cs.refID) {
      ref = await (mod.client as ReikaClient).cases.findOne({ caseID: cs.refID, guildID: mod.guild.id });
    }

    log
      .addField('Member', `${target.tag} (${target.id})`)
      .addField('Action', Action.ACTIONS[cs.action].toLowerCase());
    if (cs.actionExpires) log.addField('Duration', ms(cs.actionExpires.getMilliseconds() - Date.now(), true));
    log.addField('Reason', cs.reason!);
    if (ref) {
      const chan = (mod.client as ReikaClient).settings.get(mod.guild.id, 'modLogsChannel');
      if (chan) log.addField('Reference', `[${ref.caseID}](https://discordapp.com/channels/${ref.guildID}/${chan}/${ref.message})`);
    }

    log
      .setThumbnail(target.displayAvatarURL())
      .setFooter(`Case ${cs.caseID}`)
      .setTimestamp();

    return log;
  }

  protected readonly _client = this._msg.client as ReikaClient;
  protected readonly _guild = this._msg.guild!;
  protected readonly _mod = this._msg.member!;
  protected readonly _case: Case<T>;

  protected _dead = false;

  public constructor(
    action: T,
    protected readonly _msg: Message,
    protected readonly _target: GuildMember | User,
    optional?: OptionalData
  ) {
    const cs = new Case<T>();

    if (!_msg.guild!.lastCase) {
      _msg.util!.send('Something went wrong here, for some reason this server does not have a set last case ID, please inform developer.');
      this._dead = true;
    }

    cs.caseID = (_msg.guild!.lastCase ?? 0) + 1;
    cs.action = action;
    cs.guildID = _msg.guild!.id;
    cs.createdAt = new Date();

    const prefix = this._client.settings
      .get(_msg.guild!.id, 'prefix', process.env.COMMAND_PREFIX!);
    cs.reason = optional?.reason
      ? optional.reason
      : MESSAGES.CASES.DEFAULTS.REASON(prefix, cs.caseID);

    if (action === Actions.MUTE) cs.unmuteRoles = (_target as GuildMember).roles.cache.map(r => r.id);

    if (optional?.duration) {
      cs.resolved = false;
      cs.actionExpires = new Date(optional.duration + Date.now());
    }

    if (optional?.refID) {
      cs.refID = optional.refID;
    }

    cs.modID = _msg.author.id;
    cs.targetID = _target.id;

    this._case = cs;
  }

  public async execute(): Promise<any> {
    try {
      const failure = await this.prepare();
      if (failure !== null) return this._msg.util!.send(failure);
      await this.run();
      await this.finish();
      this._guild.lastCase!++;
      return null;
    } catch (err) {
      return this._msg.util!.send(`Uh-oh, something went wrong, go talk to someone about this error:\n${err}`);
    }
  }

  protected async prepare(): Promise<any> {
    if (this._dead) return 'Something went wrong at some point, there\'s likely more output above';
    if (!(this._target instanceof GuildMember)) return null;

    const targetCan = Number(permissionLevel(this._target));
    const modCan = Number(permissionLevel(this._mod));

    if (targetCan >= modCan) return `You can't ${Action.ACTIONS[this._case.action].toLowerCase()} that user, what are you doing?`;

    return null;
  }

  protected abstract async run(): Promise<any>;

  protected async finish(): Promise<any> {
    const settings = this._client.settings.get(this._guild.id);
    const { modLogsChannel } = settings || {};

    if (modLogsChannel) {
      const embed = Action.logCase(this._mod, (this._target instanceof GuildMember ? this._target.user : this._target), this._case);
      const channel = this._guild.channels.cache.get(modLogsChannel) as TextChannel | undefined;

      const id = await channel?.send(embed)
        .then(m => m.id)
        .catch(() => null);
      if (id) {
        this._case.message = id;
      }
    }

    return this._client.cases.save(this._case);
  }
}
