import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, Index } from 'typeorm';
import { TicketReplyEnd } from './TicketReply';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  public id!: number;

  @PrimaryColumn()
  @Index()
  public ticketID!: number;

  @PrimaryColumn('bigint')
  public guildID!: string;

  @Column('bigint')
  public authorID!: string;

  @Column()
  public resolved!: boolean;

  @Column()
  public issue!: string;

  @Column('smallint')
  public last!: TicketReplyEnd;
}
