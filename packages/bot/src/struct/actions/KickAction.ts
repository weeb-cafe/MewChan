import Action, { OptionalData } from './Action';
import { Actions } from '@reika/common';
import { Message, GuildMember } from 'discord.js';

export default class KickAction extends Action<Actions.KICK> {
  public constructor(
    msg: Message,
    target: GuildMember,
    optional?: OptionalData
  ) {
    super(Actions.KICK, msg, target, optional);
  }

  protected async prepare() {
    if (!(this.target as GuildMember).kickable) return 'I cannot kick this member.';
    return super.prepare();
  }

  protected async run() {
    const msg = await this.msg.channel.send(`Alright, booting ${this.targetUser.tag}.`);

    return (this.target as GuildMember)
      .kick(`${this.mod.user.tag} | ${this.case.reason || 'No reason provided.'}`)
      .then(() => msg.edit(`Boop, ${this.targetUser.tag} is gone.`));
  }
}
