import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReloadCommand extends Command {
  public constructor() {
    super('reload', {
      aliases: ['reload'],
      category: 'dev',
      ownerOnly: true
    });
  }

  public async exec(msg: Message) {
    const m = await msg.util!.send('Reloading...');
    const start = Date.now();

    this.client.commandHandler.reloadAll();
    this.client.listenerHandler.reloadAll();
    this.client.inhibitorHandler.reloadAll();

    return m.edit(`Done in ${Date.now() - start}ms`);
  }
}
