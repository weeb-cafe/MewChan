import { Command } from 'discord-akairo';
import { Message, Role, TextChannel, PermissionOverwriteOption, GuildChannel } from 'discord.js';
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
        },
        {
          'id': 'jail',
          'type': 'textChannel',
          'default': null
        }
      ]
    });
  }

  public async exec(msg: Message, { role, jail }: { role: Role; jail: TextChannel | null }) {
    this.client.settings.set(msg.guild!.id, 'muteRole', role.id);

    const m = await msg.util!.send(`Gimme a sec..`);
    let output = `Okay, the mute role is now "${role.name}".`;

    if (msg.guild!.me!.hasPermission('MANAGE_CHANNELS')) {
      output += `Oh! I also updated the permissions for your channels`;
      const failed: GuildChannel[] = [];

      for (const channel of msg.guild!.channels.cache.values()) {
        const overwrite: PermissionOverwriteOption = {};

        switch (channel.type) {
          case 'text':
            if (channel.id === jail?.id) {
              overwrite.VIEW_CHANNEL = true;
              overwrite.SEND_MESSAGES = true;
              overwrite.READ_MESSAGE_HISTORY = true;
            } else {
              overwrite.SEND_MESSAGES = false;
              overwrite.ADD_REACTIONS = false;
            }
            break;

          case 'voice':
            overwrite.CONNECT = false;
            break;
        }

        try {
          await channel.createOverwrite(role, overwrite);
        } catch {
          failed.push(channel);
        }
      }

      if (failed.length) {
        output += ` besides: ${failed.map(c => c.type === 'text' ? c.toString() : c.name).join(', ')}, may wanna do those manually`;
      }
    } else {
      output += `By the way, I'm missing the \`MANAGE_CHANNELS\` permission, so I couldn't set the permissions for any of your channels`;
    }

    return m.edit(output);
  }
}
