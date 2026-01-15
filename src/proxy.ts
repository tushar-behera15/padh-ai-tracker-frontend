import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;

    // Protect dashboard routes
    if (
        request.nextUrl.pathname.startsWith("/dashboard") &&
        !token
    ) {
        return NextResponse.redirect(
            new URL("/login", request.url)
        );
    }

    // Prevent logged-in users from accessing login
    if (
        request.nextUrl.pathname === "/login" &&
        token
    ) {
        return NextResponse.redirect(
            new URL("/dashboard", request.url)
        );
    }

    return NextResponse.next();
}
export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
