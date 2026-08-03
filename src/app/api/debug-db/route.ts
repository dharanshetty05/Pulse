import { NextResponse } from "next/server";

export async function GET() {
    const url = new URL(process.env.DATABASE_URL!);

    return NextResponse.json({
        host: url.host,
        port: url.port,
        params: url.search,
    });
}