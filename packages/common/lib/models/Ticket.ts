import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum TicketStatus {
  PENDING,
  DENIED,
  RESOLVED
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column('bigint')
  public guildID!: string;

  @Column('bigint')
  public authorID!: string;

  @Column('smallint')
  public status!: TicketStatus;

  @Column()
  public issue!: string;
}
