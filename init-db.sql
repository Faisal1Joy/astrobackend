-- Drop database if exists (be careful with this in production!)
DROP DATABASE IF EXISTS bazar_db;

-- Create database
CREATE DATABASE bazar_db;

-- Connect to the database
\c bazar_db

-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 