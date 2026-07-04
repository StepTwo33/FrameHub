import { redirect } from "next/navigation";

export default function ModBrowserRedirect() {
  redirect("/codex?section=mods");
}
