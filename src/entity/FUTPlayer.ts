import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  OneToMany,
  Unique,
  CreateDateColumn,
  BaseEntity
} from "typeorm";
import { Alert } from "./Alert";

@Entity()
@Unique(["futbin_id"])
export class FUTPlayer extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  futbin_url: string;

  @Column()
  futbin_id: string;

  @Column()
  player_name: string;

  @Column()
  futbin_price_ps4: number;

  @Column()
  futbin_price_pc: number;

  @Column()
  futbin_price_xbox: number;

  @Column()
  price_last_updated_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(type => Alert, alert => alert.player)
  alerts: Alert[];
}
