import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class BlacklistInhibitor extends Inhibitor {
  public constructor() {
    super('blacklist', {
      reason: 'This user or guild is blacklisted',
      category: 'management'
    });
  }

  public exec(msg: Message) {
    return this.client.blacklistManager.isBlacklisted(msg);
  }
}
