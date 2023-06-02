export async function getForecast(priceArea) {
  const prices = await getPrices(priceArea);
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  return prices
    .filter((record) => new Date(record.HourUTC) > anHourAgo)
    .sort((a, b) => {
      if (a.HourUTC < b.HourUTC) return -1;
      if (a.HourUTC > b.HourUTC) return 1;
      return 0;
    });
}

async function getPrices(priceArea) {
  const url = new URL("https://api.energidataservice.dk/dataset/Elspotprices");
  url.searchParams.set("limit", "36");
  url.searchParams.set("filter", JSON.stringify({ PriceArea: priceArea }));
  url.searchParams.set("sort", "HourUTC desc");
  url.searchParams.set("columns", "HourUTC,SpotPriceEUR");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("Could not fetch spot prices");
  }

  const data = await res.json();
  return data.records;
}
