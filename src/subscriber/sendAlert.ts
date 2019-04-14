import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent
} from "typeorm";
import { FUTPlayer } from "../entity/FUTPlayer";
import { Alert, Platform, PriceDirection } from "../entity/Alert";
import { client } from "./../discord";
import { TextChannel } from "discord.js";

@EventSubscriber()
export class sendAlert implements EntitySubscriberInterface<FUTPlayer> {
  /**
   * Indicates that this subscriber only listen to FUTPlayer events.
   */
  listenTo() {
    return FUTPlayer;
  }

  /**
   * Called after FUTPlayer update.
   */
  async afterUpdate(event: UpdateEvent<FUTPlayer>) {
    const player = event.entity;
    const updatedColumns = event.updatedColumns.map(uc => uc.propertyName);

    const pricesColumns = [
      "futbin_price_ps4",
      "futbin_price_xbox",
      "futbin_price_pc"
    ];

    if (
      !updatedColumns.some(columnName =>
        pricesColumns.includes(columnName)
      )
    ) {
      return;
    }

    const allAlerts = await event.manager.find(Alert, {
      player: player
    });

    if (allAlerts.length < 1) {
      // No alert found for this player... let's delete?
      // Or should be the player responsibility?
      return;
    }

    allAlerts.forEach(async alert => {
      let currentPrice = {
        [Platform.ps4]: player.futbin_price_ps4,
        [Platform.pc]: player.futbin_price_pc,
        [Platform.xbox]: player.futbin_price_xbox
      }[alert.platform];

      let didHitGoal =
        alert.price_direction === PriceDirection.up
          ? currentPrice > alert.price_goal
          : currentPrice < alert.price_goal;
      if (!didHitGoal) return;

      // Alert is done, let's remove it
      await event.manager.remove(alert);

      const channel = client.channels.get(
        alert.channel_id
      ) as void | TextChannel;
      if (!channel || channel.type !== "text") {
        // if the channel is not found, then forget about it... it's already deleted anyway
        return;
      }

      console.log("Alert sent about ", player.player_name);
      await channel.send(
        `Price for ${
          player.player_name
        } is now ${currentPrice} on platform ${alert.platform}.`
      );
    });
  }
}
