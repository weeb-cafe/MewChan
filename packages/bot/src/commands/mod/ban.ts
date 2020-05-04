import { Command, Argument, FailureData } from 'discord-akairo';
import { can, Permissions, confirm } from '../../util/Util';
import { User, GuildMember, Message } from 'discord.js';
import { stripIndents } from 'common-tags';
import BanAction from '../../struct/actions/BanAction';

export default class BanCommand extends Command {
  public constructor() {
    super('ban', {
      aliases: ['ban', 'bean'],
      category: 'mod',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD, 'BAN_MEMBERS')
    });
  }

  public *args() {
    const users: User[] = [];
    let current: User | null = null;
    let reason = '';

    do {
      const user: User | string = yield {
        'type': async (_: Message, phrase: string) => {
          if (!phrase) return null;

          const user = this.client.users.cache.get(phrase) ?? this.client.users.cache.find(u => {
            if (u.id === phrase) return true;

            const match = /<@!?(\d{17,19})>/.exec(phrase);
            if (u.id === match?.[1]) return true;

            return false;
          });

          return user ?? this.client.users.fetch(phrase).catch(() => null);
        },
        'default': (_: Message, data: FailureData) => data.phrase
      };

      if (typeof user === 'string') {
        current = null;
        reason += user;
      } else {
        current = user instanceof GuildMember ? user.user : user;
        users.push(current);
      }
    } while (current);

    // Not to be mistaken with ban time, sep command for that; this is for how many days worth of messages to delete (discord feature)
    const days = yield {
      'type': Argument.range('integer', 1, 7),
      'match': 'option',
      'flag': ['--days=', '-d='],
      'default': 7
    };

    const ref = yield {
      type: 'integer',
      match: 'option',
      flag: ['--ref=', '-r=']
    };

    const nsfw = yield {
      match: 'flag',
      flag: ['--nsfw']
    };

    const extraReason: string = yield {
      'type': 'string',
      'match': 'rest',
      'default': ''
    };

    reason += `${reason.length && extraReason.length ? ' ' : ''}${extraReason}`;

    return {
      users,
      days,
      ref,
      nsfw,
      reason
    };
  }

  public async exec(
    msg: Message,
    {
      users,
      days,
      ref,
      nsfw,
      reason
    }: { users: User[]; days: number; ref: number; nsfw: boolean; reason: string }
  ) {
    if (!users.length) return msg.util!.send('No valid users found, aborting. Please only use IDs and mentions');
    const force = users.length > 1;

    const confirmation = force
      ? await confirm(
        msg,
        'My advice? You should be more decisive. (ban cancelled)',
        `Are you sure you want to ban the following users: \`${users.map(u => u.tag).join(', ')}\`? [y/n]`
      )
      : null;

    if (confirmation !== null) return msg.channel.send(confirmation);

    const died: string[] = [];
    const lived: string[] = [];

    for (const user of users) {
      const error = await new BanAction(msg, user, { days, reason, refID: ref, nsfw, force }).execute();
      if (!force && error) return msg.util!.send(`Something went wrong: \`${error}\``);

      if (error !== null) lived.push(`${user.tag} (${user.id}): ${error}`);
      else died.push(user.tag);
    }

    let str = '';

    if (died.length) str += `Done, banned \`${lived.join(', ')}\``;
    if (lived.length) {
      str += stripIndents`${str.length ? '\n' : ''}Oops, the following incidents occured (those users were either not banned or something else went wrong):
        ${lived.join('\n')}
      `;
    }

    return msg.util!.send(str);
  }
}
