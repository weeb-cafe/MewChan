import { Command } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';
import { Message, GuildMember } from 'discord.js';
import KickAction from '../../struct/actions/KickAction';

export default class KickCommand extends Command {
  public constructor() {
    super('kick', {
      aliases: ['kick', 'boot'],
      category: 'mod',
      channel: 'guild',
      userPermissions: can(Permissions.MOD, 'KICK_MEMBERS'),
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: MESSAGES.COMMANDS.PROMPTS.KICK
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
      ref,
      nsfw,
      reason
    }: { member: GuildMember; ref: number; nsfw: boolean; reason: string }
  ) {
    const error = await new KickAction(msg, member, { reason, refID: ref, nsfw }).execute();
    if (error) return msg.util!.send(`Something went wrong: \`${error}\``);
  }
}
