import { Command } from 'discord-akairo';
import { Message, Role } from 'discord.js';
import { MESSAGES } from '../../util/Constants';

export default class MuteRoleCommand extends Command {
  public constructor() {
    super('muteRole', {
      category: 'config',
      args: [
        {
          id: 'role',
          type: 'role',
          prompt: MESSAGES.COMMANDS.PROMPTS.MUTE_ROLE
        }
      ]
    });
  }

  public async exec(msg: Message, { role }: { role: Role }) {
    this.client.settings.set(msg.guild!.id, 'muteRole', role.id);

    return msg.util!.send(`Got it, the mute role is now "${role.name}"`);
  }
}
