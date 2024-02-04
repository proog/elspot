export function getCheapestRange(forecast, maxEndTime, hours) {
  const now = new Date();
  const options = forecast
    .slice(0, forecast.length - hours)
    .map((startRecord, index) => {
      const startTime = startRecord.time;
      const endTime = addHours(startTime, hours);
      const records = forecast.slice(index, index + hours);
      const sum = records.reduce((sum, r) => sum + r.priceEur, 0);

      return { startTime, endTime, records, sum };
    })
    .filter(
      (record) => now <= record.startTime && record.endTime <= maxEndTime
    );

  if (!options.length) {
    return {
      startTime: now,
      endTime: addHours(now, hours),
      records: [],
      sum: null,
    };
  }

  return options.reduce((cheapest, item) =>
    item.sum < cheapest.sum ? item : cheapest
  );
}

function addHours(date, hours) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}
