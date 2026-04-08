// ============================================
// QuickChart API クライアント
// URLにチャート設定を渡すだけでグラフ画像（PNG）を返してくれるサービス。
// APIキー不要・サーバーサイド実装不要で使える。
// 参考: https://quickchart.io/
//
// LINE Image Messageの仕様:
// - HTTPS URLが必要
// - 最大10MB
// - QuickChartはHTTPS URLを返すのでそのまま使える
// ============================================

const QUICKCHART_BASE = "https://quickchart.io/chart";

interface SalesChartData {
  labels: string[];   // 日付ラベル（「4/1」「4/2」等）
  revenues: number[]; // 売上（円）
}

// 売上推移の折れ線グラフURLを生成する
export function buildSalesChartUrl(data: SalesChartData): string {
  const chartConfig = {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "売上（円）",
          data: data.revenues,
          fill: true,
          borderColor: "#00B900",
          backgroundColor: "rgba(0,185,0,0.1)",
          tension: 0.3,
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value: number) =>
              value >= 10000 ? `${value / 10000}万` : value.toString(),
          },
        },
      },
    },
  };

  const encoded = encodeURIComponent(JSON.stringify(chartConfig));
  return `${QUICKCHART_BASE}?c=${encoded}&width=500&height=250&backgroundColor=white`;
}
