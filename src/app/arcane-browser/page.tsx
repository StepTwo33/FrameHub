import { redirect } from "next/navigation";

export default function ArcaneBrowserRedirect() {
  redirect("/codex?section=arcanes");
}
