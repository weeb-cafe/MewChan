
import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column } from 'typeorm';

export enum Actions {
  WARN,
  MUTE,
  KICK,
  SOFTBAN,
  BAN,
  UNMUTE,
  UNBAN
}

@Entity('cases')
export class Case<A extends Actions> {
  @PrimaryGeneratedColumn()
  public id!: number;

  @PrimaryColumn('bigint')
  public guildID!: string;

  @PrimaryColumn('integer')
  public caseID!: number;

  @Column('bigint', { nullable: true })
  public message!: string | null;

  @Column('integer', { nullable: true })
  public refID!: number | null;

  @Column('bigint')
  public targetID!: string;

  @Column('bigint', { nullable: true })
  public modID!: string | null;

  @Column('smallint')
  public action!: A;

  @Column('text', { nullable: true })
  public reason!: string | null;

  @Column('timestamptz', { 'default': () => 'now()' })
  public createdAt!: Date;

  @Column('timestamptz', { nullable: true })
  public actionExpires!: Date | null;

  @Column('simple-array', { nullable: true })
  public unmuteRoles!: string[] | null;

  @Column({ 'default': true })
  public resolved!: boolean;
}
