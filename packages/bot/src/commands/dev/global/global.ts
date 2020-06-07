import { Command, PrefixSupplier, Flag } from 'discord-akairo';
import { Message } from 'discord.js';

export default class GlobalCommand extends Command {
  public constructor() {
    super('global', {
      aliases: ['global'],
      category: 'dev',
      ownerOnly: true
    });
  }

  public *args() {
    const action = yield {
      type: [
        ['blacklist-guild'],
        ['unblacklist-guild'],
        ['blacklist-user'],
        ['unblacklist-user']
      ],
      otherwise: (msg: Message) => {
        const prefix = (this.client.commandHandler.prefix as PrefixSupplier)(msg);
        return `That is not a valid action, please see the available ones using \`${prefix}help global\``;
      }
    };

    return Flag.continue(`global-${action}`);
  }
}
