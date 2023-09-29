export async function getExchangeRate(from, to) {
  const url = new URL("https://api.frankfurter.app/latest");
  url.searchParams.set("from", from.toUpperCase());
  url.searchParams.set("to", to.toUpperCase());

  const res = await fetch(url.toString(), {
    // Cloudflare: cache successful statuses for a day
    cf: {
      cacheTtlByStatus: {
        "200-299": 60 * 60 * 24,
      },
    },
  });

  if (!res.ok) {
    throw new Error("Could not fetch EUR to DKK rates");
  }

  const data = await res.json();
  return data.rates.DKK;
}
