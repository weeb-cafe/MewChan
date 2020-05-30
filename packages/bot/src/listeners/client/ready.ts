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
      const options = {
        where: {
          guildID: guild.id
        }
      };

      const [lastCase, lastTicket] = await Promise.all([
        await this.client.cases.findOne({
          ...options,
          order: { caseID: 'DESC' }
        }).then(d => d?.caseID ?? 0).catch(() => 0),
        await this.client.tickets.findOne({
          ...options,
          order: { ticketID: 'DESC' }
        }).then(d => d?.ticketID ?? 0).catch(() => 0)
      ]);

      guild.lastCase = lastCase;
      guild.lastTicket = lastTicket;
    }
  }
}
