CREATE TABLE
    roles (
        role_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255)
    );

CREATE TABLE
    users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        first_name VARCHAR(255),
        last_name VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255),
        role_id INT,
        FOREIGN KEY (role_id) REFERENCES roles (role_id)
    );

CREATE TABLE
    competitors (
        competitor_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        license_number INT,
        age_category INT,
        contact_number VARCHAR(50),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

CREATE TABLE
    gokarts (
        gokart_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        status INT
    );

CREATE TABLE
    tracks (
        track_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        location VARCHAR(255)
    );

CREATE TABLE
    events (
        event_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        date DATE,
        type INT,
        track_id INT,
        FOREIGN KEY (track_id) REFERENCES tracks (track_id)
    );

CREATE TABLE
    races (
        race_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255),
        weather_conditions INT,
        event_id INT,
        FOREIGN KEY (event_id) REFERENCES events (event_id)
    );

CREATE TABLE
    participations (
        participation_id INT PRIMARY KEY AUTO_INCREMENT,
        starting_position INT,
        finishing_position INT,
        competitor_id INT,
        gokart_id INT,
        race_id INT,
        FOREIGN KEY (competitor_id) REFERENCES competitors (competitor_id),
        FOREIGN KEY (gokart_id) REFERENCES gokarts (gokart_id),
        FOREIGN KEY (race_id) REFERENCES races (race_id)
    );

CREATE TABLE
    laps (
        lap_id INT PRIMARY KEY AUTO_INCREMENT,
        lap_number INT,
        lap_time FLOAT,
        participation_id INT,
        FOREIGN KEY (participation_id) REFERENCES participations (participation_id)
    );

CREATE TABLE
    schedules (
        schedule_id INT PRIMARY KEY AUTO_INCREMENT,
        status INT,
        event_id INT,
        competitor_id INT,
        gokart_id INT,
        FOREIGN KEY (event_id) REFERENCES events (event_id),
        FOREIGN KEY (competitor_id) REFERENCES competitors (competitor_id),
        FOREIGN KEY (gokart_id) REFERENCES gokarts (gokart_id)
    );

CREATE TABLE
    components (
        component_id INT PRIMARY KEY AUTO_INCREMENT,
        type INT,
        engine_hours INT,
        mileage INT,
        installation_date DATE,
        status INT,
        gokart_id INT,
        FOREIGN KEY (gokart_id) REFERENCES gokarts (gokart_id) -- fixed typo: was `gokart`
    );

CREATE TABLE
    services (
        service_id INT PRIMARY KEY AUTO_INCREMENT,
        service_date DATE,
        description TEXT,
        type INT,
        component_id INT,
        user_id INT,
        FOREIGN KEY (component_id) REFERENCES components (component_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

CREATE TABLE
    faults (
        fault_id INT PRIMARY KEY AUTO_INCREMENT,
        description TEXT,
        detection_date DATE,
        status INT,
        component_id INT,
        FOREIGN KEY (component_id) REFERENCES components (component_id)
    );

CREATE TABLE
    replacements (
        replacement_id INT PRIMARY KEY AUTO_INCREMENT,
        replacement_date DATE,
        description TEXT,
        component_id INT,
        user_id INT,
        FOREIGN KEY (component_id) REFERENCES components (component_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );

CREATE TABLE
    notifications (
        notification_id INT PRIMARY KEY AUTO_INCREMENT,
        content TEXT,
        created_date DATE,
        status VARCHAR(50),
        user_id INT,
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );