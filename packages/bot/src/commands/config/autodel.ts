import { Command } from 'discord-akairo';
import { Message } from 'discord.js';

export default class AutodelCommand extends Command {
  public constructor() {
    super('set-autodel', {
      category: 'config'
    });
  }

  public async exec(msg: Message) {
    const value = !this.client.settings.get(msg.guild!.id, 'autodel', false);
    this.client.settings.set(msg.guild!.id, 'autodel', value);

    return msg.util!.send(value ? 'Got it, I will now delete commands!' : 'Got it, I will no longer delete commands!');
  }
}
