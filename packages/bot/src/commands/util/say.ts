import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { can, Permissions } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';

export default class PingCommand extends Command {
  public constructor() {
    super('say', {
      aliases: ['say'],
      category: 'util',
      channel: 'guild',
      userPermissions: can(Permissions.ADMIN, 'MANAGE_GUILD'),
      clientPermissions: 'SEND_MESSAGES',
      args: [
        {
          id: 'data',
          match: 'rest',
          type: (_, phrase) => {
            try {
              return JSON.parse(phrase);
            } catch {
              return phrase;
            }
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.SAY
        }
      ]
    });
  }

  public async exec(msg: Message, { data }: { data: string | Record<string, unknown> }) {
    if (typeof data !== 'string' && !msg.guild!.me!.hasPermission('EMBED_LINKS')) {
      return msg.util!.send('I cannot send embeds into this channel');
    }

    return msg.util!.send(typeof data === 'string' ? data : { embed: data });
  }
}
