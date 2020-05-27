import MewchanClient from '../client/MewchanClient';
import { Ticket, TicketReplyEnd } from '@mewchan/common';
import { Guild, TextChannel, MessageEmbed, User, Message } from 'discord.js';

export default class TicketHandler {
  public static makeTicketEmbed(user: User, data: Ticket) {
    return new MessageEmbed()
      .setDescription(data.issue)
      .setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
      .setFooter(`Ticket ${data.ticketID}`)
      .setTimestamp();
  }

  public readonly tickets = this.client.tickets;
  public readonly replies = this.client.ticketReplies;

  public constructor(
    public readonly client: MewchanClient
  ) {}

  public async submit(guild: Guild, msg: Message, data: Ticket) {
    data.guildID = guild.id;
    data.ticketID = guild.lastTicket++;
    data.last = TicketReplyEnd.USER;
    data.resolved = false;

    const modMailChannel = this.client.settings.get(guild.id, 'modMailChannel');
    const channel = (modMailChannel ? (guild.channels.cache.get(modMailChannel) ?? null) : null) as TextChannel | null;

    if (!channel) return 'No mod mail channel has been set for this server';
    const embed = TicketHandler.makeTicketEmbed(msg.author, data);

    try {
      await channel.send(embed);
      await msg.channel.send(`Done, submitted ticket with ID ${data.ticketID}`);
      return null;
    } catch (e) {
      guild.lastTicket--;
      return `Failed to send ticket, please tell staff about this:\n${e}`;
    }
  }
}
