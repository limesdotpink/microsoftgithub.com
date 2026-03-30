// straight up stolen from https://codebycorey.com/blog/page-views-nextjs-supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServerKey = process.env.SUPABASE_SERVICE_KEY || "";

let SupabaseAdmin;
if (supabaseUrl && supabaseServerKey) {
  SupabaseAdmin = createClient(supabaseUrl, supabaseServerKey);
}

export { SupabaseAdmin };
