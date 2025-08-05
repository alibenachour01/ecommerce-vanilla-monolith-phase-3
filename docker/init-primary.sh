#!/bin/bash
set -e

# This script runs in the primary database to set up replication user
echo "Creating replication user..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create replication user if it doesn't exist
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'replicator') THEN
            CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator123';
            GRANT CONNECT ON DATABASE $POSTGRES_DB TO replicator;
        END IF;
    END
    \$\$;
EOSQL

echo "Replication user setup complete."
