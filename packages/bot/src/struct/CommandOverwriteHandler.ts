import { Repository } from 'typeorm';
import { PermissionOverwrite, OverwriteType, OverwriteTarget } from '@mewchan/common';
import { Message } from 'discord.js';

export enum Status {
  DENIED,
  NETURAL,
  ALLOWED
}

export default class CommandOverwriteHandler {
  public constructor(public readonly repo: Repository<PermissionOverwrite>) {}

  private _parseOverwrite(msg: Message, overwrite: PermissionOverwrite): Status {
    const exit = () => overwrite.type === OverwriteType.ALLOW ? Status.ALLOWED : Status.DENIED;

    switch (overwrite.target) {
      case OverwriteTarget.USER:
        if (overwrite.targetID === msg.author.id) return exit();
        break;
      case OverwriteTarget.CHANNEL:
        if (overwrite.targetID === msg.channel.id) return exit();
        break;
      case OverwriteTarget.ROLE:
        if (msg.member!.roles.cache.has(overwrite.targetID)) return exit();
        break;
      case OverwriteTarget.GUILD:
        return exit();
    }

    return Status.NETURAL;
  }

  public async processOverwrites(msg: Message, commandID: string): Promise<Status> {
    const overwrites = await this.repo.find({
      where: {
        guildID: msg.guild!.id,
        commandID
      }
    }).catch(() => null);

    if (!overwrites?.length) return Status.NETURAL;

    let status = Status.NETURAL;

    for (let i = 3; i >= 0; i--) {
      if (status !== Status.NETURAL) break;

      const current = overwrites.filter(e => e.type === i);
      const parsed = current.map(e => this._parseOverwrite(msg, e));

      if (parsed.length) status = parsed.includes(Status.ALLOWED) ? Status.ALLOWED : Status.DENIED;
    }

    return status;
  }
}
