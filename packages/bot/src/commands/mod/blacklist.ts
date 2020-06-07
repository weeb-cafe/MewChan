import { Command } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { Message, User } from 'discord.js';
import { Blacklist, BlacklistType } from '@mewchan/common';
import { MESSAGES } from '../../util/Constants';

export default class BlacklistCommand extends Command {
  public constructor() {
    super('blacklist', {
      aliases: ['blacklist'],
      category: 'mod',
      channel: 'guild',
      userPermissions: can(Permissions.MOD),
      args: [
        {
          id: 'user',
          type: 'user',
          match: 'content',
          prompt: MESSAGES.COMMANDS.PROMPTS.BLACKLIST
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
    entry.type = BlacklistType.USER;
    entry.reason = reason || 'No reason provided';

    await this.client.blacklistManager.addEntry(entry);

    return msg.util!.send(`${user.tag} can no longer use commands in this server`);
  }
}
