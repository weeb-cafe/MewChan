import { Listener } from 'discord-akairo';
import { Message } from 'discord.js';

export default class ReadyListener extends Listener {
  public constructor() {
    super('commandFinished', {
      emitter: 'commandHandler',
      event: 'commandFinished',
      category: 'commandHandler'
    });
  }

  public async exec(msg: Message) {
    const autodel = msg.guild ? this.client.settings.get(msg.guild.id, 'autodel', false) : false;

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    if (autodel && msg.guild?.me!.hasPermission('MANAGE_MESSAGES')) await msg.delete().catch(() => null);
  }
}
