import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: 'postgresql://guadua_db_user:yVqcbwvioxsMPYGYFmxgmHUQnwgy5Pfb@dpg-dag3av2jnfac73bi0480-a.oregon-postgres.render.com/guadua_db?sslmode=require', 
  ssl: { rejectUnauthorized: false } 
});

async function fix() {
  console.log('=== Fixing user_roles duplicates ===');
  
  // Delete duplicates keeping only one per user_id + role_id
  await pool.query(`
    DELETE FROM user_roles 
    WHERE ctid NOT IN (
      SELECT DISTINCT ON (user_id, role_id) ctid 
      FROM user_roles
    )
  `);
  console.log('✅ user_roles duplicates removed');

  console.log('\n=== Fixing platform_memberships roles ===');
  
  // platform_membership_role only has 'owner' and 'platform_support'
  // For tenant staff, keep as 'owner' (platform level)
  // Real roles are in tenant-level 'roles' table
  
  // Verify
  console.log('\n=== Verified user_roles ===');
  let r = await pool.query(`
    SELECT u.email, r.name as role
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email IN ('andres.morales@navaja.local', 'santiago.vega@navaja.local', 'mariana.reyes@navaja.local', 'app@navaja.local', 'admin@navaja.local')
    ORDER BY u.email
  `);
  console.table(r.rows);

  console.log('\n=== Verified platform_memberships ===');
  r = await pool.query(`
    SELECT pu.email, pm.role
    FROM platform_memberships pm
    JOIN platform_users pu ON pm.user_id = pu.id
    WHERE pu.email IN ('andres.morales@navaja.local', 'santiago.vega@navaja.local', 'mariana.reyes@navaja.local', 'app@navaja.local', 'admin@navaja.local')
    ORDER BY pu.email
  `);
  console.table(r.rows);

  await pool.end();
}

fix().catch(e => { console.error(e); pool.end(); });