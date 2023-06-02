import { getCheapestRange } from "../functions-lib/cheapest-range";
import { getForecast } from "../functions-lib/forecast";

export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);

  const priceArea = searchParams.get("area") || "DK2";
  const maxEndTime = new Date(searchParams.get("maxEndTime"));
  const hours = parseInt(searchParams.get("hours"));

  if (isNaN(maxEndTime.getTime()) || isNaN(hours)) {
    return new Response(
      JSON.stringify({
        message: "maxEndTime and hours parameters could not be parsed",
      }),
      { status: 400 }
    );
  }

  const forecast = await getForecast(priceArea);
  const cheapestRange = getCheapestRange(forecast, maxEndTime, hours);

  return new Response(JSON.stringify({ ...cheapestRange, priceArea }), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
