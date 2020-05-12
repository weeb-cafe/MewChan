import { Command, Argument } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';
import { Message, GuildMember } from 'discord.js';
import SoftbanAction from '../../struct/actions/SoftbanAction';

export default class SoftbanCommand extends Command {
  public constructor() {
    super('softban', {
      aliases: ['softban'],
      category: 'mod',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD, 'KICK_MEMBERS'),
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: MESSAGES.COMMANDS.PROMPTS.SOFTBAN
        },
        {
          'id': 'days',
          'type': Argument.range('integer', 1, 7),
          'match': 'option',
          'flag': ['--days=', '-d='],
          'default': 1
        },
        {
          id: 'ref',
          type: 'integer',
          match: 'option',
          flag: ['--ref=', '-r=']
        },
        {
          id: 'nsfw',
          match: 'flag',
          flag: ['--nsfw']
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
      member,
      days,
      ref,
      nsfw,
      reason
    }: { member: GuildMember; days: number; ref: number; nsfw: boolean; reason: string }
  ) {
    const error = await new SoftbanAction(msg, member, { reason, days, refID: ref, nsfw }).execute();
    if (error) return msg.util!.send(`Something went wrong: \`${error}\``);
  }
}
