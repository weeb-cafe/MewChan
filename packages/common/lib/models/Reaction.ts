import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('reactions')
export class Reaction {
  @PrimaryColumn('bigint')
  public guildID!: string;

  @PrimaryColumn('bigint')
  public message!: string;

  @Column()
  public identifier!: string;

  @Column('bigint')
  public role!: string;
}
