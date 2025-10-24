# Database Migrations

This directory contains database migration scripts for **bibliotecamoi.com**.

## Migration Files

Migrations are numbered sequentially and should be executed in order:

- 001_add_enrichment_fields.sql - Adds book metadata enrichment fields

## How to Apply Migrations

### Manual Application

To apply a specific migration:

```bash
cd /var/www/biblioteca-moi
PGPASSWORD=biblioteca_secure_password_2025 psql -h localhost -U biblioteca_user -d biblioteca_moi -f migrations/001_add_enrichment_fields.sql
```

## Migration Naming Convention

Format: NNN_description.sql
- NNN = Sequential number (001, 002, 003...)
- description = Brief description using snake_case

## Best Practices

1. Always use IF NOT EXISTS to make migrations idempotent
2. Test locally first before applying to production
3. Document changes with comments in the SQL file
4. Keep migrations small - one logical change per file

## Checking Applied Migrations

To see current database schema:

```bash
PGPASSWORD=biblioteca_secure_password_2025 psql -h localhost -U biblioteca_user -d biblioteca_moi -c "\d books"
```

## Important Notes

- Migrations are NOT automatically applied on deployment
- After git pull, always check if new migrations exist
- Run migrations BEFORE restarting the app with PM2
