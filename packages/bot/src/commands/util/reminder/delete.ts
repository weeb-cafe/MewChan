import { Command } from 'discord-akairo';
import { Message } from 'discord.js';
import { permissionLevel, Permissions, createReminderEmbed, confirm } from '../../../util/Util';
import MewchanClient from '../../../client/MewchanClient';
import { Reminder } from '@mewchan/common';
import { MESSAGES } from '../../../util/Constants';

export default class ReminderDeleteCommand extends Command {
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
    super('reminder-delete', {
      category: 'util',
      args: [
        {
          id: 'reminder',
          type: async (msg, phrase) => {
            if (!phrase) return null;

            const reminder = ['l', 'last', 'latest'].includes(phrase)
              ? await ReminderDeleteCommand.getDefault(msg)
              : await this.client.reminders.findOne(parseInt(phrase)).catch(() => null);

            if (!reminder) return null;

            if (reminder.userID !== msg.author.id && permissionLevel(msg.member!) < Permissions.MOD) {
              return ReminderDeleteCommand.getDefault(msg);
            }

            return reminder;
          },
          prompt: MESSAGES.COMMANDS.PROMPTS.REMINDER_SHOW
        }
      ]
    });
  }

  public async exec(msg: Message, { reminder }: { reminder: Reminder }) {
    const confirmation = await confirm(
      msg,
      'You should be more decisive!',
      'Are you sure you want to delete this reminder? [y/n]',
      await createReminderEmbed(msg.author, reminder)
    );

    if (confirmation !== null) return msg.util!.send(confirmation);
    await this.client.reminders.delete(reminder);

    return msg.util!.send(`Successfully deleted reminder with ID ${reminder.id}`);
  }
}
