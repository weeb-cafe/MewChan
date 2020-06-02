import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class ModMailChannelCommand extends Command {
  public constructor() {
    super('set-modMailChannel', {
      category: 'config',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          prompt: MESSAGES.COMMANDS.PROMPTS.MOD_MAIL_CHANNEL
        }
      ]
    });
  }

  public async exec(msg: Message, { channel }: { channel: TextChannel }) {
    this.client.settings.set(msg.guild!.id, 'modMailChannel', channel.id);

    return msg.util!.send(`Got it, ${channel} is now the mod mail channel.`);
  }
}