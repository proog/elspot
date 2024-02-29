export async function getForecast(priceArea, limit) {
  const prices = await getPrices(priceArea, limit);

  return prices.map((record) => ({
    time: new Date(record.HourUTC + "Z"),
    priceEur: record.SpotPriceEUR / 1000,
  }));
}

async function getPrices(priceArea, limit = 50) {
  const url = new URL("https://api.energidataservice.dk/dataset/Elspotprices");
  url.searchParams.set("limit", limit);
  url.searchParams.set("filter", JSON.stringify({ PriceArea: priceArea }));
  url.searchParams.set("start", "NowUTC-PT1H");
  url.searchParams.set("sort", "HourUTC asc");
  url.searchParams.set("columns", "HourUTC,SpotPriceEUR");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("Could not fetch spot prices");
  }

  const data = await res.json();
  return data.records;
}
