import { Command } from 'discord-akairo';
import { Message, CategoryChannel } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class ModMailCategoryCommand extends Command {
  public constructor() {
    super('set-modMailCategory', {
      category: 'config',
      args: [
        {
          id: 'channel',
          type: 'categoryChannel',
          prompt: MESSAGES.COMMANDS.PROMPTS.MOD_MAIL_CATEGORY
        }
      ]
    });
  }

  public async exec(msg: Message, { channel }: { channel: CategoryChannel }) {
    this.client.settings.set(msg.guild!.id, 'modMailCategory', channel.id);

    return msg.util!.send(`Got it, ${channel.name} is now the mod mail category.`);
  }
}
