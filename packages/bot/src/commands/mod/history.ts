import { Command } from 'discord-akairo';
import { Message, User } from 'discord.js';
import Action from '../../struct/actions/Action';
import { permissionLevel, Permissions } from '../../util/Util';

export default class CaseShowCommand extends Command {
  public constructor() {
    super('history', {
      category: 'mod',
      channel: 'guild',
      aliases: ['history'],
      args: [
        {
          'id': 'user',
          'type': 'user',
          'default': (msg: Message) => msg.author
        }
      ]
    });
  }

  public async exec(msg: Message, { user }: { user: User }) {
    if (permissionLevel(msg.member!) === Permissions.NONE) user = msg.author;

    const embed = await Action.history(user, msg.guild!, false);
    return msg.util!.send(embed);
  }
}
