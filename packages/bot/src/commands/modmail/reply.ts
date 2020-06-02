import { Command } from 'discord-akairo';
import { MESSAGES } from '../../util/Constants';
import { Message } from 'discord.js';
import { Ticket, TicketReplyEnd, TicketReply, TicketStatus } from '@mewchan/common';

export default class TicketReplyCommand extends Command {
  public constructor() {
    super('ticket-reply', {
      category: 'modmail',
      args: [
        {
          id: 'ticket',
          type: async (_, phrase) => {
            if (!phrase) return null;
            const id = parseInt(phrase);
            if (isNaN(id)) return null;

            const ticket = await this.client.tickets.findOne(id);

            return ticket ?? null;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.TICKET_REPLY_TICKET
        },
        {
          id: 'close',
          match: 'flag',
          flag: ['--close']
        },
        {
          id: 'resolve',
          match: 'flag',
          flag: ['--resolve']
        },
        {
          id: 'content',
          type: 'string',
          match: 'content'
        }
      ]
    });
  }

  public async exec(
    msg: Message,
    {
      ticket,
      content,
      close,
      resolve
    }: { ticket: Ticket; content: string; close: boolean; resolve: boolean }
  ) {
    if ([TicketStatus.DENIED, TicketStatus.RESOLVED].includes(ticket.status)) {
      return msg.util!.send('Uh.. that ticket seems to have been closed, there\'s no need for further replies.');
    }

    const isStaffReply = msg.channel.type === 'text';
    if (!isStaffReply && ticket.last === TicketReplyEnd.USER) {
      return msg.util!.send('Please wait until staff of this server reply, do not try bypassing this by submitting a new ticket.');
    }

    const guild = this.client.guilds.cache.get(ticket.guildID);
    if (!guild) return msg.util!.send('Looks like I am not in that server anymore :|');
    if (!guild.available) return msg.util!.send('Oh dear, that server is currently under an outage, please wait a bit.');

    const reply = new TicketReply();
    reply.who = isStaffReply ? TicketReplyEnd.STAFF : TicketReplyEnd.USER;
    reply.content = content;

    ticket.last = isStaffReply ? TicketReplyEnd.STAFF : TicketReplyEnd.USER;

    if (close) ticket.status = TicketStatus.DENIED;
    if (resolve) ticket.status = TicketStatus.RESOLVED;

    const error = await this.client.ticketHandler.reply(guild, msg, ticket, reply);
    if (error) return msg.util!.send(error);
  }
}
