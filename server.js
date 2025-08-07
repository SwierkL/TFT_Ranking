const express = require('express');
const axios = require('axios');
require('dotenv').config();
const path = require('path');
const app = express();
const port = 3000;

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const gameName = "wearwolf";
const tagLine = "WOLF";

latestData = { 
    tier: 'UNRANKED', 
    rank: 'IV', 
    lp: 0 
  };

async function fetchTFTData() {
  try {

const riotRes = await axios.get(
      `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );
    const puuid = riotRes.data.puuid;
       console.log("🔑 PUUID gracza:", puuid);

    // 2. puuid → TFT ranking
    const rankRes = await axios.get(
      `https://eun1.api.riotgames.com/tft/league/v1/by-puuid/${puuid}`,
      { headers: { "X-Riot-Token": RIOT_API_KEY } }
    );

    const tftEntry = rankRes.data.find(entry => entry.queueType === "RANKED_TFT");
    

if (tftEntry && tftEntry.tier && tftEntry.rank) {
  latestData = {
    tier: tftEntry.tier,
    rank: tftEntry.rank,
    lp: tftEntry.leaguePoints
  };
} else {
  latestData = { 
    tier: 'UNRANKED', 
    rank: 'IV', 
    lp: 0 
  };
}

  } catch (err) {
    console.error("Błąd przy pobieraniu danych:", err.response?.data || err.message);
  }
}

fetchTFTData();
setInterval(fetchTFTData, 5 * 60 * 1000); // odświeżanie co 5 minut

app.use(express.static(path.join(__dirname, 'docs')));

app.get('/api/status', (req, res) => {
  res.json(latestData);
});

app.listen(port, () => {
  console.log(`Serwer działa na http://localhost:${port}`);
});
