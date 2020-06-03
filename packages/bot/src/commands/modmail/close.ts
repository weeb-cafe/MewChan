import { Command } from 'discord-akairo';
import { MESSAGES } from '../../util/Constants';
import { Message } from 'discord.js';
import { Ticket } from '@mewchan/common';

export default class TicketCloseCommand extends Command {
  public constructor() {
    super('ticket-close', {
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

            return ticket ?? null;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.TICKET_CLOSE_TICKET
        },
        {
          id: 'resolve',
          match: 'flag',
          flag: ['--resolve']
        }
      ]
    });
  }

  public async exec(msg: Message, { ticket, resolve }: { ticket: Ticket; resolve: boolean }) {
    const error = await this.client.ticketHandler.close(msg.guild!, msg, ticket, resolve);
    if (error) return msg.util!.send(error);
  }
}
