import { Listener } from 'discord-akairo';
import { LOGS, QUERIES } from '../util/Constants';

export default class ReadyListener extends Listener {
  public constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      category: 'client'
    });
  }

  public async exec() {
    this.client.logger.info(...LOGS.LOGIN);

    for (const guild of this.client.guilds.cache.values()) {
      guild.lastCase = await this.client.cases
        .query(QUERIES.INIT_LAST_CASE, [guild.id])
        .then(d => d[0]?.max ?? 0);
    }
  }
}
