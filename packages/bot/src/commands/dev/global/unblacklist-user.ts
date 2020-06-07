import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';
import { MESSAGES } from '../../../util/Constants';

export default class GlobalUnblacklistUserCommand extends Command {
  public constructor() {
    super('global-unblacklist-user', {
      category: 'dev',
      args: [
        {
          id: 'user',
          type: 'user',
          prompt: MESSAGES.COMMANDS.PROMPTS.GLOBAL_UNBLACKLIST_USER
        }
      ]
    });
  }

  public async exec(msg: Message, { user }: { user: User }) {
    const res = await this.client.blacklistManager.deleteEntry(user.id);

    if (!res) return msg.util!.send('That user does not seem to be blacklisted');

    return msg.util!.send(`${user.tag} can use the bot again`);
  }
}
