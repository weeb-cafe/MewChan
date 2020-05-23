import { Command } from 'discord-akairo';
import { Message, TextChannel } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class ModLogsChannelCommand extends Command {
  public constructor() {
    super('set-modlogschannel', {
      category: 'config',
      args: [
        {
          id: 'channel',
          type: 'textChannel',
          prompt: MESSAGES.COMMANDS.PROMPTS.MOD_LOGS_CHANNEL
        }
      ]
    });
  }

  public async exec(msg: Message, { channel }: { channel: TextChannel }) {
    this.client.settings.set(msg.guild!.id, 'modLogsChannel', channel.id);

    return msg.util!.send(`Got it, I will now post mod logs in ${channel.toString()}`);
  }
}
