CREATE TABLE vaccines (
    date DATE NOT NULL,
    prefecture INTEGER NOT NULL,
    gender VARCHAR NOT NULL,
    age VARCHAR NOT NULL,
    medical_worker BOOLEAN NOT NULL,
    status INTEGER NOT NULL,
    count INTEGER NOT NULL
);

CREATE TABLE prefectures (
    id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    population INTEGER NOT NULL
);