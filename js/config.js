import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://tumrnrszpjudmzuyduac.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_nsao3nhyCO1vwltonUqKBQ_J53uQ0En";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// ========================================
// API CONFIGURATION
// ========================================

export const API_BASE_URL = `${SUPABASE_URL}/functions/v1/api`;

export const APP_NAME = 'LOST@UET';
export const APP_VERSION = '1.0.0';

export default {
    supabase,
    API_BASE_URL,
    APP_NAME,
    APP_VERSION
};