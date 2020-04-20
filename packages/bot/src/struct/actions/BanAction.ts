import Action, { OptionalData } from './Action';
import { Message, GuildMember, User } from 'discord.js';
import { Actions } from '@reika/common';
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
    if (!this.guild.me!.hasPermission('BAN_MEMBERS')) return `I am lacking the \`BAN_MEMBERS\` permission`;
    if (this.target instanceof GuildMember && !this.target.manageable) return 'I cannot ban this person, sad';

    const embed = await Action.logCase(this.mod, this.target instanceof GuildMember ? this.target.user : this.target, this.case);
    await this.msg.util!.sendNew(`Are you absolutely sure you want to do this? [y/n]`, embed);
    const confirmation = this.force
      ? null
      : await confirm(
        this.msg,
        'My advice? You should be more decisive. (ban cancelled)',
        'You sure you want to ban this [gender]? [y/n]',
        { embed }
      );

    if (confirmation !== null) return this.msg.util!.sendNew(confirmation);
    return super.prepare();
  }

  protected async run() {
    const user = this.target instanceof GuildMember ? this.target.user : this.target;
    const msg = await this.msg.util!.sendNew(`Okay, ${user.tag} will be thrown out`);

    return this.guild.members.ban(user, { reason: `${this.mod.user.tag} | ${this.case.reason!}`, days: this.days })
      .then(() => msg.util!.edit('I hope you\'re happy now'));
  }
}
