import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';
import { COLORS } from '../../util/Constants';

export default class MessageListener extends Listener {
  public constructor() {
    super('message', {
      emitter: 'client',
      event: 'message',
      category: 'client'
    });
  }

  public async exec(msg: Message) {
    if (!msg.guild || msg.author.bot) return;

    if (this.client.afkManager.isAfk(msg)) {
      await msg.channel.send('You\'re no longer afk.');
      await this.client.afkManager.delete(msg);
    }

    for (const user of msg.mentions.users.values()) {
      const key = `${msg.guild.id}-${user.id}`;
      const entry = this.client.afkManager.items.get(key);

      if (!entry) continue;

      const embed = this.client.util
        .embed()
        .setTimestamp()
        .setColor(COLORS.BRAND.BLUE)
        .setTitle('User is AFK')
        .setDescription(entry.reason ?? 'No reason provided');

      await msg.channel.send(embed);
    }
  }
}
