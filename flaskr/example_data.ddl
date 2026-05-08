-- ROLE
INSERT INTO role (role_id, name) VALUES
(1, 'admin'),
(2, 'competitor');

-- USERS
INSERT INTO users (user_id, first_name, last_name, email, password, role_id) VALUES
(1, 'Jan', 'Kowalski', 'jan@example.com', 'hash1', 2),
(2, 'Anna', 'Nowak', 'anna@example.com', 'hash2', 2),
(3, 'Admin', 'System', 'admin@example.com', 'adminhash', 1);

-- COMPETITOR
INSERT INTO competitor (competitor_id, user_id, license_number, age_category, contact_number) VALUES
(1, 1, 12345, 1, '+48111111111'),
(2, 2, 67890, 1, '+48222222222');

-- GOKART
INSERT INTO gokart (gokart_id, name, status) VALUES
(1, 'Kart #1', 1),
(2, 'Kart #2', 1);

-- TRACK
INSERT INTO track (track_id, name, location) VALUES
(1, 'Track Katowice', 'Katowice'),
(2, 'Track Krakow', 'Krakow');

-- KARTING_EVENT
INSERT INTO karting_event (event_id, name, date, type, track_id) VALUES
(1, 'Weekend Race', '2026-04-20', 1, 1);

-- RACE
INSERT INTO race (race_id, weather_conditions, event_id) VALUES
(1, 1, 1);

-- PARTICIPATION
INSERT INTO participation (participation_id, starting_position, finishing_position, competitor_id, gokart_id, race_id) VALUES
(1, 1, 2, 1, 1, 1),
(2, 2, 1, 2, 2, 1);

-- LAP
INSERT INTO lap (lap_id, lap_number, lap_time, participation_id) VALUES
(1, 1, 75.321, 1),
(2, 2, 74.210, 1),
(3, 1, 73.999, 2),
(4, 2, 72.888, 2);

-- SCHEDULE
INSERT INTO schedule (schedule_id, status, event_id, competitor_id, gokart_id) VALUES
(1, 1, 1, 1, 1),
(2, 1, 1, 2, 2);

-- COMPONENT
INSERT INTO component (component_id, type, engine_hours, mileage, installation_date, status, gokart_id) VALUES
(1, 1, 100, 500, '2026-04-20 10:00:00', 1, 1);

-- SERVICE
INSERT INTO service (service_id, service_date, description, type, component_id, user_id) VALUES
(1, '2026-04-10', 'Oil change', 1, 1, 3);

-- FAULT
INSERT INTO fault (fault_id, description, detection_date, status, component_id) VALUES
(1, 'Worn brakes', '2026-04-15', 1, 1);

-- REPLACEMENT
INSERT INTO replacement (replacement_id, replacement_date, description, component_id, user_id) VALUES
(1, '2026-04-16', 'New brake pads', 1, 3);

-- NOTIFICATION
INSERT INTO notification (notification_id, content, created_date, status, user_id) VALUES
(1, 'New service completed', '2026-04-16', 'N', 1);