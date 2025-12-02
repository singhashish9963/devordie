-- Seed data for Battle Simulator

-- Insert sample users
INSERT INTO users (username, email, password_hash) VALUES
    ('player1', 'player1@example.com', '$2a$10$dummyhash1'),
    ('player2', 'player2@example.com', '$2a$10$dummyhash2');

-- Insert sample units for player1
INSERT INTO units (user_id, name, type, health, attack, defense, speed, logic_data) VALUES
    (1, 'Knight Commander', 'warrior', 150, 20, 15, 5, '{"behavior": "aggressive"}'),
    (1, 'Elite Archer', 'archer', 100, 25, 8, 7, '{"behavior": "ranged"}'),
    (1, 'Fire Mage', 'mage', 80, 30, 5, 6, '{"behavior": "caster"}');

-- Insert sample units for player2
INSERT INTO units (user_id, name, type, health, attack, defense, speed, logic_data) VALUES
    (2, 'Berserker', 'warrior', 140, 22, 12, 6, '{"behavior": "aggressive"}'),
    (2, 'Sniper', 'archer', 90, 28, 7, 8, '{"behavior": "ranged"}'),
    (2, 'Ice Mage', 'mage', 85, 28, 6, 6, '{"behavior": "caster"}');

-- Insert sample simulation
INSERT INTO simulations (user_id, name, grid_width, grid_height, status) VALUES
    (1, 'Test Battle', 20, 20, 'pending');

-- Add units to simulation
INSERT INTO simulation_units (simulation_id, unit_id, position_x, position_y, team) VALUES
    (1, 1, 2, 10, 1),
    (1, 2, 3, 8, 1),
    (1, 3, 3, 12, 1),
    (1, 4, 17, 10, 2),
    (1, 5, 16, 8, 2),
    (1, 6, 16, 12, 2);
