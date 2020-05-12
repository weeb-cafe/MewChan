import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class PingCommand extends Command {
  public constructor() {
    super('ping', {
      aliases: ['ping', 'pong'],
      category: 'info'
    });
  }

  public async exec(msg: Message) {
    const m = await msg.util!.send('Let\'s see..');

    return msg.util!.send(stripIndents`
      Pong! Responded in ${(m.editedTimestamp || m.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)}ms
      Gateway is beating at ${Math.round(this.client.ws.ping)}ms.
    `);
  }
}
