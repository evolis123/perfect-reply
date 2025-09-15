// DİQQƏT: Bu məlumatları öz açarlarınla əvəz etməyi unutma!
const SUPABASE_URL = 'https://brmpjxdlzqerydajuxah.supabase.co/auth/v1/callback'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJybXBqeGRsenFlcnlkYWp1eGFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4ODI4NzcsImV4cCI6MjA3MzQ1ODg3N30.DLi6guJPd70EJQg77zSaOEY9pY1LOteNzFemPj_0IFE';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase ilə əlaqə quruldu:', supabaseClient);

// Gələcəkdə düyməyə həyat verəcək kodumuz buraya yazılacaq
// ...