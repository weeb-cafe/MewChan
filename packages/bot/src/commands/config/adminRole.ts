import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class AdminRoleCommand extends Command {
  public constructor() {
    super('set-adminRole', {
      category: 'config',
      args: [
        {
          id: 'role',
          type: 'role',
          prompt: MESSAGES.COMMANDS.PROMPTS.ADMIN_ROLE
        }
      ]
    });
  }

  public async exec(msg: Message, { role }: { role: Role }) {
    this.client.settings.set(msg.guild!.id, 'adminRole', role.id);

    return msg.util!.send(`Got it, I will now obey the people of the "${role.name}" role`);
  }
}
