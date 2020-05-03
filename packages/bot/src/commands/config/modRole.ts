import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class ModRoleCommand extends Command {
  public constructor() {
    super('modRole', {
      category: 'config',
      args: [
        {
          id: 'role',
          type: 'role',
          prompt: MESSAGES.COMMANDS.PROMPTS.MOD_ROLE
        }
      ]
    });
  }

  public async exec(msg: Message, { role }: { role: Role }) {
    this.client.settings.set(msg.guild!.id, 'modRole', role.id);

    return msg.util!.send(`Got it, I will now assist the people of the "${role.name}" role in their moderating duties`);
  }
}
