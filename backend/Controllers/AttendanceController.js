import { db } from '../db.js';

// return the newly created record's data
export const createAttendanceRecord = async ({ employeeId, timestamp, type, status }) => {
  if (!employeeId || !timestamp || !type || !status) {
    throw new Error('Missing required parameters for creating an attendance record');
  }
  console.log(employeeId, timestamp, type, status);
  try {
    const query = `
      INSERT INTO Attendance (employeeId, timestamp, type, status) 
      VALUES (?, ?, ?, ?);
    `;
    const [result] = await db.execute(query, [employeeId, timestamp, type, status]);

    if (result.insertId) {
      console.log(result.insertId);
      return { id: result.insertId, employeeId, timestamp, type, status };
    } else {
      throw new Error('Failed to insert attendance record into the database.');
    }
  } catch (err) {
    console.error("Create Attendance Record Error:", err);
    throw new Error('Internal server error while creating attendance record');
  }
};

export const getAttendanceStats = async ({ period, startDate, endDate, departmentId }) => {
  try {
    if (!period || !startDate || !endDate || !departmentId) {
      throw new Error('Missing required parameters for attendance stats');
    }

    // ensure enddate cover the entire day (up to 23:59:59)
    const startDateTime = `${startDate} 00:00:00`;
    const endDateTime = `${endDate} 23:59:59`;

    // use DATE_FORMAT to return a single string that the Frontend can parse
    let groupByClause;
    switch (period) {
      case 'day':
        // Returns "2025-12-06"
        groupByClause = "DATE_FORMAT(a.timestamp, '%Y-%m-%d')";
        break;
      case 'month':
        // Returns "2025-12"
        groupByClause = "DATE_FORMAT(a.timestamp, '%Y-%m')";
        break;
      case 'year':
        // Returns "2025"
        groupByClause = "DATE_FORMAT(a.timestamp, '%Y')";
        break;
      default:
        throw new Error(`Invalid period value: ${period}`);
    }

    const query = `
      SELECT 
        e.id AS employeeId,
        e.firstName,
        e.lastName,
        COUNT(CASE WHEN a.type = 'in' THEN 1 END) AS totalCheckIns,
        COUNT(CASE WHEN a.type = 'out' THEN 1 END) AS totalCheckOuts,
        COUNT(CASE WHEN a.status = 'on-time' THEN 1 END) AS totalOnTime,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) AS totalLate,
        COUNT(CASE WHEN a.status = 'early-leave' THEN 1 END) AS totalEarlyLeaves,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS totalAbsences,
        ${groupByClause} AS period
      FROM Employee e
      JOIN Attendance a ON e.id = a.employeeId
      WHERE a.timestamp BETWEEN ? AND ?
        AND e.departmentId = ?
      GROUP BY e.id, e.firstName, e.lastName, ${groupByClause}
      ORDER BY period ASC;
    `;

    const [rows] = await db.execute(query, [startDateTime, endDateTime, departmentId]);

    return rows;
  } catch (err) {
    console.error("Attendance Stats Error:", err);
    throw new Error('Internal server error while fetching attendance stats');
  }
};
