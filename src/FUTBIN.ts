import fetch from "node-fetch";

const fetchOptions = {
  credentials: "include",
  headers: {
    accept: "application/json, text/javascript, */*; q=0.01",
    "accept-language": "en-US,en;q=0.9",
    "x-requested-with": "XMLHttpRequest",
    "Referrer-Policy": "no-referrer-when-downgrade"
  },
  method: "GET",
  mode: "cors"
};

async function getInfoFromUrl(
  url: string,
  options: void | { thumbnail: boolean }
): Promise<{ id: string; name: string; thumbnail: void | string }> {
  const response = await fetch(url, fetchOptions).then(r => r.text());

  let playerId = response.match(
    /<div id="page-info" data-page="1" data-year="19" data-player-resource="([0-9]*)"/
  );

  if (!playerId) throw new Error("PlayerId not found");

  const playerName = response.match(
    new RegExp(/span class="header_name">(.*)</)
  );

  let playerImage;

  if (options && options.thumbnail) {
    playerImage = response.match(
      /<img class="pcdisplay-picture-width " id="player_pic" src="(.*)">/
    );
  }

  return {
    id: playerId[1],
    name: playerName[1],
    thumbnail: playerImage && playerImage[1]
  };
}

async function getCurrentBin(playerId: string) {
  const data = await fetch(
    `https://www.futbin.com/19/playerPrices?player=${playerId}`,
    fetchOptions
  ).then(r => r.json());

  const prices = data[playerId].prices;

  const { ps, xbox, pc } = prices;

  return [
    {
      platform: "ps4",
      lastUpdated: ps.lastUpdated,
      minBin: Number(ps.LCPrice.replace(/,/g, ""))
    },
    {
      platform: "xbox",
      lastUpdated: xbox.lastUpdated,
      minBin: Number(xbox.LCPrice.replace(/,/g, ""))
    },
    {
      platform: "pc",
      lastUpdated: pc.lastUpdated,
      minBin: Number(pc.LCPrice.replace(/,/g, ""))
    }
  ];
}

export default {
  getInfoFromUrl,
  getCurrentBin
};
