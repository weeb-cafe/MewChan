import { Command, Flag, PrefixSupplier } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { Message } from 'discord.js';

export default class SetCommand extends Command {
  public constructor() {
    super('set', {
      aliases: ['set', 'config'],
      category: 'config',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.ADMIN)
    });
  }

  public *args() {
    const variable = yield {
      type: [
        ['prefix'],
        ['autodel'],
        ['starThreshold'],
        ['starChannel'],
        ['modLogsChannel'],
        ['modMailChannel'],
        ['adminRole'],
        ['modRole'],
        ['muteRole']
      ],
      otherwise: (msg: Message) => {
        const prefix = (this.client.commandHandler.prefix as PrefixSupplier)(msg);
        return `That is not a valid variable, please see the available ones using \`${prefix}help set\``;
      }
    };

    return Flag.continue(`set-${variable}`);
  }
}
