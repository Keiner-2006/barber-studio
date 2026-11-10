#!/usr/bin/env node
/**
 * Grant or revoke the global platform_admin role (spec D1, option A) with an audit record.
 *
 *   DATABASE_URL=... node scripts/platform-admin.js grant  <email> --actor <your-email> --reason "<why>"
 *   DATABASE_URL=... node scripts/platform-admin.js revoke <email> --actor <your-email> --reason "<why>"
 *   DATABASE_URL=... node scripts/platform-admin.js list
 *
 * A grant is a platform_memberships row with tenant_id NULL and role 'platform_admin'.
 * Revoke sets status = 'revoked' (kept for history). Both write a platform_audit_events row in the same
 * transaction. The target must already exist in platform_users (i.e. has signed in through Better Auth).
 */
const { Client } = require('pg');

function arg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const [command, rawEmail] = process.argv.slice(2);
  const url = process.env.DATABASE_URL || process.env.PLATFORM_DATABASE_URL;
  if (!url) throw new Error('Set DATABASE_URL');
  if (!['grant', 'revoke', 'list'].includes(command)) {
    throw new Error('Usage: platform-admin.js grant|revoke <email> --actor <email> --reason "<text>" | list');
  }

  const client = new Client({ connectionString: url, ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false } });
  await client.connect();
  try {
    if (command === 'list') {
      const { rows } = await client.query(
        `select pu.email, pm.status, pm.created_at, pm.updated_at
           from platform_memberships pm join platform_users pu on pu.id = pm.user_id
          where pm.role = 'platform_admin' and pm.tenant_id is null order by pm.created_at`,
      );
      console.table(rows);
      return;
    }

    const email = (rawEmail || '').trim().toLowerCase();
    const actorEmail = (arg('actor') || '').trim().toLowerCase();
    const reason = arg('reason');
    if (!email || !actorEmail || !reason) throw new Error('email, --actor and --reason are required');

    await client.query('begin');
    const target = await client.query('select id, status from platform_users where lower(email) = $1', [email]);
    if (!target.rowCount) throw new Error(`No platform user with email ${email}`);
    const actor = await client.query('select id from platform_users where lower(email) = $1', [actorEmail]);
    const userId = target.rows[0].id;

    const existing = await client.query(
      `select id, status from platform_memberships where user_id = $1 and role = 'platform_admin' and tenant_id is null`,
      [userId],
    );

    let membershipId;
    if (command === 'grant') {
      if (target.rows[0].status !== 'active') throw new Error(`User ${email} is ${target.rows[0].status}, not active`);
      if (existing.rowCount) {
        membershipId = existing.rows[0].id;
        await client.query(`update platform_memberships set status = 'active', updated_at = now() where id = $1`, [membershipId]);
      } else {
        const ins = await client.query(
          `insert into platform_memberships (tenant_id, user_id, role, status) values (null, $1, 'platform_admin', 'active') returning id`,
          [userId],
        );
        membershipId = ins.rows[0].id;
      }
    } else {
      if (!existing.rowCount) throw new Error(`${email} has no platform_admin grant`);
      membershipId = existing.rows[0].id;
      await client.query(`update platform_memberships set status = 'revoked', updated_at = now() where id = $1`, [membershipId]);
    }

    await client.query(
      `insert into platform_audit_events (actor_id, tenant_id, action, resource, resource_id, result, metadata)
       values ($1, null, $2, 'platform_membership', $3, 'success', $4)`,
      [
        actor.rows[0]?.id ?? null,
        command === 'grant' ? 'platform_admin.grant' : 'platform_admin.revoke',
        membershipId,
        JSON.stringify({ targetEmail: email, actorEmail, reason, via: 'scripts/platform-admin.js' }),
      ],
    );
    await client.query('commit');
    console.log(`${command} platform_admin for ${email}: ok (membership ${membershipId})`);
    console.log('Note: active sessions keep their cached identity for up to 30s.');
  } catch (err) {
    await client.query('rollback').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
