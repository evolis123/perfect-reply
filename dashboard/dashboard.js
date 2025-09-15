// Supabase kitabxanasından lazımi funksiyanı götürürük
const { createClient } = supabase;

// Dünən qeyd etdiyin Supabase URL və Açarını bura yapışdır
const SUPABASE_URL = 'SENİN_SUPABASE_URLİN'; 
const SUPABASE_ANON_KEY = 'SENİN_SUPABASE_ANON_AÇARIN';

// Supabase klientini yaradırıq ki, onunla əməliyyatlar apara bilək
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase ilə əlaqə quruldu:', supabaseClient);