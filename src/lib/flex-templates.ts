// ============================================
// LINE Flex Message テンプレート集
// Flex MessageはLINEのリッチなカード型メッセージ形式。
// テキストメッセージより視覚的に整理された情報を送れる。
// 参考: https://developers.line.biz/ja/docs/messaging-api/flex-message-overview/
// ============================================

// オンボーディング完了時に「使い方ガイド」を表示するFlex Message
// オーナーがLinoaで何ができるかを直感的に理解できるカード形式
export function buildOnboardingGuideFlex(): object {
  // 各機能のサンプル例: 絵文字 / タイトル / サンプル発話
  const features: Array<{ icon: string; title: string; example: string }> = [
    { icon: "📊", title: "売上を記録", example: "「今日18万、52人だった」" },
    { icon: "📱", title: "SNS投稿を作成", example: "「Instagram投稿作って」" },
    { icon: "👥", title: "顧客メモ", example: "「田中さん来週誕生日」" },
    { icon: "💡", title: "経営相談", example: "「ランチ客が減ってるけど何が原因？」" },
    { icon: "📝", title: "口コミ返信", example: "「クチコミ来た。返信考えて」" },
    { icon: "📈", title: "レポート確認", example: "「先週の売上どうだった？」" },
  ];

  return {
    type: "bubble",
    size: "giga",
    header: {
      type: "box",
      layout: "vertical",
      paddingAll: "lg",
      backgroundColor: "#0F172A",
      contents: [
        {
          type: "text",
          text: "Linoa でできること",
          weight: "bold",
          size: "lg",
          color: "#FFFFFF",
        },
        {
          type: "text",
          text: "話しかけるだけで、ぜんぶ伝わります",
          size: "xs",
          color: "#94A3B8",
          margin: "xs",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "lg",
      contents: features.map((f) => ({
        type: "box",
        layout: "vertical",
        spacing: "xs",
        contents: [
          {
            type: "box",
            layout: "baseline",
            spacing: "sm",
            contents: [
              { type: "text", text: f.icon, size: "md", flex: 0 },
              {
                type: "text",
                text: f.title,
                weight: "bold",
                size: "sm",
                color: "#0F172A",
              },
            ],
          },
          {
            type: "text",
            text: f.example,
            size: "xs",
            color: "#64748B",
            wrap: true,
            margin: "xs",
          },
        ],
      })),
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "md",
      backgroundColor: "#F8FAFC",
      contents: [
        {
          type: "text",
          text: "気軽に話しかけてください 🌱",
          size: "xs",
          color: "#64748B",
          align: "center",
        },
      ],
    },
  };
}

// SNS投稿案を表示するFlex Message
// Instagram用・X用の2パターンを1枚のカードに収める
// フッターに「OK・使います」「別案を作る」ボタンを配置
export function buildSnsPostFlex(instagram: string, twitter: string): object {
  return {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "lg",
      contents: [
        {
          type: "text",
          text: "SNS投稿案",
          weight: "bold",
          size: "lg",
          color: "#111111",
        },
        { type: "separator", margin: "md" },
        {
          type: "text",
          text: "📷 Instagram",
          weight: "bold",
          size: "sm",
          color: "#E1306C",
          margin: "md",
        },
        {
          type: "text",
          text: instagram,
          wrap: true,
          size: "sm",
          color: "#333333",
          margin: "sm",
        },
        { type: "separator", margin: "md" },
        {
          type: "text",
          text: "𝕏  X（Twitter）",
          weight: "bold",
          size: "sm",
          color: "#000000",
          margin: "md",
        },
        {
          type: "text",
          text: twitter,
          wrap: true,
          size: "sm",
          color: "#333333",
          margin: "sm",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "horizontal",
      spacing: "sm",
      contents: [
        {
          type: "button",
          action: {
            type: "message",
            label: "OK・使います",
            text: "投稿OKです",
          },
          style: "primary",
          color: "#00B900",
          flex: 2,
        },
        {
          type: "button",
          action: {
            type: "message",
            label: "別案を作る",
            text: "投稿の別案を作って",
          },
          style: "secondary",
          flex: 1,
        },
      ],
    },
  };
}
