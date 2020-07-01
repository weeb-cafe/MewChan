import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('reaction_messages')
export class ReactionMessage {
  @PrimaryColumn('bigint')
  public id!: string;

  @Column()
  public unique!: boolean;
}
