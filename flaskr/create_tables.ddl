CREATE TABLE gokart (
    gokart_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    status INT
);

CREATE TABLE track (
    track_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    location VARCHAR(255)
);

CREATE TABLE role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255)
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
);

CREATE TABLE competitor (
    competitor_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    license_number INT,
    age_category INT,
    contact_number VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE karting_event (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    date DATETIME,
    type INT,
    track_id INT,
    FOREIGN KEY (track_id) REFERENCES track(track_id)
);

CREATE TABLE race (
    race_id INT PRIMARY KEY AUTO_INCREMENT,
    weather_conditions INT,
    event_id INT,
    FOREIGN KEY (event_id) REFERENCES karting_event(event_id)
);

CREATE TABLE participation (
    participation_id INT PRIMARY KEY AUTO_INCREMENT,
    starting_position INT,
    finishing_position INT,
    competitor_id INT,
    gokart_id INT,
    race_id INT,
    FOREIGN KEY (competitor_id) REFERENCES competitor(competitor_id),
    FOREIGN KEY (gokart_id) REFERENCES gokart(gokart_id),
    FOREIGN KEY (race_id) REFERENCES race(race_id)
);

CREATE TABLE lap (
    lap_id INT PRIMARY KEY AUTO_INCREMENT,
    lap_number INT,
    lap_time FLOAT,
    participation_id INT,
    FOREIGN KEY (participation_id) REFERENCES participation(participation_id)
);

CREATE TABLE schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    status INT,
    event_id INT,
    competitor_id INT,
    gokart_id INT,
    FOREIGN KEY (event_id) REFERENCES karting_event(event_id),
    FOREIGN KEY (competitor_id) REFERENCES competitor(competitor_id),
    FOREIGN KEY (gokart_id) REFERENCES gokart(gokart_id)
);

CREATE TABLE component (
    component_id INT PRIMARY KEY AUTO_INCREMENT,
    type INT,
    engine_hours INT,
    mileage INT,
    installation_date DATE,
    status INT,
    gokart_id INT,
    FOREIGN KEY (gokart_id) REFERENCES gokart(gokart_id)
);

CREATE TABLE service (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_date DATE,
    description TEXT,
    type INT,
    component_id INT,
    user_id INT,
    FOREIGN KEY (component_id) REFERENCES component(component_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE fault (
    fault_id INT PRIMARY KEY AUTO_INCREMENT,
    description TEXT,
    detection_date DATE,
    status INT,
    component_id INT,
    FOREIGN KEY (component_id) REFERENCES component(component_id)
);

CREATE TABLE replacement (
    replacement_id INT PRIMARY KEY AUTO_INCREMENT,
    replacement_date DATE,
    description TEXT,
    component_id INT,
    user_id INT,
    FOREIGN KEY (component_id) REFERENCES component(component_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE notification (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT,
    created_date DATE,
    status VARCHAR(50),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);