export function getCheapestRange(forecast, maxEndTime, hours) {
  const options = forecast
    .slice(0, forecast.length - hours)
    .map((startRecord, index) => {
      const startTime = new Date(startRecord.HourUTC);
      const endTime = addHours(startTime, hours);
      const records = forecast.slice(index, index + hours);
      const sum = records.reduce((sum, r) => sum + r.SpotPriceEUR, 0);

      return { startTime, endTime, records, sum };
    })
    .filter((record) => record.endTime <= maxEndTime);

  if (!options.length) {
    return {
      startTime: addHours(maxEndTime, -hours),
      endTime: maxEndTime,
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
