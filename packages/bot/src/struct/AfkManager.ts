import { Repository } from 'typeorm';
import { Afk } from '@mewchan/common';
import { Message, Collection } from 'discord.js';

export default class AfkManager {
  public readonly items = new Collection<string, Afk>();

  public constructor(public readonly repo: Repository<Afk>) {}

  public getAfkKey(entry: Afk) {
    return `${entry.guildID}-${entry.userID}`;
  }

  public isAfk(msg: Message) {
    return this.items.has(`${msg.guild!.id}-${msg.author.id}`);
  }

  public async delete(msg: Message) {
    await this.repo.delete({
      userID: msg.author.id,
      guildID: msg.guild!.id
    });

    return this.items.delete(`${msg.guild!.id}-${msg.author.id}`);
  }

  public async add(msg: Message, reason: string) {
    const entry = new Afk();

    entry.guildID = msg.guild!.id;
    entry.userID = msg.author.id;
    entry.reason = reason;

    await this.repo.save(entry);
    this.items.set(this.getAfkKey(entry), entry);
  }

  public async init() {
    const afks = await this.repo.find();
    for (const afk of afks) this.items.set(this.getAfkKey(afk), afk);
  }
}
