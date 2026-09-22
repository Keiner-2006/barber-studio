import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: 'postgresql://guadua_db_user:yVqcbwvioxsMPYGYFmxgmHUQnwgy5Pfb@dpg-dag3av2jnfac73bi0480-a.oregon-postgres.render.com/guadua_db?sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});

const auth = betterAuth({ database: pool, emailAndPassword: { enabled: true } });

const users = [
  { email: 'admin@navaja.local', password: 'admin123', name: 'Administrador Navaja' },
  { email: 'app@navaja.local', password: 'admin123', name: 'Usuario App' },
  { email: 'andres.morales@navaja.local', password: 'admin123', name: 'Andrés Morales' },
  { email: 'santiago.vega@navaja.local', password: 'admin123', name: 'Santiago Vega' },
  { email: 'mariana.reyes@navaja.local', password: 'admin123', name: 'Mariana Reyes' },
];

async function resetPasswords() {
  for (const u of users) {
    // Delete existing account first
    await pool.query('DELETE FROM account WHERE "userId" IN (SELECT id FROM "user" WHERE email = $1)', [u.email]);
    await pool.query('DELETE FROM "user" WHERE email = $1', [u.email]);
    
    // Create fresh with known password
    const res = await auth.api.signUpEmail({ body: { email: u.email, password: u.password, name: u.name } });
    console.log('✅', u.email, '->', res.user?.id);
  }
  await pool.end();
}

resetPasswords().catch(e => { console.error(e); pool.end(); });