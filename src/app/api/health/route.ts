import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    appName: "Sistem Manajemen Karang Taruna",
    time: new Date().toISOString(),
  });
}
