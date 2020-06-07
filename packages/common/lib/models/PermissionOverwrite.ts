import { Entity, PrimaryColumn } from 'typeorm';

export enum OverwriteType {
  DENY,
  ALLOW
}

export enum OverwriteTarget {
  GUILD,
  ROLE,
  CHANNEL,
  USER,
}

@Entity('permission_overwrites')
export class PermissionOverwrite {
  @PrimaryColumn('bigint')
  public guildID!: string;

  @PrimaryColumn()
  public commandID!: string;

  @PrimaryColumn('smallint')
  public type!: OverwriteType;

  @PrimaryColumn('smallint')
  public target!: OverwriteTarget;

  @PrimaryColumn('bigint')
  public targetID!: string;
}
