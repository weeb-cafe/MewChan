import MewchanClient from '../client/MewchanClient';
import { Inhibitor } from 'discord-akairo';
import { Message } from 'discord.js';

export default class BlacklistInhibitor extends Inhibitor {
  public constructor() {
    super('blacklist', {
      reason: 'This user or guild is blacklisted',
      category: 'management'
    });
  }

  public exec(msg: Message) {
    const blacklist = (msg.client as MewchanClient).settings.blacklist;
    return (msg.guild && blacklist.has(msg.guild.id)) || blacklist.has(msg.author.id);
  }
}
