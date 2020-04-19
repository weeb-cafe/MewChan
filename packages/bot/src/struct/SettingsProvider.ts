
import { Provider } from 'discord-akairo';
import { Repository } from 'typeorm';
import { Setting } from '@reika/common';
import { Collection } from 'discord.js';

export default class SettingsProvider extends Provider {
  public constructor(public repo: Repository<Setting>) { super(); }

  public items!: Collection<string, Setting>;

  public get(id: string): Setting | null;
  public get<K extends keyof Setting>(id: string, key: K): Setting[K] | null;
  public get<K extends keyof Setting>(
    id: string,
    key: K,
    def: Setting[K]
  ): Setting[K];

  public get<K extends keyof Setting>(
    id: string,
    key?: K,
    def: Setting[K] | null = null
  ): Setting | Setting[K] | null {
    const data = this.items.get(id);

    if (data) {
      const value = key ? data[key] : data;
      return value == null ? def : value;
    }

    return def;
  }

  public set<K extends keyof Setting>(id: string, key: K, val: Setting[K]): this {
    const data = this.items.get(id) || new Setting();

    data.id = id;
    data[key] = val;
    this.items.set(id, data);

    this.repo.save(data);
    return this;
  }

  /**
   * ! DANGEROUS
   * ! Please only use for non-nullable columns.
   */
  public delete(id: string, key: keyof Setting): this {
    const data = this.items.get(id);

    if (data?.[key] != null) {
      // @ts-ignore
      data[key] = null;

      this.repo.save(data);
      this.items.set(id, data);
    }

    return this;
  }

  public clear(id: string): this {
    if (this.items.has(id)) {
      this.repo.delete({ id });
      this.items.delete(id);
    }

    return this;
  }

  public async init() {
    const settings = await this.repo.find();
    for (const setting of settings) {
      this.items.set(setting.id, setting);
    }
  }
}
