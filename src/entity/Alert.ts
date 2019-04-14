import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity
} from "typeorm";
import { FUTPlayer } from "./FUTPlayer";
import { Guild } from "./Guild";

export enum PriceDirection {
  up = "UP",
  down = "DOWN"
}

export enum Platform {
  ps4 = "ps4",
  xbox = "xbox",
  pc = "pc"
}

@Entity()
export class Alert extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price_started: number;

  @Column()
  price_goal: number;

  @Column({ enum: PriceDirection })
  price_direction: PriceDirection;

  @Column({ enum: Platform })
  platform: Platform;

  @Column()
  added_by_user_id: string;

  @ManyToOne(type => FUTPlayer)
  player: FUTPlayer;

  @ManyToOne(type => Guild)
  guild: Guild;

  @Column()
  channel_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
