CREATE TABLE gokart (
    gokart_id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(255),
    status INT
);

CREATE TABLE tor (
    tor_id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(255),
    lokalizacja VARCHAR(255)
);

CREATE TABLE role (
    rola_id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(255)
);

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    imie VARCHAR(255),
    nazwisko VARCHAR(255),
    email VARCHAR(255),
    haslo VARCHAR(255),
    rola_id INT,
    FOREIGN KEY (rola_id) REFERENCES role(rola_id)
);

CREATE TABLE zawodnik (
    zawodnik_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    numer_licencji INT,
    kategoria_wiekowa INT,
    numer_kontaktowy VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE wydarzenie (
    wydarzenie_id INT PRIMARY KEY AUTO_INCREMENT,
    nazwa VARCHAR(255),
    data DATE,
    typ INT,
    tor_id INT,
    FOREIGN KEY (tor_id) REFERENCES tor(tor_id)
);

CREATE TABLE wyscig (
    wyscig_id INT PRIMARY KEY AUTO_INCREMENT,
    warunki_pogodowe INT,
    wydarzenie_id INT,
    FOREIGN KEY (wydarzenie_id) REFERENCES wydarzenie(wydarzenie_id)
);

CREATE TABLE udzial (
    udzial_id INT PRIMARY KEY AUTO_INCREMENT,
    pozycja_startowa INT,
    pozycja_koncowa INT,
    zawodnik_id INT,
    gokart_id INT,
    wyscig_id INT,
    FOREIGN KEY (zawodnik_id) REFERENCES zawodnik(zawodnik_id),
    FOREIGN KEY (gokart_id) REFERENCES gokart(gokart_id),
    FOREIGN KEY (wyscig_id) REFERENCES wyscig(wyscig_id)
);

CREATE TABLE okrazenie (
    okrazenie_id INT PRIMARY KEY AUTO_INCREMENT,
    numer_okrazenia INT,
    czas_okrazenia FLOAT,
    udzial_id INT,
    FOREIGN KEY (udzial_id) REFERENCES udzial(udzial_id)
);

CREATE TABLE plan (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    status INT,
    wydarzenie_id INT,
    zawodnik_id INT,
    gokart_id INT,
    FOREIGN KEY (wydarzenie_id) REFERENCES wydarzenie(wydarzenie_id),
    FOREIGN KEY (zawodnik_id) REFERENCES zawodnik(zawodnik_id),
    FOREIGN KEY (gokart_id) REFERENCES gokart(gokart_id)
);

CREATE TABLE podzespol (
    podzespol_id INT PRIMARY KEY AUTO_INCREMENT,
    typ INT,
    motogodziny INT,
    przebieg INT,
    data_montazu DATE,
    status INT,
    gokart_id INT,
    FOREIGN KEY (gokart_id) REFERENCES gokart(gokart_id)
);

CREATE TABLE serwis (
    serwis_id INT PRIMARY KEY AUTO_INCREMENT,
    data_serwisu DATE,
    opis TEXT,
    typ INT,
    podzespol_id INT,
    user_id INT,
    FOREIGN KEY (podzespol_id) REFERENCES podzespol(podzespol_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE usterka (
    usterka_id INT PRIMARY KEY AUTO_INCREMENT,
    opis TEXT,
    data_wykrycia DATE,
    status INT,
    podzespol_id INT,
    FOREIGN KEY (podzespol_id) REFERENCES podzespol(podzespol_id)
);

CREATE TABLE wymiana (
    wymiana_id INT PRIMARY KEY AUTO_INCREMENT,
    data_wymiany DATE,
    opis TEXT,
    podzespol_id INT,
    user_id INT,
    FOREIGN KEY (podzespol_id) REFERENCES podzespol(podzespol_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE powiadomienie (
    powiadomienie_id INT PRIMARY KEY AUTO_INCREMENT,
    tresc TEXT,
    data_utworzenia DATE,
    status VARCHAR(50),
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);