import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: 'postgresql://guadua_db_user:yVqcbwvioxsMPYGYFmxgmHUQnwgy5Pfb@dpg-dag3av2jnfac73bi0480-a.oregon-postgres.render.com/guadua_db?sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});

async function check() {
  console.log('=== users with roles ===');
  let r = await pool.query(`
    SELECT u.id, u.email, u.name, r.name as role
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email IN ('andres.morales@navaja.local', 'santiago.vega@navaja.local', 'mariana.reyes@navaja.local', 'app@navaja.local', 'admin@navaja.local')
  `);
  console.table(r.rows);

  console.log('\n=== platform_memberships role ===');
  r = await pool.query(`
    SELECT pu.email, pm.role
    FROM platform_memberships pm
    JOIN platform_users pu ON pm.user_id = pu.id
    WHERE pu.email IN ('andres.morales@navaja.local', 'santiago.vega@navaja.local', 'mariana.reyes@navaja.local', 'app@navaja.local', 'admin@navaja.local')
  `);
  console.table(r.rows);

  await pool.end();
}

check().catch(e => { console.error(e); pool.end(); });