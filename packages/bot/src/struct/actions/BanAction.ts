import Action, { OptionalData } from './Action';
import { Message, GuildMember, User } from 'discord.js';
import { Actions } from '@mewchan/common';
import { confirm } from '../../util/Util';

export default class BanAction extends Action<Actions.BAN> {
  public readonly days?: number;
  public readonly force: boolean;

  public constructor(
    msg: Message,
    target: GuildMember | User,
    optional?: OptionalData & { days?: number; force?: boolean }
  ) {
    super(Actions.BAN, msg, target, optional);
    this.days = optional?.days;
    this.force = optional?.force ?? false;
  }

  protected async prepare() {
    if (!this.guild.me!.hasPermission('BAN_MEMBERS')) return 'I am lacking the `BAN_MEMBERS` permission';
    let member = this.target instanceof GuildMember ? this.target : null;
    if (!member) member = this.guild.members.cache.get(this.target.id) ?? null;
    if (member && !member.bannable) return 'I cannot ban this person, sad';

    const embed = await Action.history(this.targetUser, this.guild, this.nsfw);
    const confirmation = this.force
      ? null
      : await confirm(
        this.msg,
        'My advice? You should be more decisive. (ban cancelled)',
        'You sure you want to ban this [gender]? [y/n]',
        { embed }
      );

    if (confirmation !== null) return confirmation;
    return super.prepare();
  }

  protected async run() {
    const { targetUser: user } = this;
    const msg = !this.force ? await this.msg.channel.send(`Okay, ${user.tag} will be thrown out`) : null;

    return this.guild.members
      .ban(user, { reason: `${this.mod.user.tag} | ${this.case.reason!}`, days: this.days })
      .then(() => msg?.edit('I hope you\'re happy now'));
  }
}
