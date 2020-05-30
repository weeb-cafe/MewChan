import MewchanClient from '../client/MewchanClient';
import { Ticket, TicketReplyEnd } from '@mewchan/common';
import { Guild, TextChannel, MessageEmbed, User, Message } from 'discord.js';
import { confirm } from '../util/Util';
import { COLORS } from '../util/Constants';

export default class TicketHandler {
  public static makeTicketEmbed(user: User, data: Ticket) {
    return new MessageEmbed()
      .setDescription(data.issue)
      .setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL())
      .setFooter(`Ticket ${data.ticketID}`)
      .setColor(COLORS.BLUE)
      .setTimestamp();
  }

  public readonly tickets = this.client.tickets;
  public readonly replies = this.client.ticketReplies;

  public constructor(
    public readonly client: MewchanClient
  ) {}

  public async submit(guild: Guild, msg: Message, data: Ticket) {
    data.guildID = guild.id;
    data.ticketID = guild.lastTicket + 1;
    data.last = TicketReplyEnd.USER;
    data.resolved = false;

    const modMailChannel = this.client.settings.get(guild.id, 'modMailChannel');
    const channel = (modMailChannel ? (guild.channels.cache.get(modMailChannel) ?? null) : null) as TextChannel | null;

    if (!channel) return 'No mod mail channel has been set for this server';
    const embed = TicketHandler.makeTicketEmbed(msg.author, data);

    const confirmation = await confirm(msg, 'You should be more decisive', 'Do you really want to submit this ticket? [y/n]', embed);
    if (confirmation) return confirmation;

    try {
      await channel.send(embed);
      await msg.channel.send(`Done, submitted ticket with ID ${data.ticketID}`);
      await this.client.tickets.save(data);
      guild.lastTicket++;
      return null;
    } catch (e) {
      guild.lastTicket--;
      return `Failed to send ticket, please tell staff about this:\n${e}`;
    }
  }
}
