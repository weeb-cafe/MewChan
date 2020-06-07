import { Entity, PrimaryColumn, Column } from 'typeorm';

export enum BlacklistType {
  USER,
  USER_GLOBAL,
  GUILD
}

@Entity('blacklist')
export class Blacklist {
  @PrimaryColumn('bigint')
  public id!: string;

  @Column('bigint', { nullable: true })
  public guildID!: string | null;

  @Column('text', { nullable: true })
  public reason!: string | null;

  @Column('smallint')
  public type!: BlacklistType;
}
