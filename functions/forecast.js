import { getExchangeRate } from "../functions-lib/exchange-rate";
import { getForecast } from "../functions-lib/forecast";

export async function onRequestGet(context) {
  const [forecastInEur, eurToDkkRate] = await Promise.all([
    getForecast(),
    getExchangeRate("EUR", "DKK"),
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
