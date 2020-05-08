import { Command } from 'discord-akairo';
import { GuildMember, Message } from 'discord.js';
import WarnAction from '../../struct/actions/WarnAction';
import { MESSAGES } from '../../util/Constants';
import { can, Permissions } from '../../util/Util';

export default class WarnCommand extends Command {
  public constructor() {
    super('warn', {
      aliases: ['warn'],
      category: 'mod',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD),
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: MESSAGES.COMMANDS.PROMPTS.WARN
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
    const error = await new WarnAction(msg, member, { reason, nsfw, refID: ref }).execute();
    if (error) return msg.util!.send(`Something went wrong: \`${error}\``);
  }
}
