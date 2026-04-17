import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isDeniedPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  // Segment-based so we do not match benign paths like `/docs/.gitignore` or `/.environment`.
  const badSegment = (seg: string) => {
    if (!seg) return false;
    if (seg === ".git" || seg === ".svn" || seg === ".aws") return true;
    if (seg === ".env" || seg.startsWith(".env.")) return true;
    return false;
  };
  if (p.split("/").some(badSegment)) return true;
  if (p.startsWith("/wp-admin") || p.startsWith("/wp-login") || p.startsWith("/wp-includes") || p.startsWith("/wp-content")) return true;
  if (p.startsWith("/xmlrpc.php")) return true;
  if (p.startsWith("/phpmyadmin") || p.startsWith("/pma/")) return true;
  if (p.startsWith("/adminer")) return true;
  if (p.startsWith("/vendor/phpunit")) return true;
  if (p.startsWith("/actuator/")) return true;
  if (p === "/server-status" || p.startsWith("/server-status/")) return true;
  return false;
}

export function middleware(request: NextRequest) {
  if (isDeniedPath(request.nextUrl.pathname)) {
    return new NextResponse(null, { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icons/|api/|favicon.ico|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|html|js|css|woff2?)$).*)",
  ],
};
