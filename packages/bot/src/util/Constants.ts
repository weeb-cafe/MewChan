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
  }
};

export const TOPICS = {
  DISCORD: {
    ERROR: (shard?: number | string) => `DISCORD${shard ? ` Shard ${shard}` : ''} ERROR`,
    WARN: 'DISCORD WARN'
  },
  UNHANDLED_REJECTION: 'UNHANDLED_REJECTION',
  BOT: {
    INIT: 'BOT INIT'
  }
};

export const LOGS = {
  LOADED: (str: string): [string, object] => [`${str} loaded`, { topic: TOPICS.BOT.INIT }],
  LOGIN: ['Client logged in', { topic: TOPICS.BOT.INIT }] as [string, object],
  UNHANDLED_REJECTION: (e: string): [string, object] => [e, { topic: TOPICS.UNHANDLED_REJECTION }]
};

export const QUERIES = {
  INIT_LAST_CASE: 'SELECT MAX(\'caseID\') FROM cases WHERE \'guildID\'=($1)'
};
