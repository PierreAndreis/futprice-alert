import FUTBIN from "../FUTBIN";
import * as Discord from "discord.js";

export default async (args: string[], msg: Discord.Message) => {
  const futbinUrl = args[1];
  if (
    !futbinUrl ||
    !futbinUrl.startsWith("https://www.futbin.com/19/player/")
  ) {
    msg.reply("You didn't specify a correct FUTBIN link");
    return;
  }

  const player = await FUTBIN.getInfoFromUrl(futbinUrl);
  const prices = await FUTBIN.getCurrentBin(player.id);

  msg.channel.sendEmbed({
    title: `Prices for ${player.name}`,
    fields: prices.map(price => {
      return {
        value: price.minBin.toLocaleString(),
        name: price.platform.toUpperCase(),
        inline: true
      };
    })
  });
};
