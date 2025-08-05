#!/bin/bash
# PostgreSQL healthcheck script that uses environment variables
# This avoids exposing passwords in docker-compose.yml

pg_isready -h localhost -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
