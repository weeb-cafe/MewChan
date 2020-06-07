import { Entity, Column } from 'typeorm';

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
  @Column('bigint')
  public guildID!: string;

  @Column()
  public commandID!: string;

  @Column('tinyint')
  public type!: OverwriteType;

  @Column('tinyint')
  public target!: OverwriteTarget;

  @Column('bigint')
  public targetID!: string;
}
