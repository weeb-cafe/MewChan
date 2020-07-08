import { Task } from '@mewchan/common';
import MewchanClient from '../client/MewchanClient';

export default class CycleAutoroleRemovalsTask extends Task {
  public constructor() {
    super('cycleAutoroleRemovals', {
      period: 60000,
      once: false
    });
  }

  public async exec(client: MewchanClient) {
    const entries = await client.autoPendingRemovals.find();

    for (const entry of entries) {
      if (entry.removeAt > new Date()) continue;

      const guild = client.guilds.cache.get(entry.guildID);
      if (!guild?.available) continue;

      const member = await guild.members.fetch(entry.memberID).catch(() => null);
      await member?.roles.remove(entry.roleID).catch(() => null);

      await client.autoPendingRemovals.remove(entry);
    }
  }
}
