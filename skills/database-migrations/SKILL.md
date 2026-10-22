---
name: database-migrations
description: Write safe, zero-downtime, reversible database schema and data migrations using the expand-migrate-contract pattern, with lock-aware guidance for PostgreSQL, SQL Server and MySQL. Use when adding/renaming/dropping columns or tables, adding indexes or constraints, backfilling data, or reviewing a migration.
---

# Database migrations

## Principles
- Old code and new code must both work against the schema during deployment (rolling deploys!).
- Every migration is reviewed, versioned, idempotent where possible, and has a rollback path.
- Never edit a migration that has run in any shared environment - add a new one.
- Separate schema migrations from large data backfills.

## Expand -> Migrate -> Contract
Example: rename `customer.name` to `customer.full_name`.
1. **Release 1 (expand)**: add `full_name` (nullable). Code writes both columns, reads `name`.
2. **Backfill** in batches: `UPDATE ... SET full_name = name WHERE id BETWEEN x AND y AND full_name IS NULL`.
3. **Release 2**: code reads `full_name`, still writes both.
4. **Release 3 (contract)**: stop writing `name`; add `NOT NULL` to `full_name`; later drop `name`.

## Risky operations and safe alternatives
| Operation | Risk | Safer approach |
|---|---|---|
| Add column with default (old PG/MySQL) | table rewrite, long lock | add nullable, backfill, then set default/not null |
| Add `NOT NULL` | full scan with lock | PG: add `CHECK (...) NOT VALID`, then `VALIDATE CONSTRAINT` |
| Create index | write lock | PG `CREATE INDEX CONCURRENTLY`; SQL Server `ONLINE = ON`; MySQL `ALGORITHM=INPLACE, LOCK=NONE` |
| Add foreign key | locks both tables | PG `NOT VALID` then `VALIDATE` |
| Rename column/table | breaks running code | expand/contract, or a view |
| Drop column | breaks running code / ORM caching | stop using it first, drop in a later release |
| Change column type | rewrite + breaking | new column + backfill + switch |
| Large `UPDATE/DELETE` | long transaction, replication lag | batches of 1k-10k with pauses |

Set a `lock_timeout` / `statement_timeout` for migrations in PostgreSQL so they fail fast instead of blocking traffic.

## Checklist
- [ ] Works with both the previous and the new application version
- [ ] Estimated runtime and lock impact on production-sized data
- [ ] Down migration or documented manual rollback
- [ ] Backfill is batched, resumable and idempotent
- [ ] Indexes support the new queries (check plans)
- [ ] Tested against a copy of realistic data volume
- [ ] Generated SQL reviewed (ORMs can surprise you): `dotnet ef migrations script`, `prisma migrate diff`, `alembic upgrade --sql`, Flyway dry run
