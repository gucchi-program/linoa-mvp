// app.li-noa.jp のルート。middleware が認証・契約状況をさばいてくれるので
// ログイン済み＋契約済みのユーザーは settings に飛ばす。
import { redirect } from "next/navigation";

export default function StoreHome() {
  redirect("/store/settings");
}
