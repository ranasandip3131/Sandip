// Education Hub Nepal - Supabase Connection

if (!window.supabase) {
  throw new Error("Supabase library not loaded!");
}

const SUPABASE_URL = "https://mnfcewhvhteqlxenkkdm.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_eBXI069Vn5dnfUesLU5IwQ_XU12PMJS";

window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client created successfully!");
