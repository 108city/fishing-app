import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "www.takealot.com",
  "takealot.com",
  "www.sportsmanswarehouse.co.za",
  "sportsmanswarehouse.co.za",
  "www.capeunionmart.co.za",
  "capeunionmart.co.za",
  "purefishing.co.za",
  "www.purefishing.co.za"
]);

export function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to");
  if (!to) {
    return NextResponse.redirect(new URL("/#deals", req.url), 302);
  }
  let target: URL;
  try {
    target = new URL(to);
  } catch {
    return NextResponse.redirect(new URL("/#deals", req.url), 302);
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.redirect(new URL("/#deals", req.url), 302);
  }
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.redirect(new URL("/#deals", req.url), 302);
  }
  return NextResponse.redirect(target.toString(), 302);
}
