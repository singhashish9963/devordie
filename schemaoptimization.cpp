
-- Users table with UUID for better distributed system support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Units table - OPTIMIZED
-- Moved unit stats from undefined structure to explicit columns for better query performance
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('warrior', 'archer', 'mage')),
    
    -- Unit stats as explicit columns (faster than JSONB extraction)
    health INTEGER NOT NULL DEFAULT 100 CHECK (health > 0),
    attack INTEGER NOT NULL DEFAULT 10 CHECK (attack > 0),
    defense INTEGER NOT NULL DEFAULT 5 CHECK (defense > 0),
    speed INTEGER NOT NULL DEFAULT 5 CHECK (speed > 0),
    
    -- JSONB for flexible, less-frequently-queried data
    logic_data JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Simulations table - OPTIMIZED
CREATE TABLE IF NOT EXISTS simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    grid_width INTEGER NOT NULL DEFAULT 20 CHECK (grid_width > 0),
    grid_height INTEGER NOT NULL DEFAULT 20 CHECK (grid_height > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Simulation units junction table - OPTIMIZED
-- Position and team are frequently queried, so kept as explicit columns
CREATE TABLE IF NOT EXISTS simulation_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    simulation_id UUID NOT NULL REFERENCES simulations(id) ON DELETE CASCADE,
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    position_x INTEGER NOT NULL CHECK (position_x >= 0),
    position_y INTEGER NOT NULL CHECK (position_y >= 0),
    team INTEGER NOT NULL DEFAULT 1 CHECK (team > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Ensure no duplicate unit positions in same simulation
    UNIQUE(simulation_id, position_x, position_y)
);

-- ============================================================================
-- INDEXES - OPTIMIZED STRATEGY
-- ============================================================================

-- USERS INDEXES
-- Equality searches on username and email
CREATE INDEX CONCURRENTLY idx_users_username_active 
    ON users(username) 
    WHERE is_active = TRUE;

CREATE INDEX CONCURRENTLY idx_users_email_active 
    ON users(email) 
    WHERE is_active = TRUE;

-- UNITS INDEXES
-- User lookups + type filtering (common pattern)
CREATE INDEX CONCURRENTLY idx_units_user_id_type 
    ON units(user_id, type);

-- Type filtering alone
CREATE INDEX CONCURRENTLY idx_units_type 
    ON units(type) 
    WHERE health > 0;

-- User's units ordered by creation (timeline queries)
CREATE INDEX CONCURRENTLY idx_units_user_created 
    ON units(user_id, created_at DESC);

-- SIMULATIONS INDEXES
-- User's simulations with status filtering (hot query)
CREATE INDEX CONCURRENTLY idx_simulations_user_status 
    ON simulations(user_id, status);

-- Status-based queries (pending/running simulations)
CREATE INDEX CONCURRENTLY idx_simulations_pending 
    ON simulations(id, created_at DESC) 
    WHERE status IN ('pending', 'running');

-- User's completed simulations (timeline queries)
CREATE INDEX CONCURRENTLY idx_simulations_user_created 
    ON simulations(user_id, created_at DESC);

-- SIMULATION_UNITS INDEXES
-- Critical for battle resolution queries
CREATE INDEX CONCURRENTLY idx_simulation_units_sim_team 
    ON simulation_units(simulation_id, team);

-- Position lookups (collision detection, unit targeting)
CREATE INDEX CONCURRENTLY idx_simulation_units_position 
    ON simulation_units(simulation_id, position_x, position_y);

-- Unit lookups within simulation
CREATE INDEX CONCURRENTLY idx_simulation_units_unit_sim 
    ON simulation_units(unit_id, simulation_id);

-- Team-based queries
CREATE INDEX CONCURRENTLY idx_simulation_units_team 
    ON simulation_units(team) 
    WHERE simulation_id IS NOT NULL;
