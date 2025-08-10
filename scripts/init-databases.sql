-- Create databases for different services
CREATE DATABASE auth_db;
CREATE DATABASE school_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE school_db TO postgres;
