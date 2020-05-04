import { Message, PermissionResolvable } from 'discord.js';
import { Permissions } from './Util';
import { stripIndents } from 'common-tags';

export const PRODUCTION = process.env.NODE_ENV === 'production';

interface Help {
  content: string;
  usage?: string;
  examples?: string[];
  parent?: string;
}

export const MESSAGES = {
  COMMANDS: {
    DEFAULTS: {
      PROMPT: {
        MODIFY_START_OR_RETRY: (str: string) => `${str}\n\nFeel free to cancel the command by typing \`cancel\``,
        TIMEOUT: 'What are you, a snail? The command has been cancelled',
        ENDED: 'Are you okay? How did you not get it right in 3 attempts?',
        CANCEL: 'Okay, I won\'t do whatever you wanted me to do'
      },
      OTHERWISE: ''
    },

    HELP: {
      // #DEV
      EVAL: {
        content: 'Evaluates given Javascript expression',
        usage: '<code>',
        examples: ['this.client', 'msg.channel.send(\'boop da scoot\');']
      },

      // #INFO
      PING: {
        content: 'Posts the current response time of the bot'
      },

      // #CONFIG
      SET: {
        content: stripIndents`Possible variables:
          • prefix <new prefix>
          • autodel
          • starThreshold <amount>
          • starChannel <channel>
          • modLogsChannel <channel>
          • adminRole <role>
          • modRole <role>
          • muteRole <role>
        `,
        usage: '<variable> <value>',
        examples: [
          'prefix !',
          'autodel',
          'starThreshold 5',
          'starChannel #starboard',
          'modLogsChannel 3491827389127312',
          'adminRole @Admins',
          'modRole 23489721389721321',
          'muteRole muted'
        ]
      },
      PREFIX: {
        content: 'Sets the prefix for the server',
        usage: '<new prefix>',
        parent: 'set'
      },
      AUTODEL: {
        content: 'Toggles command auto deletion'
      },
      STAR_THRESHOLD: {
        content: 'Sets the star threshold'
      },
      STAR_CHANNEL: {
        content: 'Sets the starboard channel'
      },
      MOD_LOGS_CHANNEL: {
        content: 'Sets the mod logs channel'
      },
      ADMIN_ROLE: {
        content: 'Sets the admin role for the bot'
      },
      MOD_ROLE: {
        content: 'Sets the mod role for the bot'
      },
      MUTE_ROLE: {
        content: 'Sets the mute role the bot is going to use'
      },

      // #MOD
      BAM: {
        content: 'Bans one more people from the server',
        usage: '<...users> [--days=number] [--ref=number] [--nsfw] [...reason]',
        exmaples: ['@didinele', '@Plushie dumb', '@Plushie @didinele plebs', '471289471289471 --days=1 uwu']
      },
      KICK: {
        content: 'Kicks someone from the server',
        usage: '<user> [--ref=number] [--nsfw] [...reason]',
        exmaples: ['@didinele', '@Plushie dumb']
      }
    } as { [key: string]: Help },

    PROMPTS: {
      // #DEV
      EVAL: {
        start: 'What do you wanna run?'
      },

      // #CONFIG
      PREFIX: {
        start: 'What should be the new prefix?',
        retry: 'Please enter a valid prefix'
      },
      STAR_THRESHOLD: {
        start: 'What should be the new star threshold?',
        retry: 'That doesn\'t look like a valid number, could you try again?'
      },
      STAR_CHANNEL: {
        start: 'What should be the new star channel?',
        retry: 'That doesn\'t seem like a valid text channel, try again, please'
      },
      MOD_LOGS_CHANNEL: {
        start: 'What should be the new mod logs channel?',
        retry: 'Please provide a valid text channel'
      },
      ADMIN_ROLE: {
        start: 'What role do you want to represent your admins?',
        retry: 'Please provide a valid role'
      },
      MOD_ROLE: {
        start: 'What role do you want to represent your mods?',
        retry: 'Please provide a valid role'
      },
      MUTE_ROLE: {
        start: 'What role do you want me to use for mutes?',
        retry: 'Please provide a valid role'
      },

      // #MOD
      KICK: {
        start: 'Who do you want me to kick?',
        retry: 'Please provide a valid member'
      }
    }
  },

  CASES: {
    DEFAULTS: {
      REASON: (prefix: string, id: string | number) =>
        `No reason has been set for this action, highly recommend setting one with ${prefix}cases reason ${id} <...>`
    }
  }
};

export const PERMISSIONS = {
  0: 'NONE',
  1: 'MOD',
  2: 'ADMIN',
  3: 'OWNER',
  4: 'DEV'
};

export const TOPICS = {
  DISCORD: {
    ERROR: (shard?: number | string) => `DISCORD${shard ? ` Shard ${shard}` : ''} ERROR`,
    WARN: 'DISCORD WARN'
  },
  UNHANDLED_REJECTION: 'UNHANDLED_REJECTION',
  BOT: {
    INIT: 'BOT INIT',
    WARN: 'BOT WARN',
    ERROR: 'BOT ERROR'
  }
};

export const LOGS = {
  LOADED: (str: string): [string, object] => [`${str} loaded`, { topic: TOPICS.BOT.INIT }],
  LOGIN: ['Client logged in', { topic: TOPICS.BOT.INIT }] as [string, object],
  UNHANDLED_REJECTION: (e: string): [string, object] => [e, { topic: TOPICS.UNHANDLED_REJECTION }],
  WEIRD_CAN: (meta: { msg: Message; level: Permissions; permission?: PermissionResolvable | PermissionResolvable[]}): [string, object] => [
    'Odd permission verification occured, aborting',
    {
      topic: TOPICS.BOT.WARN,
      ...meta
    }
  ]
};

export const QUERIES = {
  INIT_LAST_CASE: 'SELECT MAX(\'caseID\') FROM cases WHERE \'guildID\'=($1)'
};
