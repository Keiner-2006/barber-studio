import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: 'postgresql://guadua_db_user:yVqcbwvioxsMPYGYFmxgmHUQnwgy5Pfb@dpg-dag3av2jnfac73bi0480-a.oregon-postgres.render.com/guadua_db?sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});

async function check() {
  console.log('=== staffProfiles ===');
  let r = await pool.query('SELECT id, user_id, display_name, status FROM staff_profiles');
  console.table(r.rows);

  console.log('\n=== users with roles ===');
  r = await pool.query(`
    SELECT u.id, u.email, u.name, r.name as role
    FROM users u
    LEFT JOIN "userRoles" ur ON u.id = ur."userId"
    LEFT JOIN roles r ON ur."roleId" = r.id
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