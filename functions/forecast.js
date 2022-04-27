export async function onRequestGet(context) {
  const kv = context.env["elspot"];

  const [forecastInEur, eurToDkkRate] = await Promise.all([
    getForecast(),
    getEurToDkkRate(kv),
  ]);

  const forecast = forecastInEur.map((record) => ({
    time: record.HourUTC,
    priceEur: record.SpotPriceEUR / 1000,
    priceDkk: (record.SpotPriceEUR * eurToDkkRate) / 1000,
  }));

  return new Response(JSON.stringify({ forecast }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

async function getForecast() {
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
  const res = await fetch(
    "https://api.energidataservice.dk/datastore_search?resource_id=elspotprices&limit=36&filters={%22PriceArea%22:%20%22DK2%22}&sort=HourUTC%20desc&fields=HourUTC,SpotPriceEUR"
  );
  const data = await res.json();
  return data.result.records;
}

async function getEurToDkkRate(kv) {
  const url = "https://api.exchangerate.host/convert?from=EUR&to=DKK";

  let data = await kv.get(url, { type: "json" });

  if (!data) {
    const res = await fetch(url);
    data = await res.json();
    await kv.put(url, JSON.stringify(data), {
      expirationTtl: 60 * 60 * 24,
    });
  }

  return data.result;
}
