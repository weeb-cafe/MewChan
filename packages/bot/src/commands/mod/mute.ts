import { Command } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';
import { ms } from '@mewchan/common';
import { Message, GuildMember } from 'discord.js';
import MuteAction from '../../struct/actions/MuteAction';

export default class MuteCommand extends Command {
  public constructor() {
    super('mute', {
      aliases: ['mute'],
      category: 'mod',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD),
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: MESSAGES.COMMANDS.PROMPTS.MUTE_MEMBER
        },
        {
          id: 'duration',
          type: (_, phrase) => {
            if (!phrase) return null;

            const duration = ms(phrase);
            if (duration && duration >= 300000 && !isNaN(duration)) return duration;
            return null;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.MUTE_DURATION
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
      duration,
      nsfw,
      reason
    }: { member: GuildMember; ref: number; duration: number; nsfw: boolean; reason: string }
  ) {
    const error = await new MuteAction(msg, member, { reason, duration, refID: ref, nsfw }).execute();
    if (error) return msg.util!.send(`Something went wrong: \`${error}\``);
  }
}
