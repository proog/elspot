import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";

Chart.register(
  CategoryScale,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip
);

const chart = createChart("#chart");
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

refresh();
setInterval(refresh, 30 * 60 * 1000);

async function refresh() {
  const forecast = await fetch("/forecast")
    .then((res) => res.json())
    .then((data) => data.forecast);

  chart.options.plugins.title.text = `El spotpris (opdateret ${dateTimeFormat.format(
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
