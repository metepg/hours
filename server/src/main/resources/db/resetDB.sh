#!/bin/bash

DB_NAME="hours"
PGPASSWORD="postgres" # Replace with your actual PostgreSQL password
PGPASSWORD="postgres" # Replace with your actual PostgreSQL password

export PGPASSWORD

# Terminate connections and create database again
psql -U postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '${DB_NAME}';" postgres
psql -U postgres -c "DROP DATABASE IF EXISTS ${DB_NAME};" postgres
psql -U postgres -c "CREATE DATABASE ${DB_NAME};" postgres
