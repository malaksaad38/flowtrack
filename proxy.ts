import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PROTECTED = ["/dashboard", "/expenses", "/add"];
const AUTH_ONLY = ["/login", "/signup"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get session from Better Auth
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    // Redirect authenticated users away from login/signup
    if (session && AUTH_ONLY.some((p) => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Redirect unauthenticated users away from protected pages
    if (!session && PROTECTED.some((p) => pathname.startsWith(p))) {
        const url = new URL("/login", request.url);
        url.searchParams.set("from", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}