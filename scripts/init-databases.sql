-- Create databases for different services
CREATE DATABASE auth_db;
CREATE DATABASE school_db;
CREATE DATABASE profile_db;
CREATE DATABASE attendance_db;
CREATE DATABASE payment_db;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE school_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE profile_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE attendance_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE payment_db TO postgres;
