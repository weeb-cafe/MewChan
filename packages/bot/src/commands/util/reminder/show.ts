import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { permissionLevel, Permissions, createReminderEmbed } from '../../../util/Util';
import MewchanClient from '../../../client/MewchanClient';
import { Reminder } from '@mewchan/common';
import { MESSAGES } from '../../../util/Constants';

export default class ReminderShowCommand extends Command {
  public static getDefault(msg: Message) {
    return (msg.client as MewchanClient).reminders.findOne({
      where: {
        userID: msg.author.id
      },
      order: {
        id: 'DESC'
      }
    });
  }

  public constructor() {
    super('reminder-show', {
      category: 'util',
      args: [
        {
          id: 'reminder',
          type: async (msg, phrase) => {
            if (!phrase) return null;

            const reminder = ['l', 'last', 'latest'].includes(phrase)
              ? await ReminderShowCommand.getDefault(msg)
              : await this.client.reminders.findOne(parseInt(phrase)).catch(() => null);

            if (!reminder) return null;

            if (reminder.userID !== msg.author.id && permissionLevel(msg.member!) < Permissions.MOD) {
              return ReminderShowCommand.getDefault(msg);
            }

            return reminder;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.REMINDER_SHOW
        }
      ]
    });
  }

  public async exec(msg: Message, { reminder }: { reminder: Reminder }) {
    return msg.util!.send(await createReminderEmbed(msg.author, reminder));
  }
}
