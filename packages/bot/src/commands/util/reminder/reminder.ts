import { Command, PrefixSupplier, Flag } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReminderCommand extends Command {
  public constructor() {
    super('reminder', {
      aliases: ['reminder'],
      category: 'util'
    });
  }

  public *args() {
    const operation = yield {
      type: [
        ['list'],
        ['show'],
        ['create'],
        ['delete']
      ],
      otherwise: (msg: Message) => {
        const prefix = (this.client.commandHandler.prefix as PrefixSupplier)(msg);
        return `That is not a valid operation, please see the available ones using \`${prefix}help reminder\``;
      }
    };

    return Flag.continue(`reminder-${operation}`);
  }
}
