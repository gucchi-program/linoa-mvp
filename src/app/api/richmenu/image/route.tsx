import { ImageResponse } from "next/og";

// LINE リッチメニュー用の画像を動的生成する。
// サイズはLINE公式仕様（コンパクト版）2500×843 ピクセル。
// 3分割: 左=SNS投稿 / 中央=レポート / 右=ヘルプ
// next/og はEdge Runtimeで動作し、絵文字・日本語ともに描画できる。
export const runtime = "edge";

const WIDTH = 2500;
const HEIGHT = 843;

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0F172A",
        }}
      >
        {/* セクション1: SNS投稿 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
            borderRight: "2px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 220, lineHeight: 1 }}>📱</div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            SNS投稿
          </div>
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.75)",
              fontWeight: 500,
            }}
          >
            Instagramの投稿を作る
          </div>
        </div>

        {/* セクション2: レポート */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            background: "linear-gradient(135deg, #06C755 0%, #059669 100%)",
            borderRight: "2px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ fontSize: 220, lineHeight: 1 }}>📈</div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            レポート
          </div>
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
            }}
          >
            売上のサマリーを見る
          </div>
        </div>

        {/* セクション3: ヘルプ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          }}
        >
          <div style={{ fontSize: 220, lineHeight: 1 }}>💡</div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-2px",
            }}
          >
            ヘルプ
          </div>
          <div
            style={{
              fontSize: 36,
              color: "rgba(255,255,255,0.65)",
              fontWeight: 500,
            }}
          >
            できることを確認
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
    }
  );
}
