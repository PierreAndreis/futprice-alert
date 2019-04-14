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
  url: string
): Promise<{ id: string; name: string }> {
  const response = await fetch(url, fetchOptions).then(r => r.text());

  let playerId = response.match(
    /<div id="page-info" data-page="1" data-year="19" data-player-resource="([0-9]*)"/
  );

  if (!playerId) throw new Error("PlayerId not found");

  const playerName = response.match(
    new RegExp(/span class="header_name">(.*)</)
  );

  return {
    id: playerId[1],
    name: playerName[1]
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
      minBin: Number(ps.LCPrice.replace(",", ""))
    },
    {
      platform: "xbox",
      lastUpdated: xbox.lastUpdated,
      minBin: Number(xbox.LCPrice.replace(",", ""))
    },
    {
      platform: "pc",
      lastUpdated: pc.lastUpdated,
      minBin: Number(pc.LCPrice.replace(",", ""))
    }
  ];
}

export default {
  getInfoFromUrl,
  getCurrentBin
};
