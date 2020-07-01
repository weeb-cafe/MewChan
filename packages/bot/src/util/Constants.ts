import { Message, PermissionResolvable } from 'discord.js';
import { Permissions } from './Util';
import { stripIndents } from 'common-tags';

export const PRODUCTION = process.env.NODE_ENV === 'production';

export const COLORS = {
  BRAND: {
    BLUE: '#90d5ff'
  },
  MODMAIL: {
    GREEN: '#49ff64',
    YELLOW: '#ebff8b',
    RED: '#ff4b4f'
  }
};

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

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    HELP: {
      // #DEV
      EVAL: {
        content: 'Evaluates given Javascript expression',
        usage: '<code>',
        examples: ['this.client', 'msg.channel.send(\'boop da scoot\');']
      },
      RELOAD: {
        content: 'Reloads the commandHandler, the listenerHandler & the inhibitorHandler'
      },
      GLOBAL: {
        content: stripIndents`Possible Actions:
        • blacklist-guild <id> <...reason>
        • unblacklist-guild <id>
        • blacklist-user <id> <...reason>
        • unblacklist-user <id>
      `,
        usage: '<action> <...args>',
        examples: [
          'blacklist-guild 222078108977594368 i dont have a good reason lol',
          'unblacklist-guild 222078108977594368',
          'blacklist-user 223703707118731264 just imagine not being able to use your own bot OMEGALUL',
          'unblacklist-guild 222078108977594368'
        ]
      },
      GLOBAL_BLACKLIST_GUILD: {
        content: 'Blacklists a guild',
        usage: '<id> <...reason>',
        examples: ['450027243251695616 why not']
      },
      GLOBAL_UNBLACKLIST_GUILD: {
        content: 'Unblacklists a guild',
        usage: '<id>',
        examples: ['526906946209447939']
      },
      GLOBAL_BLACKLIST_USER: {
        content: 'Blacklists the given user, disallowing them from running commands globally',
        usage: '<user> <...reason>',
        examples: ['453961126351339530 imagine not being able to use the bot']
      },
      GLOBAL_UNBLACKLIST_USER: {
        content: 'Unblacklists the given user',
        usage: '<user>',
        examples: ['453961126351339530']
      },

      // #INFO
      PING: {
        content: 'Posts the current response time of the bot'
      },

      HELP: {
        content: 'What else, helps you!',
        usage: '[command]',
        examples: ['ban', 'case', 'case-delete']
      },

      // #UTIL
      SAY: {
        content: 'Make the bot send something',
        usage: '<json or content>',
        examples: ['hi!', '{ "description": "hi!", "title": "boop" }']
      },

      // #CONFIG
      SET: {
        content: stripIndents`Possible variables:
          • prefix <new prefix>
          • autodel
          • starThreshold <amount>
          • starChannel <channel>
          • modLogsChannel <channel>
          • modMailCategory <category>
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
      SET_PREFIX: {
        content: 'Sets the prefix for the server',
        parent: 'set'
      },
      SET_AUTODEL: {
        content: 'Toggles command auto deletion',
        parent: 'set'
      },
      SET_STAR_THRESHOLD: {
        content: 'Sets the star threshold',
        parent: 'set'
      },
      SET_STAR_CHANNEL: {
        content: 'Sets the starboard channel',
        parent: 'set'
      },
      SET_MOD_LOGS_CHANNEL: {
        content: 'Sets the mod logs channel',
        parent: 'set'
      },
      SET_MOD_MAIL_CATEGORY: {
        content: 'Sets the mod mail category',
        parent: 'set'
      },
      SET_ADMIN_ROLE: {
        content: 'Sets the admin role for the bot',
        parent: 'set'
      },
      SET_MOD_ROLE: {
        content: 'Sets the mod role for the bot',
        parent: 'set'
      },
      SET_MUTE_ROLE: {
        content: 'Sets the mute role the bot is going to use',
        parent: 'set'
      },

      CREATE_REACTION_ROLE: {
        content: 'Creates a new reaction role, whenever someone clicks on this reaction they get a role and vice versa',
        usage: '<emoji> <role> <message> [channel] [--unremoveable]',
        examples: ['👌 @Role 708659783141556276', ':hahaAFuny: 629305468673720350 708178952237088830 #welcome']
      },
      DELETE_REACTION_ROLE: {
        content: 'Deletes a reaction role',
        usage: '<emoji> <message> [channel]',
        examples: ['👌 708659783141556276', ':hahaAFuny: 708178952237088830 #welcome']
      },
      MARK_REACTION_GROUP: {
        content: 'Toggles whether or not a message\'s reaction roles are a group, meaning you can only pick ONE one of the roles',
        usage: '<message> [channel]',
        examples: ['2893721839712893721', '727813912460001342 #welcome']
      },

      // #MOD
      BAN: {
        content: 'Bans one more people from the server',
        usage: '<...users> [--days=number] [--ref=number] [--nsfw] [...reason]',
        exmaples: ['@didinele', '@Plushie dumb', '@Plushie @didinele plebs', '471289471289471 --days=1 uwu']
      },
      KICK: {
        content: 'Kicks someone from the server',
        usage: '<member> [--ref=number] [--nsfw] [...reason]',
        exmaples: ['@didinele', '@Plushie dumb']
      },
      MUTE: {
        content: 'Mute someone',
        usage: '<member> <duration> [--ref=number] [--nsfw] [...reason]',
        exmaples: ['@didinele 20m', '@Plushie 1d5h dumb']
      },
      SOFTBAN: {
        content: 'Bans, pruning messages, then unbans someone',
        usage: '<member> [--days=number] [--ref=number] [--nsfw] [...reason]',
        examples: ['@SpaceCats --days=5 naughty', '@Plushie bad boye']
      },
      UNBAN: {
        content: 'Unbans someone',
        usage: '<user> [--ref=number] [...reason]',
        examples: ['@Plushie uwu good boi', '@spaceCats --ref=10 reformed']
      },
      WARN: {
        content: 'Warns someone',
        usage: '<member> [--ref=number] [--nsfw] [...reason]',
        examples: ['@didinele yeah boi', '@Plushie --ref=1 --nsfw l-lewd']
      },
      HISTORY: {
        content: 'Views the history for a user',
        usage: '<user>',
        examples: ['1231234124219412', '@Plushie']
      },
      BLACKLIST: {
        content: 'Blocks someone from using commands from the bot',
        usage: '<user> <...reason>',
        examples: ['@didinele#0001 lolrekt', '248912678461247612 mod abuse tbh']
      },
      UNBLACKLIST: {
        content: 'Removes someone from the local blacklist',
        usage: '<user>',
        examples: ['@didinele#0001']
      },

      CASE: {
        content: stripIndents`Operates on a case. Current operations:
          • show <id>
          • delete <id>
        `,
        usage: '<operation> <id>',
        examples: ['show 10', 'delete 50']
      },
      CASE_SHOW: {
        content: 'Shows a case',
        usage: '<id>',
        examples: ['1000'],
        parent: 'case'
      },
      CASE_DELETE: {
        content: 'Deletes a case, reverting mutes and bans, cleansing said record off of users, so on',
        usage: '<id>',
        examples: ['latest', '10'],
        parent: 'case'
      },

      // #MODMAIL
      TICKET: {
        content: stripIndents`Possible actions:
        • submit <server> <...content>
        • close <id> [--resolve]
        • get <id>
        `,
        usage: '<action> <...data>',
        examples: [
          'submit LeagueHub Hi! The user didinele#0001 (223703707118731264) is being a total idiot.',
          'submit 23812938129839128312 Hi, could you guys add an LFG channel?'
        ]
      },
      TICKET_SUBMIT: {
        content: 'Submits a ticket',
        parent: 'ticket'
      },
      TICKET_CLOSE: {
        content: 'Closes a ticket',
        parent: 'ticket'
      },
      TICKET_GET: {
        content: 'Gets a ticket',
        parent: 'ticket'
      }
    } as { [key: string]: Help },

    PROMPTS: {
      // #DEV
      EVAL: {
        start: 'What do you wanna run?'
      },
      GLOBAL_BLACKLIST_GUILD: {
        start: 'What guild would you like me to block?',
        retry: 'Please provide a valid guild'
      },
      GLOBAL_UNBLACKLIST_GUILD: {
        start: 'What guild would like me to unblock?',
        retry: 'Please provide a valid guild'
      },
      GLOBAL_BLACKLIST_USER: {
        start: 'Who do you want to blacklist?',
        retry: 'Please provide a valid user'
      },
      GLOBAL_UNBLACKLIST_USER: {
        start: 'Who do you want me to unblacklist?',
        retry: 'Please provide a valid user'
      },

      // #UTIL
      SAY: {
        start: 'Please give me something to send'
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
      MOD_MAIL_CATEGORY: {
        start: 'What should be the new mod mail category?',
        retry: 'Please provide a valid category'
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

      CREATE_REACTION_ROLE_EMOJI: {
        start: 'What emoji would you like to use?'
      },
      CREATE_REACTION_ROLE_ROLE: {
        start: 'Which role would you like to assign for this emoji?',
        retry: 'Please provide a valid role'
      },
      CREATE_REACTION_ROLE_MESSAGE: {
        start: 'Which message would you like to use?',
        retry: 'Please provide a valid message in the given text channel'
      },
      DELETE_REACTION_ROLE_EMOJI: {
        start: 'What emoji are you targetting?',
        retry: 'Please provide a valid emoji on the target message'
      },
      DELETE_REACTION_ROLE_MESSAGE: {
        start: 'Which message would you like to delete from?',
        retry: 'Please provide a valid message in the given text channeld'
      },
      MARK_REACTION_GROUP: {
        start: 'Which message\'s reaction roles do you want to mark/unmark as a group?',
        retry: 'Please provide a valid message in the given channel'
      },

      // #MOD
      KICK: {
        start: 'Who do you want me to kick?',
        retry: 'Please provide a valid member'
      },
      MUTE_MEMBER: {
        start: 'Who do you want me to mute?',
        retry: 'Please provide a valid member'
      },
      MUTE_DURATION: {
        start: 'How long would you like me to mute this user for?',
        retry: 'Please provide a valid amount of 5 minutes or more'
      },
      SOFTBAN: {
        start: 'Who do you want me to softban?',
        retry: 'Please provide a valid member'
      },
      UNBAN: {
        start: 'Who do you want me to unban?',
        retry: 'Please provide a valid user'
      },
      WARN: {
        start: 'Who do you want me to warn?',
        retry: 'Please provide a valid member'
      },
      BLACKLIST: {
        start: 'Who would you like to blacklist?',
        retry: 'Please provide a valid member'
      },
      UNBLACKLIST: {
        start: 'Who would you like to free?',
        retry: 'Please provide a valid user'
      },

      CASE_SHOW: {
        start: 'Which case would you like to see?',
        rety: 'Please provide a valid case'
      },
      CASE_DELETE: {
        start: 'Which case would you like to delete?',
        retry: 'Please provide a valid case'
      },

      // #MODMAIL
      TICKET_SUBMIT_GUILD: {
        start: 'What server is this ticket targetted to?',
        retry: 'Please provide a valid server'
      },
      TICKET_CLOSE_TICKET: {
        start: 'What ticket should be closed?',
        retry: 'Please provide an existing ticket that belongs to this server'
      },
      TICKET_GET_TICKET: {
        start: 'What ticket do you want me to get?',
        retry: 'Please provide a valid ticket that you can actually get'
      }
    }
  },

  CASES: {
    DEFAULTS: {
      REASON: (prefix: string, id: string | number) =>
        `No reason has been set for this action, highly recommend setting one with \`${prefix}cases reason ${id} <...>\``
    }
  }
};

export const PERMISSIONS = [
  'NONE',
  'MOD',
  'ADMIN',
  'OWNER',
  'DEV'
];

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
  },
  TASK: {
    WARN: 'TASK WARN'
  }
};

export const LOGS = {
  LOADED: (str: string): [string, Record<string, unknown>] => [`${str} loaded`, { topic: TOPICS.BOT.INIT }],
  LOGIN: ['Client logged in', { topic: TOPICS.BOT.INIT }] as [string, Record<string, unknown>],
  UNHANDLED_REJECTION: (e: string): [string, Record<string, unknown>] => [e, { topic: TOPICS.UNHANDLED_REJECTION }],
  WEIRD_CAN: (
    meta: { msg: Message; level: Permissions; permission?: PermissionResolvable | PermissionResolvable[] }
  ): [string, Record<string, unknown>] => [
    'Odd permission verification occured, aborting',
    {
      topic: TOPICS.BOT.WARN,
      ...meta
    }
  ]
};
