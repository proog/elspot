import { getCheapestRange } from "../functions-lib/cheapest-range";
import { getForecast } from "../functions-lib/forecast";

export async function onRequestGet(context) {
  const queryParams = new URL(context.request.url).searchParams;
  const maxEndTime = new Date(queryParams.get("maxEndTime"));
  const hours = parseInt(queryParams.get("hours"));

  if (isNaN(maxEndTime.getTime()) || isNaN(hours)) {
    return new Response(
      JSON.stringify({
        message: "maxEndTime and hours parameters could not be parsed",
      }),
      { status: 400 }
    );
  }

  const forecast = await getForecast();
  const cheapestRange = getCheapestRange(forecast, maxEndTime, hours);

  return new Response(JSON.stringify(cheapestRange), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
