# PostgreSQL Read Replica Implementation with Docker Compose

## Overview

This document provides a comprehensive technical guide to implementing PostgreSQL read replicas using Docker Compose. The implementation creates a primary-replica architecture with 1 primary database and 2 read replicas, enabling horizontal scaling for read operations and improved fault tolerance.

## Architecture Diagram

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Primary DB    │    │   Replica-1     │    │   Replica-2     │
│   (Port 5432)   │    │   (Port 5433)   │    │   (Port 5434)   │
│                 │    │                 │    │                 │
│   Read/Write    │───▶│   Read Only     │    │   Read Only     │
│   Operations    │    │   Operations    │    │   Operations    │
│                 │    │                 │    │                 │
│   WAL Streaming │───▶│   WAL Receiver  │    │   WAL Receiver  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    WAL (Write-Ahead Log) Streaming
```

## Technical Components

### 1. Primary Database Configuration

#### **Service Definition**

```yaml
db:
  image: postgres:16
  restart: always
  env_file:
    - ./docker/postgres.env
  volumes:
    - pgdata:/var/lib/postgresql/data
    - ./docker/postgresql-primary.conf:/etc/postgresql/postgresql.conf
    - ./docker/pg_hba.conf:/etc/postgresql/pg_hba.conf
    - ./docker/init-primary.sh:/docker-entrypoint-initdb.d/init-primary.sh
  ports:
    - '5432:5432'
  command: postgres -c config_file=/etc/postgresql/postgresql.conf -c hba_file=/etc/postgresql/pg_hba.conf
  healthcheck:
    test: [ "CMD-SHELL", "PGPASSWORD=${POSTGRES_PASSWORD} pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}" ]
```

#### **Primary Configuration (`postgresql-primary.conf`)**

```properties
# Core replication settings
listen_addresses = '*'              # Accept connections from all addresses
wal_level = replica                 # Enable WAL logging for replication
max_wal_senders = 3                 # Allow up to 3 concurrent WAL senders
max_replication_slots = 3           # Support for 3 replication slots
synchronous_commit = off            # Async replication for performance

# Archive settings
archive_mode = on                   # Enable WAL archiving
archive_command = 'cd .'           # Minimal archive command

# Performance tuning
max_wal_size = 1GB                 # Maximum WAL size before checkpoint
min_wal_size = 80MB                # Minimum WAL size to keep
checkpoint_completion_target = 0.7  # Checkpoint completion target
wal_buffers = 16MB                 # WAL buffer size
shared_preload_libraries = 'pg_stat_statements'  # Load statistics extension
```

#### **Authentication Configuration (`pg_hba.conf`)**

```properties
# Local connections
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust

# Docker network connections (trust for internal communication)
host    all             all             172.16.0.0/12           trust
host    all             all             10.0.0.0/8              trust
host    all             all             192.168.0.0/16          trust

# Replication connections from Docker networks
host    replication     replicator      172.16.0.0/12           trust
host    replication     replicator      10.0.0.0/8              trust
host    replication     replicator      192.168.0.0/16          trust

# External connections (fallback with password authentication)
host    all             all             0.0.0.0/0               md5
host    replication     replicator      0.0.0.0/0               md5
```

### 2. Read Replica Configuration

#### **Replica Service Definition**

```yaml
db-replica-1:
  image: postgres:16
  restart: always
  user: postgres                    # Run as postgres user (security)
  env_file:
    - ./docker/replica.env         # All environment variables in file
  volumes:
    - pgdata_replica1:/var/lib/postgresql/data
    - ./docker/postgresql-replica.conf:/etc/postgresql/postgresql.conf
    - ./docker/start-replica.sh:/usr/local/bin/start-replica.sh
  ports:
    - '5433:5432'
  depends_on:
    db:
      condition: service_healthy   # Wait for primary to be healthy
  command: ["/bin/bash", "/usr/local/bin/start-replica.sh"]
  healthcheck:
    test: [ "CMD-SHELL", "PGPASSWORD=${POSTGRES_PASSWORD} pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}" ]
```

#### **Replica Configuration (`postgresql-replica.conf`)**

```properties
# Core standby settings
listen_addresses = '*'                    # Accept connections
hot_standby = on                         # Enable read-only queries
max_standby_streaming_delay = 30s        # Max delay before canceling queries
wal_receiver_status_interval = 10s       # Status update frequency
hot_standby_feedback = on                # Send feedback to primary
```

#### **Replica Initialization Process**

The replica initialization follows these steps:

1. **Wait for Primary**: Check primary database availability
2. **Base Backup**: Create initial data copy using `pg_basebackup`
3. **Replication Setup**: Configure standby mode and connection
4. **Start Streaming**: Begin WAL streaming from primary

```bash
# Wait for primary
until PGPASSWORD=admin123 pg_isready -h db -p 5432 -U admin -d ecommerce; do
  echo 'Still waiting for primary...'
  sleep 3
done

# Initialize replica if not already done
if [ ! -f /var/lib/postgresql/data/PG_VERSION ]; then
  # Create base backup
  PGPASSWORD=replicator123 pg_basebackup \
    -h db \
    -D /var/lib/postgresql/data \
    -U replicator \
    -v -P -X stream

  # Configure standby mode (PostgreSQL 12+ method)
  touch /var/lib/postgresql/data/standby.signal
  
  # Set replication parameters
  echo "primary_conninfo = 'host=db port=5432 user=replicator password=replicator123'" >> /var/lib/postgresql/data/postgresql.auto.conf
  echo "hot_standby = on" >> /var/lib/postgresql/data/postgresql.auto.conf
fi
```

## Technical Deep Dive

### 1. Write-Ahead Log (WAL) Streaming

**How WAL Streaming Works:**

- Primary database writes all changes to WAL files before applying them
- WAL sender processes on primary stream WAL data to replicas
- WAL receiver processes on replicas receive and apply changes
- This ensures replicas stay synchronized with primary

**Key Parameters:**

- `wal_level = replica`: Generates sufficient WAL information for replication
- `max_wal_senders = 3`: Allows 3 concurrent connections from replicas
- `max_replication_slots = 3`: Provides replication slot management

### 2. PostgreSQL 12+ Replication Method

**Modern Approach (Used):**

- `standby.signal` file: Indicates standby mode
- `postgresql.auto.conf`: Contains replication settings
- `primary_conninfo`: Connection string to primary

**Legacy Approach (Deprecated):**

- `recovery.conf` file: Used in PostgreSQL < 12
- No longer supported in PostgreSQL 16

### 3. Base Backup Process (`pg_basebackup`)

**Command Breakdown:**

```bash
pg_basebackup -h db -D /var/lib/postgresql/data -U replicator -v -P -X stream
```

- `-h db`: Connect to primary host
- `-D /var/lib/postgresql/data`: Output directory
- `-U replicator`: Use replication user
- `-v`: Verbose output
- `-P`: Show progress
- `-X stream`: Stream WAL during backup (modern method)

**Process Flow:**

1. Connect to primary using replication user
2. Create temporary replication slot
3. Start background WAL receiver
4. Copy all database files
5. Stream WAL changes during copy
6. Sync data to disk
7. Complete backup and cleanup

### 4. Authentication and Security

**Replication User Setup:**

```sql
-- Created automatically by init-primary.sh
CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD 'replicator123';
GRANT CONNECT ON DATABASE ecommerce TO replicator;
```

**Security Layers:**

1. **Network Isolation**: Docker network provides isolation
2. **User Privileges**: Replicator user has minimal privileges
3. **Password Authentication**: Encrypted passwords for external access
4. **Trust Authentication**: Within Docker network for performance

### 5. Health Checks and Monitoring

**Health Check Configuration:**

```yaml
healthcheck:
  test: [ "CMD-SHELL", "PGPASSWORD=admin123 pg_isready -U admin -d ecommerce" ]
  interval: 15s
  timeout: 10s
  retries: 5
  start_period: 30s
```

**Monitoring Replication Status:**

```sql
-- On primary: Check replication status
SELECT client_addr, state, sync_state FROM pg_stat_replication;

-- On replica: Check replication lag
SELECT EXTRACT(EPOCH FROM (now() - pg_last_xact_replay_timestamp())) AS lag_seconds;
```

## Performance Considerations

### 1. Asynchronous Replication

- `synchronous_commit = off`: Improved write performance
- Trade-off: Potential data loss in primary failure scenarios
- Suitable for read-heavy workloads

### 2. Connection Pooling

- Consider implementing connection pooling (PgBouncer)
- Distribute read queries across replicas
- Keep write operations on primary

### 3. Load Balancing Strategy

```
Application Layer:
┌─────────────────┐
│   Write Ops     │ ────▶ Primary (localhost:5432)
├─────────────────┤
│   Read Ops      │ ────▶ Replica-1 (localhost:5433)
│   (Load Balanced)│ ────▶ Replica-2 (localhost:5434)
└─────────────────┘
```

## Operational Procedures

### 1. Starting the Cluster

```bash
# Clean start
docker-compose down -v
docker-compose up -d

# Monitor startup
docker-compose logs -f db
docker-compose logs -f db-replica-1
docker-compose logs -f db-replica-2
```

### 2. Verifying Replication

```bash
# Check replication status on primary
docker-compose exec db psql -U admin -d ecommerce -c "SELECT * FROM pg_stat_replication;"

# Test read operations on replica
docker-compose exec db-replica-1 psql -U admin -d ecommerce -c "SELECT count(*) FROM your_table;"
```

### 3. Promoting a Replica (Failover)

```bash
# In case of primary failure, promote replica-1
docker-compose exec db-replica-1 pg_ctl promote -D /var/lib/postgresql/data
```

## Troubleshooting Guide

### Common Issues and Solutions

**1. "Password authentication failed"**

- Check `pg_hba.conf` configuration
- Verify Docker network ranges
- Ensure password environment variables are correct

**2. "recovery.conf not supported"**

- Use `standby.signal` file instead
- Configure replication in `postgresql.auto.conf`
- Modern PostgreSQL 12+ method

**3. "Invalid option -x"**

- Use `-X stream` instead of `-x`
- PostgreSQL 16 syntax change

**4. Replication lag issues**

- Check network connectivity
- Monitor WAL sender/receiver processes
- Consider synchronous replication for critical applications

## File Structure

```
docker/
├── postgres.env                 # Environment variables
├── postgresql-primary.conf      # Primary database configuration
├── postgresql-replica.conf      # Replica database configuration
├── pg_hba.conf                 # Authentication configuration
├── init-primary.sh             # Primary initialization script
└── init-replica.sh             # Replica initialization script

volumes/
├── pgdata/                     # Primary data volume
├── pgdata_replica1/            # Replica-1 data volume
└── pgdata_replica2/            # Replica-2 data volume
```

## Conclusion

This implementation provides a robust, scalable PostgreSQL replication solution using Docker Compose. The architecture supports:

- **High Availability**: Multiple read replicas for fault tolerance
- **Scalability**: Distributed read operations across replicas
- **Performance**: Asynchronous replication for optimal write performance
- **Monitoring**: Built-in health checks and logging
- **Security**: Multi-layered authentication and network isolation

The system is production-ready and can be extended with additional replicas, monitoring tools, and automated failover mechanisms as needed.
