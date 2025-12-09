-- Create the database
CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Create Department table (temporarily without managerId FK; now managerId is VARCHAR(50) to match Employee.id)
CREATE TABLE Department (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    location VARCHAR(100),
    managerId VARCHAR(50),  -- Changed to VARCHAR(50) for compatibility
    workStartTime TIME NOT NULL,
    workEndTime TIME NOT NULL,
    gracePeriodMinutes INT DEFAULT 15
) ENGINE=InnoDB;

-- Create Employee table (references Department)
CREATE TABLE Employee (
    id VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    address VARCHAR(255),
    departmentId INT NOT NULL,
    hireDate DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    isActive TINYINT(1) DEFAULT 1,
    FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Now add the foreign key for managerId (types now match)
ALTER TABLE Department
ADD FOREIGN KEY (managerId) REFERENCES Employee(id) ON DELETE SET NULL;

-- Create Attendance table (employeeId is VARCHAR(50) to match Employee.id)
CREATE TABLE Attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeId VARCHAR(50) NOT NULL,
    timestamp DATETIME NOT NULL,
    type ENUM('in', 'out') NOT NULL,
    status ENUM('on-time', 'late', 'early-leave', 'absent'),
    FOREIGN KEY (employeeId) REFERENCES Employee(id) ON DELETE CASCADE,
    INDEX idx_employee_timestamp (employeeId, timestamp)
) ENGINE=InnoDB;

-- Create Admin table
CREATE TABLE Admin (
    email VARCHAR(100) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    passwordHash VARCHAR(255) NOT NULL,
    imagePath VARCHAR(255)
) ENGINE=InnoDB;




show tables;