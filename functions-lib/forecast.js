export async function getForecast() {
  const prices = await getPrices();
  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  return prices
    .filter((record) => new Date(record.HourUTC) > anHourAgo)
    .sort((a, b) => {
      if (a.HourUTC < b.HourUTC) return -1;
      if (a.HourUTC > b.HourUTC) return 1;
      return 0;
    });
}

async function getPrices() {
  const url = new URL("https://api.energidataservice.dk/datastore_search");
  url.searchParams.set("resource_id", "elspotprices");
  url.searchParams.set("limit", "36");
  url.searchParams.set("filters", JSON.stringify({ PriceArea: "DK2" }));
  url.searchParams.set("sort", "HourUTC desc");
  url.searchParams.set("fields", "HourUTC,SpotPriceEUR");

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error("Could not fetch spot prices");
  }

  const data = await res.json();
  return data.result.records;
}
