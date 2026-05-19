const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseApiKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseApiKey) {
  throw new Error(
    "Missing SUPABASE_URL and API key. Set SUPABASE_SECRET_KEY (new dashboard) or SUPABASE_SERVICE_ROLE_KEY (legacy)."
  );
}

const supabase = createClient(supabaseUrl, supabaseApiKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase };
