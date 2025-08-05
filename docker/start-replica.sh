#!/bin/bash
set -e

echo 'Waiting for primary database to be ready...'
until PGPASSWORD=${POSTGRES_PASSWORD} pg_isready -h db -p 5432 -U ${POSTGRES_USER} -d ${POSTGRES_DB}; do
  echo 'Still waiting for primary...'
  sleep 3
done

echo 'Primary database is ready. Setting up replica...'

if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
  echo 'Initializing replica data directory...'
  rm -rf /var/lib/postgresql/data/*
  
  PGPASSWORD=${POSTGRES_REPLICATION_PASSWORD} pg_basebackup \
    -h db \
    -D /var/lib/postgresql/data \
    -U ${POSTGRES_REPLICATION_USER} \
    -v -P -X stream
  
  # Create standby.signal file for PostgreSQL 12+
  touch /var/lib/postgresql/data/standby.signal
  
  # Add replication settings to postgresql.auto.conf
  echo "primary_conninfo = 'host=db port=5432 user=${POSTGRES_REPLICATION_USER} password=${POSTGRES_REPLICATION_PASSWORD}'" >> /var/lib/postgresql/data/postgresql.auto.conf
  echo "hot_standby = on" >> /var/lib/postgresql/data/postgresql.auto.conf
  
  chmod 700 /var/lib/postgresql/data
fi

echo 'Starting PostgreSQL replica...'
exec postgres -c config_file=/etc/postgresql/postgresql.conf
