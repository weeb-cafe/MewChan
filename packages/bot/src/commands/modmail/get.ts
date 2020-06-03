import { Command } from 'discord-akairo';
import { MESSAGES } from '../../util/Constants';
import { Message } from 'discord.js';
import { Ticket } from '@mewchan/common';
import { permissionLevel, Permissions } from '../../util/Util';
import TicketHandler from '../../struct/TicketHandler';

export default class TickeGetCommand extends Command {
  public constructor() {
    super('ticket-get', {
      category: 'modmail',
      channel: 'guild',
      args: [
        {
          id: 'ticket',
          type: async (msg, phrase) => {
            const ticket = await this.client.tickets.findOne({
              where: {
                id: phrase,
                guildID: msg.guild!.id
              }
            }).catch(() => null);

            if (!ticket) return null;
            if (ticket.authorID !== msg.author.id && permissionLevel(msg.member!) < Permissions.MOD) return null;

            return ticket;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.TICKET_GET_TICKET
        }
      ]
    });
  }

  public async exec(msg: Message, { ticket }: { ticket: Ticket }) {
    const user = await this.client.users.fetch(ticket.authorID).catch(() => null);
    const embed = TicketHandler.makeTicketEmbed(ticket.id, user ?? { id: ticket.authorID }, ticket);

    return msg.util!.send(embed);
  }
}
