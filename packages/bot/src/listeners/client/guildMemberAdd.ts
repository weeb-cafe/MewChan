import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Actions, AutoPendingRemoval } from '@mewchan/common';

export default class GuildMemberAddListener extends Listener {
  public constructor() {
    super('guildMemberAdd', {
      emitter: 'client',
      event: 'guildMemberAdd',
      category: 'client'
    });
  }

  public async exec(member: GuildMember) {
    const mute = await this.client.cases.findOne({
      where: {
        resolved: false,
        guildID: member.guild.id,
        targetID: member.id,
        action: Actions.MUTE
      },
      order: {
        id: 'DESC'
      }
    });

    const muteRole = mute ? this.client.settings.get(member.guild.id, 'muteRole') : null;
    if (muteRole) await member.roles.set([muteRole]).catch(() => null);

    const autoroles = await this.client.autoroles.find({ where: { guildID: member.guild.id } });

    for (const role of autoroles) {
      try {
        await member.roles.add(role.roleID);

        if (role.removeAfter) {
          const autoroleRemoval = new AutoPendingRemoval();
          autoroleRemoval.guildID = member.guild.id;
          autoroleRemoval.roleID = role.roleID;
          autoroleRemoval.memberID = member.id;
          autoroleRemoval.createdAt = new Date();
          autoroleRemoval.removeAt = new Date(role.removeAfter + Date.now());

          await this.client.autoPendingRemovals.save(autoroleRemoval);
        }
      } catch {}
    }
  }
}
