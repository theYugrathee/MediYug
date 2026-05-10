import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

// Uses anon key — safe for GitHub/Vercel.
// DB writes bypass RLS via SECURITY DEFINER SQL functions (RPCs).
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
