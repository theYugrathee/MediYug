import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Uses anon key — safe for GitHub/Vercel.
// DB writes bypass RLS via SECURITY DEFINER SQL functions (RPCs).
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey);
