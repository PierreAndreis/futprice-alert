import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  BaseEntity,
  Unique
} from "typeorm";
import { Alert } from "./Alert";

import { Guild as DiscordGuild } from "discord.js";

@Entity()
@Unique(["guild_id"])
export class Guild extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guild_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon_url: string;

  @Column()
  owner_user_id: string;

  @OneToMany(type => Alert, alert => alert.guild)
  alerts: Alert[];

  // Creates a new if it doesn't find
  static async findByDiscordGuild(
    discordGuild: DiscordGuild
  ): Promise<Guild> {
    let guild = await this.findOne({ guild_id: discordGuild.id });
    if (!guild) guild = new Guild();
    guild.guild_id = discordGuild.id;
    guild.name = discordGuild.name;
    guild.icon_url = discordGuild.iconURL;
    guild.owner_user_id = discordGuild.ownerID;
    guild.save();
    return guild;
  }
}
