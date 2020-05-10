import { Task } from '@mewchan/common';
import ReikaClient from '../client/ReikaClient';
import { ActivityType } from 'discord.js';
import { TOPICS } from '../util/Constants';

export default class SetStatusTask extends Task {
  public statuses = [
    'Watching over y\'all',
    'Listening to JoJo\'s OSTs'
  ];

  public constructor() {
    super('setStatus', {
      period: 3600000,
      once: false
    });
  }

  public exec(client: ReikaClient) {
    const status = this.statuses[Math.floor(Math.random() * this.statuses.length)].split(' ');
    const type = status.splice(0, 1)[0].toUpperCase();
    if (type === 'Listening') status.splice(0, 1);
    const message = status.join(' ');

    return client.user?.setPresence({
      activity: {
        type: type as ActivityType,
        name: message
      }
    })
    .catch(e => client.logger.error(e.stack ?? e.message, { topic: TOPICS.BOT.ERROR }));
  }
}
