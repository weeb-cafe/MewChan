import { Command } from 'discord-akairo';
import { MESSAGES } from '../../util/Constants';
import { Message, Guild } from 'discord.js';
import { Ticket } from '@mewchan/common';

export default class TicketSubmitCommand extends Command {
  public constructor() {
    super('ticket-submit', {
      category: 'modmail',
      channel: 'dm',
      args: [
        {
          id: 'guild',
          type: 'guild',
          prompt: MESSAGES.COMMANDS.PROMPTS.TICKET_SUBMIT_GUILD
        },
        {
          id: 'content',
          type: 'string',
          match: 'restContent'
        }
      ]
    });
  }

  public async exec(msg: Message, { guild, content }: { guild: Guild; content: string }) {
    if (!guild.available) return msg.util!.send('Oh no! This server seems to be under an outage, please wait for a while.');

    const ticket = new Ticket();

    ticket.authorID = msg.author.id;
    ticket.issue = content;

    const error = await this.client.ticketHandler.submit(guild, msg, ticket);
    if (error) return msg.util!.send(error);
  }
}
