/*
  # Enable Required Extensions

  This migration enables all necessary PostgreSQL extensions for the Mutuus platform:
  
  1. Core Extensions
    - `uuid-ossp` for UUID generation
    - `pgcrypto` for encryption and hashing
    - `pg_stat_statements` for query performance monitoring
    
  2. Geographic Extensions  
    - `postgis` for location-based features
    - `postgis_topology` for advanced geographic queries
    
  3. Utility Extensions
    - `unaccent` for text search without accents
    - `pg_trgm` for fuzzy text matching
*/

-- Enable core extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Enable PostGIS for location features
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "postgis_topology";

-- Enable text search extensions
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable HTTP extension for webhooks
CREATE EXTENSION IF NOT EXISTS "http";