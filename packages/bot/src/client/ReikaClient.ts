import {
  AkairoClient,
  CommandHandler,
  InhibitorHandler,
  ListenerHandler
} from 'discord-akairo';
import {
  Setting,
  Case,
  Scheduler,
  createLogger,
  Actions
} from '@reika/common';
import SettingsProvider from '../struct/SettingsProvider';
import database from '../struct/Database';
import { Connection, Repository } from 'typeorm';
import { Message } from 'discord.js';
import { join } from 'path';
import redisClient from '../struct/Redis';
import { Redis } from 'ioredis';

const logger = createLogger('bot');

declare module 'discord-akairo' {
  export interface AkairoClient {
    inhibitorHandler: InhibitorHandler;
    listenerHandler: ListenerHandler;
    commandHandler: CommandHandler;
    scheduler: Scheduler;
    db: Connection;
    settings: SettingsProvider;
    cases: Repository<Case<Actions>>;
    logger: typeof logger;
    redis: Redis;
  }
}

export default class ChikaClient extends AkairoClient {
  public logger = logger;

  public redis = redisClient;

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
    prefix: (msg: Message) => this.settings.get(
      msg.guild!.id,
      'prefix',
      process.env.COMMAND_PREFIX!
    ),
    aliasReplacement: /-/g,
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 3000,
    argumentDefaults: {
      prompt: {
        modifyStart: (_, str) => `${str}\n\nType \`cancel\` to cancel the command.`,
        modifyRetry: (_, str) => `${str}\n\nType \`cancel\` to cancel the command.`,
        timeout: 'You\'re a little bit too slow, the command has been cancelled.',
        ended: 'I\'ll give you a Cola if you get it right next time.',
        cancel: 'Alright! I won\'t run the commmand.',
        retries: 3,
        time: 30000
      },
      otherwise: ''
    }
  });

  public constructor() {
    super({
      ownerID: process.env.OWNER!.split(',')
    }, {
      disableMentions: 'everyone'
    });

    if (process.env.NODE_ENV !== 'PRODUCTION') {
      process.on('unhandledRejection', (err: any) => this.logger.error(err.stack, { topic: 'UNHANDLED REJECTION' }));
    }
  }

  private async init() {
    this.commandHandler
      .useInhibitorHandler(this.inhibitorHandler)
      .useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      inhibitorHandler: this.inhibitorHandler,
      listenerHandler: this.listenerHandler
    });

    this.commandHandler.loadAll();
    this.logger.info('CommandHandler loaded', { topic: 'BOT INIT' });
    this.inhibitorHandler.loadAll();
    this.logger.info('InhibitorHandler loaded', { topic: 'BOT INIT' });
    this.listenerHandler.loadAll();
    this.logger.info('ListenerHandler loaded', { topic: 'BOT INIT' });
    await this.scheduler.init();
    this.logger.info('Scheduler loaded', { topic: 'BOT INIT' });

    this.db = database.get('chika');

    await this.db.connect();
    await this.db.synchronize();

    this.settings = new SettingsProvider(this.db.getRepository(Setting));
    await this.settings.init();

    this.logger.info('Settings loaded', { topic: 'BOT INIT' });

    this.cases = this.db.getRepository(Case);

    this.logger.info('Repository shortcuts defined', { topic: 'BOT INIT' });
  }

  public async start() {
    await this.init();
    return this.login(process.env.DISCORD_TOKEN);
  }
}
