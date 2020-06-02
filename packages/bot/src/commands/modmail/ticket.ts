import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { Message } from 'discord.js';

export default class TicketCommand extends Command {
  public constructor() {
    super('ticket', {
      aliases: ['ticket'],
      category: 'modmail'
    });
  }

  public *args() {
    const action = yield {
      type: [
        ['submit'],
        ['close']
      ],
      otherwise: (msg: Message) => {
        const prefix = (this.client.commandHandler.prefix as PrefixSupplier)(msg);
        return `That is not a valid action, please see the available ones using \`${prefix}help ticket\``;
      }
    };

    return Flag.continue(`ticket-${action}`);
  }
}
