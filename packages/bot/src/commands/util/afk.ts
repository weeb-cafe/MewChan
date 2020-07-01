import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class AfkCommand extends Command {
  public constructor() {
    super('afk', {
      aliases: ['afk'],
      category: 'util',
      channel: 'guild',
      args: [
        {
          id: 'reason',
          type: 'string',
          match: 'rest'
        }
      ]
    });
  }

  public async exec(msg: Message, { reason }: { reason: string }) {
    await this.client.afkManager.add(msg, reason);
    return msg.util!.send('Okay, you\'re afk now.');
  }
}
