import { Blacklist, BlacklistType } from '@mewchan/common';
import { Repository } from 'typeorm';
import { Message } from 'discord.js';

export class BlacklistManager extends Set<string> {
  public constructor(public readonly repo: Repository<Blacklist>) {
    super();
  }

  public getBlacklistKey(entry: Blacklist) {
    return [BlacklistType.USER_GLOBAL, BlacklistType.GUILD].includes(entry.type)
      ? entry.id
      : `${entry.guildID}-${entry.id}`;
  }

  public isBlacklisted(msg: Message) {
    if (this.has(msg.author.id)) return true;
    if (msg.guild) {
      if (this.has(msg.guild.id)) return true;
      if (this.has(`${msg.guild.id}-${msg.author.id}`)) return true;
    }

    return false;
  }

  public addEntry(entry: Blacklist) {
    this.add(this.getBlacklistKey(entry));

    return this.repo.save(entry);
  }

  public async deleteEntry(id: string, guildID?: string) {
    const where: Record<string, any> = { id };
    if (guildID) where.guildID = guildID;

    const entry = await this.repo.findOne({ where });

    if (!entry) return false;

    this.delete(this.getBlacklistKey(entry));
    await this.repo.delete(entry);

    return true;
  }

  public async init() {
    const blacklist = await this.repo.find();

    for (const entry of blacklist) {
      this.add(this.getBlacklistKey(entry));
    }
  }
}
