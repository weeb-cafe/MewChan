import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../../util/Constants';

export default class GlobalUnblacklistGuildCommand extends Command {
  public constructor() {
    super('global-unblacklist-guild', {
      category: 'dev',
      args: [
        {
          id: 'id',
          type: 'string',
          prompt: MESSAGES.COMMANDS.PROMPTS.GLOBAL_UNBLACKLIST_GUILD
        }
      ]
    });
  }

  public async exec(msg: Message, { id }: { id: string }) {
    const res = await this.client.blacklistManager.deleteEntry(id);

    if (!res) return msg.util!.send('That guild does not seem to be blacklisted');

    const guild = this.client.guilds.cache.get(id);
    return msg.util!.send(`${guild?.name ?? 'Unknown name'} (${id}) can use the bot once again`);
  }
}
