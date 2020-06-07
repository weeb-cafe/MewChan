import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';
import { MESSAGES } from '../../../util/Constants';
import { Blacklist, BlacklistType } from '@mewchan/common';

export default class GlobalBlacklistUserCommand extends Command {
  public constructor() {
    super('global-blacklist-user', {
      category: 'dev',
      args: [
        {
          id: 'user',
          type: 'user',
          prompt: MESSAGES.COMMANDS.PROMPTS.GLOBAL_BLACKLIST_USER
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest'
        }
      ]
    });
  }

  public async exec(msg: Message, { user, reason }: { user: User; reason: string }) {
    const entry = new Blacklist();
    entry.id = user.id;
    entry.guildID = msg.guild!.id;
    entry.type = BlacklistType.USER_GLOBAL;
    entry.reason = reason || 'No reason provided';

    await this.client.blacklistManager.addEntry(entry);

    return msg.util!.send(`${user.tag} can no longer use commands.`);
  }
}
