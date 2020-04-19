import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
  public constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      category: 'client'
    });
  }

  public async exec() {
    this.client.logger.info('Client logged in', { topic: 'BOT INIT' });

    for (const guild of this.client.guilds.cache.values()) {
      guild.lastCase = await this.client.cases
        .query('SELECT MAX(\'caseID\') FROM cases WHERE \'guildID\'=($1)', [guild.id])
        .then(d => d[0]?.max ?? 0);
    }
  }
}
