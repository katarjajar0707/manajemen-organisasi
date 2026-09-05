"use server";

export async function checkServerStatus() {
  return { status: "ok", timestamp: new Date().toISOString() };
}
