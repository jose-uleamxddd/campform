const fs = require('fs');
const path = require('path');

const production = process.env.VERCEL === '1';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

const envContent = `export const environment = {
  production: ${production},
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}'
};
`;

// Crear carpeta si no existe
const envDir = path.join(__dirname, 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

// Escribir archivos
fs.writeFileSync(path.join(envDir, 'environment.ts'), envContent);
fs.writeFileSync(path.join(envDir, 'environment.development.ts'), envContent);

console.log('✅ Environment files generated successfully!');
console.log(`   - Production: ${production}`);
console.log(`   - Supabase URL: ${supabaseUrl ? 'Set' : 'NOT SET'}`);
console.log(`   - Supabase Key: ${supabaseKey ? 'Set' : 'NOT SET'}`);
