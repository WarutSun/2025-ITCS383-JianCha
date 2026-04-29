CREATE DATABASE IF NOT EXISTS jiancha_car_rental;
USE jiancha_car_rental;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('member', 'staff') DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  type ENUM('sedan', 'suv', 'van') NOT NULL,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  price_per_day DECIMAL(10,2) NOT NULL,
  location VARCHAR(100) NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add promotion columns if not exists
ALTER TABLE cars ADD COLUMN discount_percent INT DEFAULT 0;
ALTER TABLE cars ADD COLUMN is_promotion TINYINT(1) DEFAULT 0;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  car_id INT NOT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  pickup_location VARCHAR(100),
  dropoff_location VARCHAR(100),
  dropoff_fee DECIMAL(10,2) DEFAULT 0.00,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (car_id) REFERENCES cars(id)
);

-- Add dropoff columns if not exists (MySQL ignores errors or we can just try)
ALTER TABLE bookings ADD COLUMN pickup_location VARCHAR(100);
ALTER TABLE bookings ADD COLUMN dropoff_location VARCHAR(100);
ALTER TABLE bookings ADD COLUMN dropoff_fee DECIMAL(10,2) DEFAULT 0.00;

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  car_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (car_id) REFERENCES cars(id)
);

INSERT IGNORE INTO cars (brand, model, type, license_plate, price_per_day, location) VALUES
('Toyota', 'Camry', 'sedan', 'ABC-1234', 1500.00, 'Bangkok'),
('Honda', 'Accord', 'sedan', 'ABC-1112', 1600.00, 'Bangkok'),
('Nissan', 'Altima', 'sedan', 'ABC-1113', 1400.00, 'Bangkok'),
('Mazda', 'Mazda6', 'sedan', 'ABC-1114', 1550.00, 'Bangkok'),
('BMW', '320i', 'sedan', 'ABC-1115', 2500.00, 'Bangkok'),
('Hyundai', 'Elantra', 'sedan', 'ABC-1116', 1300.00, 'Bangkok'),
('Kia', 'K5', 'sedan', 'ABC-1117', 1350.00, 'Bangkok'),
('Toyota', 'Corolla', 'sedan', 'ABC-1118', 1200.00, 'Bangkok'),
('Honda', 'City', 'sedan', 'ABC-1119', 1100.00, 'Bangkok'),
('Mitsubishi', 'Lancer', 'sedan', 'ABC-1120', 1250.00, 'Bangkok'),
('Honda', 'CR-V', 'suv', 'XYZ-5678', 2000.00, 'Bangkok'),
('Toyota', 'RAV4', 'suv', 'XYZ-2112', 2100.00, 'Bangkok'),
('Nissan', 'Rogue', 'suv', 'XYZ-2113', 1900.00, 'Bangkok'),
('Mazda', 'CX-5', 'suv', 'XYZ-2114', 2050.00, 'Bangkok'),
('BMW', 'X5', 'suv', 'XYZ-2115', 3500.00, 'Bangkok'),
('Hyundai', 'Santa Fe', 'suv', 'XYZ-2116', 1850.00, 'Bangkok'),
('Kia', 'Sorento', 'suv', 'XYZ-2117', 1950.00, 'Bangkok'),
('Toyota', 'Fortuner', 'suv', 'XYZ-2118', 2200.00, 'Bangkok'),
('Isuzu', 'MU-X', 'suv', 'XYZ-2119', 2150.00, 'Bangkok'),
('Ford', 'Explorer', 'suv', 'XYZ-2120', 2300.00, 'Bangkok'),
('Toyota', 'Alphard', 'van', 'DEF-9012', 3500.00, 'Bangkok'),
('Honda', 'Odyssey', 'van', 'DEF-3112', 3200.00, 'Bangkok'),
('Nissan', 'Elgrand', 'van', 'DEF-3113', 3400.00, 'Bangkok'),
('Kia', 'Carnival', 'van', 'DEF-3114', 2900.00, 'Bangkok'),
('Toyota', 'Hiace', 'van', 'DEF-3115', 2500.00, 'Bangkok'),
('Mercedes-Benz', 'V-Class', 'van', 'DEF-3116', 4500.00, 'Bangkok'),
('Volkswagen', 'Caravelle', 'van', 'DEF-3117', 3800.00, 'Bangkok'),
('Hyundai', 'H350', 'van', 'DEF-3118', 2800.00, 'Bangkok'),
('Mitsubishi', 'Delica', 'van', 'DEF-3119', 3100.00, 'Bangkok'),
('Toyota', 'Sienna', 'van', 'DEF-3120', 3300.00, 'Bangkok'),
('Toyota', 'Camry', 'sedan', 'CMI-1001', 1500.00, 'Chiang Mai'),
('Honda', 'CR-V', 'suv', 'CMI-2001', 2000.00, 'Chiang Mai'),
('Toyota', 'Hiace', 'van', 'CMI-3001', 2500.00, 'Chiang Mai'),
('Nissan', 'Altima', 'sedan', 'CMI-1002', 1400.00, 'Chiang Mai'),
('Mazda', 'CX-5', 'suv', 'CMI-2002', 2050.00, 'Chiang Mai'),
('Toyota', 'Corolla', 'sedan', 'PHU-1001', 1200.00, 'Phuket'),
('Honda', 'Accord', 'sedan', 'PHU-1002', 1600.00, 'Phuket'),
('Toyota', 'RAV4', 'suv', 'PHU-2001', 2100.00, 'Phuket'),
('Nissan', 'Rogue', 'suv', 'PHU-2002', 1900.00, 'Phuket'),
('Kia', 'Carnival', 'van', 'PHU-3001', 2900.00, 'Phuket');
