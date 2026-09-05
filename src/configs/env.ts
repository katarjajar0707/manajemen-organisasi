export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export function validateEnv() {
  const missingKeys: string[] = [];

  if (!env.supabaseUrl) missingKeys.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabaseAnonKey) missingKeys.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missingKeys.length > 0 && process.env.NODE_ENV === "production") {
    console.warn(`[WARNING] Missing environment variables: ${missingKeys.join(", ")}`);
  }
}
