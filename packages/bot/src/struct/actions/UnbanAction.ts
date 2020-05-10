import Action, { OptionalData } from './Action';
import { Message, User } from 'discord.js';
import { Actions } from '@mewchan/common';
import CyclePunishments from '../../tasks/CyclePunishments';

export default class UnbanAction extends Action<Actions.UNBAN> {
  public constructor(
    msg: Message,
    target: User,
    optional?: OptionalData
  ) {
    super(Actions.UNBAN, msg, target, optional);
  }

  protected async prepare() {
    if (!this.guild.me!.hasPermission('BAN_MEMBERS')) return 'I am lacking the `BAN_MEMBERS` permission';
    const bans = await this.guild.fetchBans();
    if (!bans.has(this.targetUser.id)) return 'That user is not currently banned';

    return super.prepare();
  }

  protected async run() {
    const msg = await this.msg.channel.send(`Unbanning ${this.targetUser.tag}, gimme a sec.`);

    const punishments = this.client.scheduler.tasks.get('cyclePunishments') as CyclePunishments;
    const refCase = await this.client.cases.findOne({
      where: {
        guildID: this.guild.id,
        targetID: this.target.id,
        action: Actions.BAN
      },
      order: {
        id: 'ASC'
      }
    });

    if (refCase) {
      if (refCase.caseID !== this.case.id) this.case.refID = refCase.caseID;
      if (!refCase.resolved) await punishments.resolve(this.client, refCase);
    }

    return this.guild.members
      .unban(this.targetUser)
      .then(() => msg.edit(`Okay, unbanned ${this.targetUser.tag}, let me know if he causes trouble again`));
  }
}
