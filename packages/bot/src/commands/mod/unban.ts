import { Command } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';
import { Message, User } from 'discord.js';
import UnbanAction from '../../struct/actions/UnbanAction';

export default class UnbanCommand extends Command {
  public constructor() {
    super('unban', {
      aliases: ['unban'],
      category: 'mod',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD, 'BAN_MEMBERS'),
      args: [
        {
          id: 'user',
          type: (_, phrase) => this.client.users.fetch(phrase).catch(() => null),
          prompt: MESSAGES.COMMANDS.PROMPTS.UNBAN
        },
        {
          id: 'ref',
          type: 'integer',
          match: 'option',
          flag: ['--ref=', '-r=']
        },
        {
          'id': 'reason',
          'match': 'rest',
          'type': 'string',
          'default': ''
        }
      ]
    });
  }

  public async exec(
    msg: Message,
    {
      user,
      ref,
      reason
    }: { user: User; ref: number; reason: string }
  ) {
    const error = await new UnbanAction(msg, user, { reason, refID: ref }).execute();
    if (error) return msg.util!.send(`Something went wrong: \`${error}\``);
  }
}
