import { Command, Flag } from 'discord-akairo';
import { can, Permissions } from '../../../util/Util';
import { Message } from 'discord.js';

export default class CaseCommand extends Command {
  public constructor() {
    super('case', {
      aliases: ['case'],
      category: 'mod',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD, 'MANAGE_GUILD')
    });
  }

  public *args() {
    const operation = yield {
      type: [
        ['show'],
        ['delete']
      ],
      otherwise: (msg: Message) => {
        const prefix = this.client.settings.get(msg.guild!.id, 'prefix', process.env.COMMAND_PREFIX!);
        return `That is not a valid operation, please see the available ones using \`${prefix}help case\``;
      }
    };

    return Flag.continue(`case-${operation}`);
  }
}
