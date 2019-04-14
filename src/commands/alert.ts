import FUTBIN from "../FUTBIN";
import * as Discord from "discord.js";
import { FUTPlayer } from "../entity/FUTPlayer";
import { Alert, Platform, PriceDirection } from "../entity/Alert";
import { Guild } from "../entity/Guild";

export default async (args: string[], msg: Discord.Message) => {
  const [, futbinUrl, ...otherArgs] = args;
  if (
    !futbinUrl ||
    !futbinUrl.startsWith("https://www.futbin.com/19/player/")
  ) {
    msg.reply("You didn't specify a correct FUTBIN link");
    return;
  }

  let platform: undefined | Platform;
  let priceGoal: string | number;

  // Check if the other args are correct
  otherArgs.forEach(arg => {
    if (typeof arg === "string") arg = arg.toLowerCase();

    if (
      arg === Platform.pc ||
      arg === Platform.xbox ||
      arg === Platform.ps4
    ) {
      platform = arg;
      return;
    }

    // a number was sent
    if (Number.isInteger(Number(arg))) {
      priceGoal = arg;
      return;
    }

    // a string that ends with "k" was sent
    if (arg.endsWith("k")) {
      priceGoal = Number(arg.replace("k", "000"));
      return;
    }

    // a percentage was given
    if (arg.endsWith("%")) {
      priceGoal = arg;
      return;
    }

    if (typeof arg === "string") {
      priceGoal = Number(arg.replace(",", ""));
      if (Number.isNaN(priceGoal)) priceGoal = null;
      return;
    }
  });

  if (!priceGoal) {
    // No price given, we will alert whenever it passes 5% of current
    priceGoal = "5%";
  }

  if (!platform) {
    msg.reply(
      "You need to specify a platform. Supported platforms: ps4, xbox, pc"
    );
    return;
  }

  const futbinPlayerData = await FUTBIN.getInfoFromUrl(futbinUrl);

  const futBinDataPrices = await FUTBIN.getCurrentBin(futbinPlayerData.id);

  let currentBINPrice = futBinDataPrices.find(l => l.platform === platform)
    .minBin;

  // if it's a string, it's percentage. Let's transform this number into a valid price
  if (typeof priceGoal === "string") {
    priceGoal =
      currentBINPrice + currentBINPrice * (parseFloat(priceGoal) / 100);
  }

  let priceDirection =
    currentBINPrice < priceGoal ? PriceDirection.up : PriceDirection.down;

  let guild: void | Guild;
  if (msg.guild) {
    guild = await Guild.findByDiscordGuild(msg.guild);
  }

  // check if player exists, if it does, then use it.. otherwise create a new one
  let player = await FUTPlayer.findOne({ futbin_id: futbinPlayerData.id });
  if (!player) player = new FUTPlayer();

  player.player_name = futbinPlayerData.name;
  player.futbin_id = futbinPlayerData.id;
  player.futbin_price_pc =
    futBinDataPrices.find(data => data.platform === "pc").minBin | 0;
  player.futbin_price_ps4 =
    futBinDataPrices.find(data => data.platform === "ps4").minBin | 0;
  player.futbin_price_xbox =
    futBinDataPrices.find(data => data.platform === "xbox").minBin | 0;
  player.futbin_url = futbinUrl;
  player.price_last_updated_at = new Date();
  player.save();

  // Create alert
  let alert = new Alert();
  alert.price_started = currentBINPrice;
  alert.price_goal = priceGoal;
  alert.platform = platform;
  alert.price_direction = priceDirection;
  alert.added_by_user_id = msg.member.id;
  alert.channel_id = msg.channel.id;
  alert.player = player;
  alert.guild = guild;
  alert.save();

  msg.channel.send(
    `I will send a message on this channel once ${
      player.player_name
    } goes ${priceDirection} to ${priceGoal} on ${platform}. Current BIN: ${currentBINPrice}`
  );

  // register
};
