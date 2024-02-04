import { getExchangeRate } from "../functions-lib/exchange-rate";
import { getForecast } from "../functions-lib/forecast";

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const priceArea = searchParams.get("area") || "DK2";

  const [forecastInEur, eurToDkkRate] = await Promise.all([
    getForecast(priceArea),
    getExchangeRate("EUR", "DKK"),
  ]);

  const forecast = forecastInEur.map((record) => ({
    time: record.time.toISOString(),
    priceEur: record.priceEur,
    priceDkk: record.priceEur * eurToDkkRate,
  }));

  return new Response(JSON.stringify({ priceArea, forecast }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
