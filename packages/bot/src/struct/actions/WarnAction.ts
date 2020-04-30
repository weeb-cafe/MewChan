import Action from './Action';
import { Actions } from '@reika/common';
import { Message, GuildMember, User } from 'discord.js';

export default class WarnAction extends Action<Actions.WARN> {
  public constructor(
    msg: Message,
    target: GuildMember | User,
    optional?: {
      reason?: string;
      refID?: number;
    }
  ) {
    super(Actions.WARN, msg, target, optional);
  }

  protected async run() {
    return this.msg.channel.send(`Successfully warned ${this.targetUser.tag}`);
  }
}
