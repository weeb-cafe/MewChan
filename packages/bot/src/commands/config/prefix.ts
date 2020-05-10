import { Command } from 'discord-akairo';
import { MESSAGES } from '../../util/Constants';
import { Message } from 'discord.js';

export default class PrefixCommand extends Command {
  public constructor() {
    super('prefix', {
      category: 'config',
      args: [
        {
          id: 'prefix',
          type: 'string',
          prompt: MESSAGES.COMMANDS.PROMPTS.PREFIX
        }
      ]
    });
  }

  public exec(msg: Message, { prefix }: { prefix: string }) {
    this.client.settings.set(msg.guild!.id, 'prefix', prefix);

    return msg.util!.send(`The prefix is now \`${prefix}\`! How exciting!`);
  }
}
