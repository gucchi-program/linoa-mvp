/**
 * 天候API（Open-Meteo）
 *
 * Open-Meteoは無料・APIキー不要の天気予報API。
 * 緯度経度を指定して、指定日の天候コードを取得する。
 * 天候コードをWMO標準コードから日本語に変換して返す。
 *
 * 現状は東京固定（将来的に店舗の所在地に対応可能）
 */

// 東京の緯度経度（デフォルト）
const DEFAULT_LAT = 35.6762;
const DEFAULT_LON = 139.6503;

// WMO Weather Code → 日本語マッピング
const WEATHER_CODES: Record<number, string> = {
  0: "快晴",
  1: "晴れ",
  2: "一部曇り",
  3: "曇り",
  45: "霧",
  48: "霧氷",
  51: "小雨",
  53: "雨",
  55: "強い雨",
  56: "凍雨",
  57: "強い凍雨",
  61: "小雨",
  63: "雨",
  65: "大雨",
  66: "凍雨",
  67: "強い凍雨",
  71: "小雪",
  73: "雪",
  75: "大雪",
  77: "みぞれ",
  80: "にわか雨",
  81: "にわか雨",
  82: "激しいにわか雨",
  85: "にわか雪",
  86: "激しいにわか雪",
  95: "雷雨",
  96: "雹を伴う雷雨",
  99: "激しい雹を伴う雷雨",
};

/**
 * 指定日の天候を取得する
 * @param date YYYY-MM-DD形式
 * @returns 天候の日本語文字列（取得失敗時はnull）
 */
export async function getWeather(date: string): Promise<string | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(DEFAULT_LAT));
    url.searchParams.set("longitude", String(DEFAULT_LON));
    url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min");
    url.searchParams.set("start_date", date);
    url.searchParams.set("end_date", date);
    url.searchParams.set("timezone", "Asia/Tokyo");

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();
    const weatherCode = data.daily?.weather_code?.[0];
    const maxTemp = data.daily?.temperature_2m_max?.[0];
    const minTemp = data.daily?.temperature_2m_min?.[0];

    if (weatherCode === undefined) return null;

    const weatherName = WEATHER_CODES[weatherCode] ?? `不明(${weatherCode})`;

    // 気温情報がある場合は付加
    if (maxTemp !== undefined && minTemp !== undefined) {
      return `${weatherName}（${minTemp}℃〜${maxTemp}℃）`;
    }

    return weatherName;
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}
