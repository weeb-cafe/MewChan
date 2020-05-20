import { Task, Case, Actions } from '@mewchan/common';
import MewchanClient from '../client/MewchanClient';
import { Guild, TextChannel } from 'discord.js';
import { stripIndent } from 'common-tags';
import { TOPICS } from '../util/Constants';

export default class CyclePunishments extends Task {
  public constructor() {
    super('cyclePunishments', {
      period: 60000,
      once: false
    });
  }

  public resolve(client: MewchanClient, cs: Case<Actions>) {
    cs.resolved = true;
    return client.cases.save(cs);
  }

  public async exec(client: MewchanClient) {
    const cases = await client.cases.find({ where: { resolved: false } });

    for (const cs of cases) {
      if (Date.now() - cs.createdAt.getTime() >= 86400000) {
        await this.resolve(client, cs);
        continue;
      }

      if (cs.actionExpires! <= new Date()) {
        const guild = client.guilds.cache.get(cs.guildID);

        if (!guild) {
          await this.resolve(client, cs);
          continue;
        }

        const res = await (
          cs.action === Actions.MUTE
            ? this.handleMute(guild, cs as Case<Actions.MUTE>)
            : this.handleBan(guild, cs as Case<Actions.BAN>)
        );

        if (res !== null) {
          client.logger.warn(`${cs.caseID}: ${cs.guildID} failed to resolve due to ${res}`, { topic: TOPICS.TASK.WARN });
          const modLogsChannel = (guild.client as MewchanClient).settings.get(guild.id, 'modLogsChannel');

          if (res.length && modLogsChannel) {
            const channel = guild.channels.cache.get(modLogsChannel) as TextChannel | undefined;
            await channel?.send(stripIndent`
              Failed to resolve case ${cs.caseID} (user: ${cs.targetID}) with the following error: \`${res}\`
              This is likely a permission issue, if not please contact developer.
            `).catch(() => null);
          }

          continue;
        }

        await this.resolve(client, cs);
      }
    }
  }

  public async handleMute(guild: Guild, mute: Case<Actions.MUTE>): Promise<string | null> {
    const member = await guild.members.fetch(mute.targetID).catch(() => null);
    const muteRole = (guild.client as MewchanClient).settings.get(guild.id, 'muteRole');

    if (!member) return null;

    if (!muteRole) return 'Mute role does not exist anymore';
    if (!member.manageable) return 'Cannot manage user\'s roles';

    const res = await member.roles.set(mute.unmuteRoles ?? []).catch(e => e.toString());
    if (typeof res === 'string') return res;

    return null;
  }

  public async handleBan(guild: Guild, ban: Case<Actions.BAN>): Promise<string | null> {
    if (!guild.me!.hasPermission('BAN_MEMBERS')) return 'Missing permission to unban';

    const res = await guild.members.unban(ban.targetID).catch(e => e.toString());
    if (typeof res === 'string') return res;

    return null;
  }
}
