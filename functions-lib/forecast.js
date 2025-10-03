export async function getForecast(priceArea, limit) {
  const prices = await getPrices(priceArea, limit);

  return prices.map((record) => ({
    time: new Date(record.TimeUTC + "Z"),
    priceEur: record.DayAheadPriceEUR / 1000,
  }));
}

async function getPrices(priceArea, limit = 50) {
  const url = new URL(
    "https://api.energidataservice.dk/dataset/DayAheadPrices"
  );
  url.searchParams.set("limit", limit);
  url.searchParams.set("filter", JSON.stringify({ PriceArea: priceArea }));
  url.searchParams.set("start", "NowUTC-PT2H");
  url.searchParams.set("sort", "TimeUTC asc");
  url.searchParams.set("columns", "TimeUTC,DayAheadPriceEUR");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`Could not fetch spot prices: ${await res.text()}`);
  }

  const data = await res.json();
  return data.records;
}
