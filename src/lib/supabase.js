import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://icvookvnlhlxhrykxgyd.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljdm9va3ZubGhseGhyeWt4Z3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0OTcxMDksImV4cCI6MjA2OTA3MzEwOX0.fG2IQ4-9sAyp88SkbDiPAAel-pOVMT0h2Oz5SG_Y-Vo";

export const supabase = createClient(supabaseUrl, supabaseKey);
