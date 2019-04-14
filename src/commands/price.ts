import FUTBIN from "../FUTBIN";
import * as Discord from "discord.js";

export default async (args: string[], msg: Discord.Message) => {
  const futbinUrl = args[1];

  const player = await FUTBIN.getInfoFromUrl(`https://www.${futbinUrl}`);
  const prices = await FUTBIN.getCurrentBin(player.id);

  msg.channel.send("", {
    embed: {
      title: `Prices for ${player.name}`,
      fields: prices.map(price => {
        return {
          value: price.minBin.toLocaleString(),
          name: price.platform.toUpperCase(),
          inline: true
        };
      })
    }
  });
};
