import MewchanClient from '../client/MewchanClient';
import { Ticket, TicketReplyEnd } from '@mewchan/common';
import { Guild, TextChannel, MessageEmbed } from 'discord.js';

export default class TicketHandler {
  // TODO
  /* eslint-disable */
  public static makeEmbed(guild: Guild, data: Ticket) {
    const ticket = new MessageEmbed();
  }
  /* eslint-enable */

  public readonly tickets = this.client.tickets;
  public readonly replies = this.client.ticketReplies;

  public constructor(
    public readonly client: MewchanClient
  ) {}

  public submit(guild: Guild, data: Ticket) {
    data.guildID = guild.id;
    data.ticketID = guild.lastTicket++;
    data.last = TicketReplyEnd.USER;
    data.resolved = false;

    const modLogsChannel = this.client.settings.get(guild.id, 'modLogsChannel');
    const channel = (modLogsChannel ? (guild.channels.cache.get(modLogsChannel) ?? null) : null) as TextChannel | null;

    if (!channel) return 'No mod mail channel has been set for that server';
    const embed = TicketHandler.makeEmbed(guild, data);

    return channel?.send(embed);
  }
}
