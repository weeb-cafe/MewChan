import { Command } from 'discord-akairo';
import { can, Permissions } from '../../util/Util';
import { MESSAGES } from '../../util/Constants';
import { Message, Role } from 'discord.js';
import { ms, Autorole } from '@mewchan/common';

export default class CreateAutoRoleCommand extends Command {
  public constructor() {
    super('createAutoRole', {
      aliases: ['createAutoRole'],
      category: 'config',
      channel: 'guild',
      userPermissions: msg => can(msg, Permissions.MOD),
      args: [
        {
          id: 'role',
          type: 'role',
          prompt: MESSAGES.COMMANDS.PROMPTS.CREATE_AUTO_ROLE
        },
        {
          id: 'removeAfter',
          type: (_, phrase) => {
            if (!phrase) return null;

            const duration = ms(phrase);
            if (duration && duration >= 300000 && !isNaN(duration)) return duration;
            return null;
          },
          match: 'option',
          flag: ['--remove-after=']
        }
      ]
    });
  }

  public async exec(msg: Message, { role, removeAfter }: { role: Role; removeAfter: number | null }) {
    const where = { guildID: msg.guild!.id, roleID: role.id };
    const existing = await this.client.autoroles.findOne({ where });

    const autorole = new Autorole();
    autorole.guildID = msg.guild!.id;
    autorole.roleID = role.id;
    autorole.removeAfter = removeAfter;

    await this.client.autoroles.save(autorole);

    if (existing?.removeAfter) {
      if (!removeAfter) {
        await this.client.autoPendingRemovals.delete(where);
      } else {
        const removeEntries = await this.client.autoPendingRemovals.find({ where });

        for (const entry of removeEntries) {
          entry.removeAt = new Date(entry.createdAt.valueOf() + removeAfter);
          await this.client.autoPendingRemovals.save(entry);
        }
      }
    }

    return msg.util!.send(
      `Okay, ${role.name} will now be added on join${removeAfter ? ` & will be removed in ${ms(removeAfter, true)}` : ''}.`
    );
  }
}
