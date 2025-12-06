import { db } from '../db.js';

export const getAttendanceStats = async (req, res) => {
  const { period, startDate, endDate, departmentId } = req.query;

  try {
    if (!period || !startDate || !endDate || !departmentId) {
      return res.status(400).json({ error: 'Missing required query parameters' });
    }

    // 1. Fix Date Range: Ensure endDate covers the entire day (up to 23:59:59)
    const startDateTime = `${startDate} 00:00:00`;
    const endDateTime = `${endDate} 23:59:59`;

    // 2. Fix Grouping: Use DATE_FORMAT to return a single string string that the Frontend can parse
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
        return res.status(400).json({ error: 'Invalid period value' });
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

    return res.status(200).json({ message: 'Attendance stats retrieved successfully', data: rows });
  } catch (err) {
    console.error("Attendance Stats Error:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
