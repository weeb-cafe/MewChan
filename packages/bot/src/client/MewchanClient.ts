// TODO: REDIS

import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler
} from 'discord-akairo';
import {
  Case,
  Blacklist,
  Reaction,
  Scheduler,
  createLogger,
  Actions
} from '@mewchan/common';
import SettingsProvider from '../struct/SettingsProvider';
import database from '../struct/Database';
import { Connection, Repository } from 'typeorm';
import { Message } from 'discord.js';
import { join } from 'path';
import { Logger } from 'winston';
// import redisClient from '../struct/Redis';
// import { Redis } from 'ioredis';
import { LOGS, PRODUCTION, MESSAGES } from '../util/Constants';

declare module 'discord-akairo' {
  export interface AkairoClient {
    inhibitorHandler: InhibitorHandler;
    listenerHandler: ListenerHandler;
    commandHandler: CommandHandler;
    scheduler: Scheduler;
    db: Connection;
    settings: SettingsProvider;
    cases: Repository<Case<Actions>>;
    blacklist: Repository<Blacklist>;
    reactions: Repository<Reaction>;
    logger: Logger;
    // redis: Redis;
  }
}

export default class MewchanClient extends AkairoClient {
  // public redis = redisClient;

  public scheduler: Scheduler = new Scheduler(
    [this],
    { directory: join(__dirname, '..', 'tasks') }
  );

  public inhibitorHandler: InhibitorHandler = new InhibitorHandler(
    this,
    { directory: join(__dirname, '..', 'inhibitors') }
  );

  public listenerHandler: ListenerHandler = new ListenerHandler(
    this,
    { directory: join(__dirname, '..', 'listeners') }
  );

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, '..', 'commands'),
    prefix: (msg: Message) => this.settings.get(msg.guild!.id, 'prefix', process.env.COMMAND_PREFIX!),
    aliasReplacement: /-/g,
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 3000,
    argumentDefaults: {
      prompt: {
        modifyStart: (_, str) => MESSAGES.COMMANDS.DEFAULTS.PROMPT.MODIFY_START_OR_RETRY(str),
        modifyRetry: (_, str) => MESSAGES.COMMANDS.DEFAULTS.PROMPT.MODIFY_START_OR_RETRY(str),
        timeout: MESSAGES.COMMANDS.DEFAULTS.PROMPT.TIMEOUT,
        ended: MESSAGES.COMMANDS.DEFAULTS.PROMPT.ENDED,
        cancel: MESSAGES.COMMANDS.DEFAULTS.PROMPT.CANCEL,
        retries: 3,
        time: 30000
      },
      otherwise: MESSAGES.COMMANDS.DEFAULTS.OTHERWISE
    }
  });

  public constructor() {
    super({
      ownerID: process.env.OWNER!.split(',')
    }, {
      disableMentions: 'everyone',
      partials: ['MESSAGE', 'REACTION']
    });
  }

  private async init() {
    this.logger = await createLogger('MewChan BOT', process.env.LOGGER_HOST!, process.env.LOGGER_ID!, process.env.LOGGER_TOKEN!);

    process.on('unhandledRejection', (err: any) => {
      this.logger.info(...LOGS.UNHANDLED_REJECTION(err.stack));

      /**
       * ? Unhandled promise rejections are long deprecated anyway and at some point will begin naturally killing the process
       * ? for now we do this
       */
      if (PRODUCTION) process.exit(1);
    });

    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    });

    this.commandHandler.loadAll();
    this.logger.info(...LOGS.LOADED('CommandHandler'));
    this.inhibitorHandler.loadAll();
    this.logger.info(...LOGS.LOADED('InhibitorHandler'));
    this.listenerHandler.loadAll();
    this.logger.info(...LOGS.LOADED('ListenerHandler'));
    await this.scheduler.loadAll();
    this.logger.info(...LOGS.LOADED('Scheduler'));

    this.db = database.get('mewchan');

    await this.db.connect();
    await this.db.synchronize();

    this.logger.info(...LOGS.LOADED('Database'));

    this.settings = new SettingsProvider(this.db);
    await this.settings.init();

    this.logger.info(...LOGS.LOADED('Settings'));

    this.cases = this.db.getRepository(Case);
    this.blacklist = this.db.getRepository(Blacklist);
    this.reactions = this.db.getRepository(Reaction);

    this.logger.info(...LOGS.LOADED('Database shortcuts'));
  }

  public async start() {
    await this.init();
    return this.login(process.env.DISCORD_TOKEN);
  }
}
