import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import Annotation from "chartjs-plugin-annotation";

Chart.register(
  Annotation,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip
);

const dateTimeFormat = new Intl.DateTimeFormat(navigator.languages, {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const currencyFormat = new Intl.NumberFormat(navigator.languages, {
  style: "currency",
  currency: "DKK",
});
const refreshIntervalSeconds = 1800; // 30 minutes
const chartUpdateIntervalSeconds = 3;
const chart = createChart("#chart");

refresh();

let chartUpdateInterval;
setInterval(async () => {
  // Pause automatic chart updates to avoid concurrent calls to chart.update()
  clearInterval(chartUpdateInterval);

  await refresh();

  chartUpdateInterval = setInterval(
    () => chart.update(),
    chartUpdateIntervalSeconds * 1000
  );
}, refreshIntervalSeconds * 1000);

async function refresh() {
  let url = "/forecast";

  const areaParam = new URL(window.location.href).searchParams.get("area");
  if (areaParam) {
    url += `?area=${areaParam}`;
  }

  const response = await fetch(url).then((res) => res.json());
  const { forecast, priceArea } = response;

  chart.options.plugins.title.text = `El spotpris for ${priceArea} (opdateret ${dateTimeFormat.format(
    new Date()
  )})`;
  chart.data.datasets[0].data = forecast.map((record) => ({
    x: dateTimeFormat.format(new Date(record.time)),
    y: record.priceDkk,
  }));

  chart.update();
}

function createChart(selector) {
  let chartWidth, chartHeight, lineGradient;

  const ctx = document.querySelector(selector);
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        {
          label: "El spotpris",
          fill: true,
          tooltip: {
            callbacks: {
              label: (context) =>
                `${context.dataset.label}: ${currencyFormat.format(
                  context.parsed.y
                )}`,
            },
          },
          borderColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;

            if (!chartArea) {
              // This case happens on initial chart load
              return;
            }

            return getLineGradient(ctx, chartArea);
          },
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true },
        annotation: {
          annotations: {
            nowLine: {
              type: "line",
              scaleID: "x",
              label: { content: "Nu", display: true },
              value: (context) => {
                const data = context.chart.data.datasets[0].data;

                if (!data.length) {
                  return;
                }

                // Calculate an appropriate point between two data points on which to place a vertical line
                const now = new Date();
                const formattedNow = dateTimeFormat.format(now);
                const indexOfHour = data.reduce(
                  (result, point, index) =>
                    point.x <= formattedNow ? index : result,
                  -1
                );

                return indexOfHour + now.getMinutes() / 60;
              },
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "kr / kWh",
          },
        },
      },
    },
  });

  return chart;

  // https://www.chartjs.org/docs/latest/samples/advanced/linear-gradient.html
  function getLineGradient(ctx, chartArea) {
    const newChartWidth = chartArea.right - chartArea.left;
    const newChartHeight = chartArea.bottom - chartArea.top;
    if (
      !lineGradient ||
      chartWidth !== newChartWidth ||
      chartHeight !== newChartHeight
    ) {
      // Create the gradient because this is either the first render
      // or the size of the chart has changed
      chartWidth = newChartWidth;
      chartHeight = newChartHeight;
      lineGradient = ctx.createLinearGradient(
        0,
        chartArea.bottom,
        0,
        chartArea.top
      );
      lineGradient.addColorStop(0, "green");
      lineGradient.addColorStop(0.5, "yellow");
      lineGradient.addColorStop(1, "red");
    }

    return lineGradient;
  }
}
