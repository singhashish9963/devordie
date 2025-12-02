-- Battle Simulator Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Units table
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('warrior', 'archer', 'mage')),
    health INTEGER NOT NULL DEFAULT 100,
    attack INTEGER NOT NULL DEFAULT 10,
    defense INTEGER NOT NULL DEFAULT 5,
    speed INTEGER NOT NULL DEFAULT 5,
    logic_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simulations table
CREATE TABLE IF NOT EXISTS simulations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    grid_width INTEGER NOT NULL DEFAULT 20,
    grid_height INTEGER NOT NULL DEFAULT 20,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    result_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Simulation units junction table
CREATE TABLE IF NOT EXISTS simulation_units (
    id SERIAL PRIMARY KEY,
    simulation_id INTEGER REFERENCES simulations(id) ON DELETE CASCADE,
    unit_id INTEGER REFERENCES units(id) ON DELETE CASCADE,
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    team INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_units_user_id ON units(user_id);
CREATE INDEX idx_simulations_user_id ON simulations(user_id);
CREATE INDEX idx_simulations_status ON simulations(status);
CREATE INDEX idx_simulation_units_simulation_id ON simulation_units(simulation_id);
CREATE INDEX idx_simulation_units_unit_id ON simulation_units(unit_id);
