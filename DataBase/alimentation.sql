-- I-- Disable foreign key checks for clean insertion/recreation if tables exist
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_SAFE_UPDATES = 0;
-- --- Insert sample Departments
INSERT INTO Department (name, description, location, workStartTime, workEndTime, gracePeriodMinutes)
VALUES 
    ('Design', 'UI/UX Design Team', 'Building A', '09:00:00', '17:00:00', 15),
    ('Development', 'Software Development Team', 'Building B', '09:00:00', '17:00:00', 15),
    ('Data Science', 'Data Analysis and ML Team', 'Building C', '09:00:00', '17:00:00', 15),
    ('Sales', 'Sales and Marketing Team', 'Building D', '09:00:00', '17:00:00', 15);

--- Insert sample Employees (using the requested 'D32C4FE' style IDs)
INSERT INTO Employee (id, firstName, lastName, address, departmentId, hireDate, phone, email, isActive)
VALUES 
    ('A7B8C9D', 'Brett', 'Johnson', '123 Design St', 1, '2024-01-01', '555-1234', 'brett@company.com', 1),
    ('E0F1A2B', 'Brett', 'Johnson', '456 Dev Ave', 2, '2024-02-01', '555-5678', 'brett.dev@company.com', 1),
    ('C3D4E5F', 'Rhodes', 'Peter', '789 Project Ln', 2, '2024-03-01', '555-9012', 'rhodes@company.com', 1),
    ('6789012', 'Jeff', 'Jane', '101 HR Blvd', 4, '2024-04-01', '555-3456', 'jeff@company.com', 1),
    ('A3B4C5D', 'Emily', 'Butler', '202 Data Rd', 3, '2024-05-01', '555-7890', 'emily@company.com', 1),
    ('E6F7G8H', 'Andrik', 'Ico', '303 Project Way', 2, '2024-06-01', '555-1122', 'andrik@company.com', 1),
    ('I9J0K1L', 'Barry', 'Ray', '404 Sales Dr', 4, '2024-07-01', '555-3344', 'barry@company.com', 1);

--- Update managerId examples (e.g., Jeff Jane as manager for Sales, using the new ID)
UPDATE Department SET managerId = '6789012' WHERE id = 4;

--- Select active employees for verification
SELECT id, firstName, lastName, email, departmentId, isActive FROM Employee WHERE isActive = 1;

--- Insert sample Attendance (examples for Dec 06, 2025; status pre-computed for demo, using new IDs)
INSERT INTO Attendance	 (employeeId, timestamp, type, status)
VALUES 
    ('A7B8C9D', '2025-12-06 09:18:00', 'in', 'late'),
    ('E0F1A2B', '2025-12-06 09:15:00', 'in', 'late'),
    ('C3D4E5F', '2025-12-06 09:05:00', 'in', 'late'),
    ('6789012', '2025-12-06 09:00:00', 'in', 'on-time'),
    ('A3B4C5D', '2025-12-06 08:55:00', 'in', 'on-time'),
    ('A7B8C9D', '2025-12-06 17:00:00', 'out', 'on-time'),
    ('E6F7G8H', '2025-12-05 09:00:00', 'in', 'on-time'),  -- Previous day for backlog example
    ('I9J0K1L', '2025-12-04 09:00:00', 'in', 'on-time');  -- Older for stats
    
-- Re-enable foreign key checks if they were disabled
-- SET FOREIGN_KEY_CHECKS = 1;

-- Insert sample Admins (passwordHash is a placeholder; use hashed values in real use)
INSERT INTO Admin (email, firstName, lastName, phone, address, password, imagePath)
VALUES 
     ('superadmin@company.com', 'Super', 'Admin', '555-0002', 'HQ', 'adminpass', './profileImage/admin.jpeg');
 
 -- More data to alimente data base
 INSERT INTO Attendance (employeeId, timestamp, type, status)
VALUES 
    -- =============================================
    -- MONDAY, DEC 01, 2025 (Good Attendance Day)
    -- =============================================
    -- Design: Brett (On Time)
    ('A7B8C9D', '2025-12-01 08:55:00', 'in', 'on-time'),
    ('A7B8C9D', '2025-12-01 17:05:00', 'out', 'on-time'),

    -- Dev: Brett (Dev), Rhodes, Andrik
    ('E0F1A2B', '2025-12-01 09:00:00', 'in', 'on-time'),
    ('E0F1A2B', '2025-12-01 17:10:00', 'out', 'on-time'),
    ('C3D4E5F', '2025-12-01 09:10:00', 'in', 'on-time'), -- Cut it close (Grace period)
    ('C3D4E5F', '2025-12-01 17:00:00', 'out', 'on-time'),
    ('E6F7G8H', '2025-12-01 08:45:00', 'in', 'on-time'),
    ('E6F7G8H', '2025-12-01 17:30:00', 'out', 'on-time'),

    -- Data: Emily
    ('A3B4C5D', '2025-12-01 08:50:00', 'in', 'on-time'),
    ('A3B4C5D', '2025-12-01 17:00:00', 'out', 'on-time'),

    -- Sales: Jeff, Barry
    ('6789012', '2025-12-01 09:05:00', 'in', 'on-time'),
    ('6789012', '2025-12-01 17:15:00', 'out', 'on-time'),
    ('I9J0K1L', '2025-12-01 09:00:00', 'in', 'on-time'),
    ('I9J0K1L', '2025-12-01 17:05:00', 'out', 'on-time'),


    -- =============================================
    -- TUESDAY, DEC 02, 2025 (Mixed Results)
    -- =============================================
    -- Design: Brett (Late)
    ('A7B8C9D', '2025-12-02 09:45:00', 'in', 'late'),
    ('A7B8C9D', '2025-12-02 18:00:00', 'out', 'on-time'),

    -- Dev: Rhodes is Late, Andrik is Early
    ('C3D4E5F', '2025-12-02 10:00:00', 'in', 'late'),
    ('C3D4E5F', '2025-12-02 17:00:00', 'out', 'on-time'),
    ('E6F7G8H', '2025-12-02 08:30:00', 'in', 'on-time'),
    ('E6F7G8H', '2025-12-02 16:30:00', 'out', 'early-leave'), -- Left early

    -- Data: Emily (On Time)
    ('A3B4C5D', '2025-12-02 09:00:00', 'in', 'on-time'),
    ('A3B4C5D', '2025-12-02 17:00:00', 'out', 'on-time'),

    -- Sales: Jeff (Absent - Insert explicit record if your system requires it, otherwise skip)
    ('I9J0K1L', '2025-12-02 09:10:00', 'in', 'on-time'),
    ('I9J0K1L', '2025-12-02 17:00:00', 'out', 'on-time'),


    -- =============================================
    -- WEDNESDAY, DEC 03, 2025 (Heavy Lates)
    -- =============================================
    ('A7B8C9D', '2025-12-03 09:00:00', 'in', 'on-time'),
    ('E0F1A2B', '2025-12-03 09:30:00', 'in', 'late'), -- Late
    ('C3D4E5F', '2025-12-03 09:20:00', 'in', 'late'), -- Late
    ('6789012', '2025-12-03 09:45:00', 'in', 'late'), -- Late
    ('A3B4C5D', '2025-12-03 08:55:00', 'in', 'on-time'),
    ('E6F7G8H', '2025-12-03 09:00:00', 'in', 'on-time'),
    ('I9J0K1L', '2025-12-03 09:05:00', 'in', 'on-time'),


    -- =============================================
    -- THURSDAY, DEC 04, 2025 (Supplementing your previous data)
    -- =============================================
    -- You already had I9J0K1L. Adding others.
    ('A7B8C9D', '2025-12-04 09:10:00', 'in', 'on-time'),
    ('E0F1A2B', '2025-12-04 09:00:00', 'in', 'on-time'),
    ('C3D4E5F', '2025-12-04 09:05:00', 'in', 'on-time'),
    ('6789012', '2025-12-04 08:55:00', 'in', 'on-time'),
    ('A3B4C5D', '2025-12-04 09:30:00', 'in', 'late'), -- Emily Late
    ('E6F7G8H', '2025-12-04 09:00:00', 'in', 'on-time'),


    -- =============================================
    -- FRIDAY, DEC 05, 2025 (Early Leaves / Weekend Mood)
    -- =============================================
    ('A7B8C9D', '2025-12-05 09:00:00', 'in', 'on-time'),
    ('A7B8C9D', '2025-12-05 15:00:00', 'out', 'early-leave'), -- Left Early

    ('E0F1A2B', '2025-12-05 09:10:00', 'in', 'on-time'),
    ('E0F1A2B', '2025-12-05 16:00:00', 'out', 'early-leave'), -- Left Early

    ('C3D4E5F', '2025-12-05 09:25:00', 'in', 'late'),
    ('6789012', '2025-12-05 09:00:00', 'in', 'on-time'),
    ('A3B4C5D', '2025-12-05 09:00:00', 'in', 'on-time'),
    ('I9J0K1L', '2025-12-05 09:15:00', 'in', 'on-time'),


    -- =============================================
    -- SATURDAY, DEC 06, 2025 (Today - Closing the loop on your previous inserts)
    -- =============================================
    -- You had Logins for these people, let's add some logouts for them to complete the cycle.
    -- Assuming they are leaving now or later.
    ('6789012', '2025-12-06 14:00:00', 'out', 'early-leave'),
    ('A3B4C5D', '2025-12-06 17:00:00', 'out', 'on-time'),
    ('E0F1A2B', '2025-12-06 17:30:00', 'out', 'on-time'),
    ('C3D4E5F', '2025-12-06 16:45:00', 'out', 'early-leave');

