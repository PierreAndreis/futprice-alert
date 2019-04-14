import FUTBIN from "./../FUTBIN";
import { FUTPlayer } from "../entity/FUTPlayer";
import {
  MoreThan,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Raw
} from "typeorm";

class UpdatePricesCron {
  time = "every minute";

  async run() {
    const playersToSearch = await FUTPlayer.find({
      where: {
        price_last_updated_at: Raw(
          alias => `${alias} <= NOW() - INTERVAL '5 minutes'`
        )
      },
      take: 5,
      order: {
        price_last_updated_at: "ASC"
      }
    });

    // Update last updated at to avoid concurrency on the same player
    await Promise.all(
      playersToSearch.map(player => {
        player.price_last_updated_at = new Date();
        player.save();
      })
    );

    for (let player of playersToSearch) {
      // console.log("Updating", player.player_name);
      const playerPrice = await FUTBIN.getCurrentBin(player.futbin_id);

      player.futbin_price_pc =
        playerPrice.find(data => data.platform === "pc").minBin | 0;
      player.futbin_price_ps4 =
        playerPrice.find(data => data.platform === "ps4").minBin | 0;
      player.futbin_price_xbox =
        playerPrice.find(data => data.platform === "xbox").minBin | 0;
      player.price_last_updated_at = new Date();
      player.save();
      // console.log("Done", player.player_name);
    }
  }
}

export default new UpdatePricesCron();
