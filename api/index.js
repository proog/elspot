import { getCheapestRange } from "../functions-lib/cheapest-range";
import { getExchangeRate } from "../functions-lib/exchange-rate";
import { getForecast } from "../functions-lib/forecast";

export default {
  async fetch(request) {
    const { pathname, searchParams } = new URL(request.url);
    const priceArea = searchParams.get("area") || "DK2";

    if (pathname.startsWith("/forecast")) {
      const limit = parseInt(searchParams.get("limit")) || 50;
      const [forecastInEur, eurToDkkRate] = await Promise.all([
        getForecast(priceArea, limit),
        getExchangeRate("EUR", "DKK"),
      ]);

      const forecast = forecastInEur.map((record) => ({
        time: record.time,
        priceEur: record.priceEur,
        priceDkk: record.priceEur * eurToDkkRate,
      }));

      return json({ priceArea, forecast });
    } else if (pathname.startsWith("/cheapest-range")) {
      const maxEndTime = new Date(searchParams.get("maxEndTime"));
      const hours = parseInt(searchParams.get("hours"));

      if (isNaN(maxEndTime.getTime()) || isNaN(hours)) {
        return json(
          { message: "maxEndTime and hours parameters could not be parsed" },
          400
        );
      }

      const forecast = await getForecast(priceArea);
      const cheapestRange = getCheapestRange(forecast, maxEndTime, hours);

      return json({ ...cheapestRange, priceArea });
    }

    return new Response(null, { status: 404 });
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
