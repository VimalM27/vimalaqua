// ===================================================
// Supabase connection config
// Find these in: Supabase Dashboard > Project Settings > API
// ===================================================
const SUPABASE_URL = "https://colmyyuwvqijzdeskjmh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_59LgUr6efJ4p0mAALpXcnw_omXBSPxF";
 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
 