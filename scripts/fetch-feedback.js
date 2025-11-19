const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env.local since we can't rely on dotenv being installed
try {
  const envPath = path.resolve(__dirname, '../.env.local');
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      process.env[key] = value;
    }
  });
} catch (e) {
  console.error('Error reading .env.local:', e.message);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchFeedback() {
  const { data, error } = await supabase
    .from('user_feedback')
    .select('*')
    .order('submitted_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching feedback:', error);
    return;
  }

  console.log(JSON.stringify(data, null, 2));
}

fetchFeedback();
