/*
  # Enable Required PostgreSQL Extensions

  1. Extensions
    - `uuid-ossp` - UUID generation functions
    - `pgcrypto` - Cryptographic functions
    - `postgis` - Geographic objects support (for location features)
  
  2. Security
    - Enable extensions with proper error handling
    - Check if extensions already exist before creating
*/

-- Enable UUID generation functions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable PostGIS for geographic objects (location-based features)
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Verify extensions are installed
DO $$
BEGIN
  -- Check uuid-ossp
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
  ) THEN
    RAISE EXCEPTION 'uuid-ossp extension failed to install';
  END IF;

  -- Check pgcrypto
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
  ) THEN
    RAISE EXCEPTION 'pgcrypto extension failed to install';
  END IF;

  -- Check postgis
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'postgis'
  ) THEN
    RAISE EXCEPTION 'postgis extension failed to install';
  END IF;

  RAISE NOTICE 'All required extensions installed successfully';
END $$;