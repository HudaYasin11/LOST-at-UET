import { supabase } from './config.js';

// Shared client-side gate for every page that requires an authenticated session.
// Individual pages keep their own data checks as a second layer.
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
    const next = `${window.location.pathname.split('/').pop() || ''}${window.location.search}`;
    const query = next ? `?redirect=${encodeURIComponent(next)}` : '';
    window.location.replace(`index.html${query}`);
} else {
    document.documentElement.classList.add('auth-ready');
}