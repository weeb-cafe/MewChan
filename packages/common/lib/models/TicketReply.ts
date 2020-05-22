import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, Index } from 'typeorm';

export enum TicketReplyEnd {
  USER,
  STAFF
}

@Entity('ticket_replies')
export class TicketReply {
  @PrimaryGeneratedColumn()
  public id!: number;

  @PrimaryColumn()
  @Index()
  public replyID!: number;

  @PrimaryColumn()
  @Index()
  public ticketID!: number;

  @Column('smallint')
  public who!: TicketReplyEnd;

  @Column()
  public content!: string;
}
