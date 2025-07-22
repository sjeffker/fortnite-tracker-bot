const puppeteer = require("puppeteer");
const axios = require("axios");

const SHEET_WEBHOOK_URL = process.env.SHEET_WEBHOOK_URL;
const PLAYERS = ["FRANTIC84", "Staalsko", "Ome JeffreY", "Dylanvdp._"];

async function scrapePlayer(name) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(`https://fortnitetracker.com/profile/all/${encodeURIComponent(name)}`, { waitUntil: "domcontentloaded" });

  const data = { player: name, overall: {}, duo: {}, trio: {}, squad: {} };

  try {
    const overallEl = await page.$(".trn-defstat__value");
    if (overallEl) {
      const text = await page.evaluate(el => el.textContent, overallEl);
      data.overall.kd = text;
    }
  } catch (err) {
    data.overall.kd = "–";
  }

  await browser.close();
  return data;
}

async function main() {
  const results = [];
  for (const player of PLAYERS) {
    const r = await scrapePlayer(player);
    results.push(r);
    try {
      await axios.post(SHEET_WEBHOOK_URL, r);
    } catch (err) {
      console.error("POST failed for", r.player);
    }
  }
  console.log("Finished scraping:", results.map(r => r.player).join(", "));
}

main();