import * as Discord from "discord.js";
import price from "./commands/price";
import alert from "./commands/alert";
import { Guild } from "./entity/Guild";

import { In, Not } from "typeorm";
import ping from "./commands/ping";

export const client = new Discord.Client();
client.on("error", error => {
  console.warn("Error!", error);
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client
    .generateInvite(["SEND_MESSAGES", "MANAGE_GUILD", "MENTION_EVERYONE"])
    .then(link => {
      console.log(`Invite link: ${link}`);
    });

  console.log("Removing guilds...");
  const currentGuildIds = client.guilds.map(guild => {
    return guild.id;
  });

  // Delete guilds not present
  const guildsDeleted = await Guild.delete({
    guild_id: Not(In(currentGuildIds))
  });
  console.log("Removed guilds:", guildsDeleted.affected);

  // It's ok to not update guilds that are outdated in the database... once a command is ran, it should update
});

client.on("message", async msg => {
  if (!msg.content.startsWith(".")) return;

  const args = msg.content.split(" ");
  msg.channel.startTyping();
  try {
    if (args[0] === ".ping") {
      await ping(args, msg);
    }

    if (args[0] === ".price") {
      await price(args, msg);
    }

    if (args[0] === ".alert") {
      await alert(args, msg);
    }
  } catch (e) {
    console.warn(e);
    msg.channel.send("Error while running");
  }
  msg.channel.stopTyping();
});

client.login(process.env.BOT_TOKEN);

client.on("guildCreate", guild => {
  console.log("Joined ", guild.name);
  const guildEntity = new Guild();

  guildEntity.guild_id = guild.id;
  guildEntity.name = guild.name;
  guildEntity.icon_url = guild.iconURL;
  guildEntity.owner_user_id = guild.ownerID;

  guildEntity.save();
});

client.on("guildUpdate", async (old_guild, new_guild) => {
  console.log("Updating guild", old_guild.name);
  const guildEntity = await Guild.findOne({ guild_id: old_guild.id });

  guildEntity.guild_id = new_guild.id;
  guildEntity.name = new_guild.name;
  guildEntity.icon_url = new_guild.iconURL;
  guildEntity.owner_user_id = new_guild.ownerID;

  guildEntity.save();
});
