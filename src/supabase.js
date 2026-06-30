import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "sb_publishable_9FDvd5tbSkrZJfd-qZeNBQ_49AqBWd_";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);