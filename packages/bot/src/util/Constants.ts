import { Message, PermissionResolvable } from 'discord.js';
import { Permissions } from './Util';

export const PRODUCTION = process.env.NODE_ENV === 'production';

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

    EVAL: {
      content: 'Evaluates given Javascript expression',
      usage: '<code>',
      examples: ['this.client', 'msg.channel.send(\'boop da scoot\');']
    },
    PING: {
      content: 'Posts the current response time of the bot'
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
