import { Listener } from 'discord-akairo';
import { GuildMember } from 'discord.js';
import { Actions } from '@mewchan/common';

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
      }
    });

    const muteRole = mute ? this.client.settings.get(member.guild.id, 'muteRole') : null;

    if (muteRole) await member.roles.set([muteRole]).catch(() => null);
  }
}
