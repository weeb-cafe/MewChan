import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../../util/Constants';
import { Blacklist, BlacklistType } from '@mewchan/common';

export default class GlobalBlacklistGuildCommand extends Command {
  public constructor() {
    super('global-blacklist-guild', {
      category: 'dev',
      args: [
        {
          id: 'id',
          type: 'string',
          prompt: MESSAGES.COMMANDS.PROMPTS.GLOBAL_BLACKLIST_GUILD
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest'
        }
      ]
    });
  }

  public async exec(msg: Message, { id, reason }: { id: string; reason: string }) {
    console.log(id, reason);
    const entry = new Blacklist();
    entry.id = id;
    entry.type = BlacklistType.GUILD;
    entry.reason = reason || 'No reason provided';

    await this.client.blacklistManager.addEntry(entry);

    const guild = this.client.guilds.cache.get(id);

    return msg.util!.send(`${guild?.name ?? 'Unknown name'} (${id}) can no longer use the bot`);
  }
}
