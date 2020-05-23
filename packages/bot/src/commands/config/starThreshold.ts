import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class StarThresholdCommand extends Command {
  public constructor() {
    super('set-starthreshold', {
      category: 'config',
      args: [
        {
          id: 'threshold',
          type: 'number',
          prompt: MESSAGES.COMMANDS.PROMPTS.STAR_THRESHOLD
        }
      ]
    });
  }

  public async exec(msg: Message, { threshold }: { threshold: number }) {
    this.client.settings.set(msg.guild!.id, 'starThreshold', threshold);

    return msg.util!.send(`Okay, I will now show messages on the starboard once they hit ${threshold} stars.`);
  }
}
