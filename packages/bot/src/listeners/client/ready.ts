import { Listener } from 'discord-akairo';
import { LOGS } from '../../util/Constants';

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
      // ? Anything that needs to be fetched on startup should go here
      const [lastCase] = await Promise.all([
        await this.client.cases.findOne({
          where: { guildID: guild.id },
          order: { caseID: 'DESC' }
        }).then(d => d?.caseID ?? 0).catch(() => 0)
      ]);

      guild.lastCase = lastCase;
    }
  }
}
