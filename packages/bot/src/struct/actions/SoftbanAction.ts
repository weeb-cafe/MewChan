import CaseAction, { OptionalData } from './Action';
import { Message, GuildMember, User } from 'discord.js';
import { Actions } from '@reika/common';

export default class SoftbanAction extends CaseAction<Actions.SOFTBAN> {
  public readonly days: number;

  public constructor(
    msg: Message,
    target: GuildMember | User,
    optional: OptionalData & { days?: number }
  ) {
    super(Actions.SOFTBAN, msg, target, optional);
    this.days = optional.days ?? 1;
  }

  protected async prepare() {
    if (!this.guild.me!.hasPermission('BAN_MEMBERS')) return 'I am lacking the `BAN_MEMBERS` permission';
    if (this.target instanceof GuildMember && !this.target.manageable) return 'I cannot softban this person, sad';

    return super.prepare();
  }

  protected async run() {
    const { targetUser: user } = this;

    const msg = await this.msg.channel.send(`Oki doki.. banning ${user.tag}.`);
    const reason = `${this.mod.user.tag} | Softban: ${this.case.reason!}`;

    await this.guild.members.ban(user, { reason, days: this.days });
    await this.guild.members.unban(user, reason);

    return msg.edit(`Done, ${user.tag} went through the sad cicle of getting banned and unbanned.`);
  }
}
