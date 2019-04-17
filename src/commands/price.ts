import FUTBIN from "../FUTBIN";
import * as Discord from "discord.js";

import * as flat from "lodash.flatten";

const emojisIdToPlatform = {
  pc: "567868700254929086",
  ps4: "567868746312450059",
  xbox: "567868620089065495",
  coin: "567873274449494025"
};

export default async (args: string[], msg: Discord.Message) => {
  const futbinUrl = args[1];

  const player = await FUTBIN.getInfoFromUrl(`https://www.${futbinUrl}`, {
    thumbnail: true
  });
  const prices = await FUTBIN.getCurrentBin(player.id);

  const coin = msg.client.emojis.get(emojisIdToPlatform.coin);

  msg.channel.send("", {
    embed: {
      author: {
        name: player.name,
        url: `https://www.${futbinUrl}/${player.name}`
      },
      thumbnail: {
        url: player.thumbnail ? player.thumbnail : ""
      },
      fields: flat(
        prices.map(price => {
          return [
            {
              value: `${price.minBin.toLocaleString()} ${coin}`,
              name: `${msg.client.emojis.get(
                emojisIdToPlatform[price.platform]
              )} Min bin`,
              inline: true
            },
            {
              value: `${(price.minBin * 0.95).toLocaleString()} ${coin}`,
              name: `${msg.client.emojis.get(
                emojisIdToPlatform[price.platform]
              )} You receive after tax`,
              inline: true
            },
            {
              value: `${(price.minBin * 1.06).toLocaleString()} ${coin}`,
              name: `${msg.client.emojis.get(
                emojisIdToPlatform[price.platform]
              )} Sell for`,
              inline: false
            }
          ];
        }),
        1
      )
    }
  });
};
