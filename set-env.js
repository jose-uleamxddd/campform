const fs = require('fs');
const path = require('path');

// Variables de entorno de Vercel
const production = process.env.production === 'true';
const supabaseUrl = process.env.supabaseUrl || '';
const supabaseKey = process.env.supabaseKey || '';

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
