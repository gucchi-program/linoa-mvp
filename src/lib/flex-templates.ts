// ============================================
// LINE Flex Message テンプレート集
// Flex MessageはLINEのリッチなカード型メッセージ形式。
// テキストメッセージより視覚的に整理された情報を送れる。
// 参考: https://developers.line.biz/ja/docs/messaging-api/flex-message-overview/
// ============================================

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
