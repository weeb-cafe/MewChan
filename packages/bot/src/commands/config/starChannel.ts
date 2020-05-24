import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class StarChannelCommand extends Command {
  public constructor() {
    super('set-starChannel', {
      category: 'config',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          prompt: MESSAGES.COMMANDS.PROMPTS.STAR_CHANNEL
        }
      ]
    });
  }

  public async exec(msg: Message, { channel }: { channel: TextChannel }) {
    this.client.settings.set(msg.guild!.id, 'starChannel', channel.id);

    return msg.util!.send(`Got it, the starboard channel is now ${channel.toString()}`);
  }
}
