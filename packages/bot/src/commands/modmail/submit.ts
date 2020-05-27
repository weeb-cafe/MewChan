import { Command } from 'discord-akairo';

export default class SubmitCommand extends Command {
  public constructor() {
    super('submit', {
      aliases: ['submit'],
      channel: 'guild',
      category: 'mod'
    });
  }
}
