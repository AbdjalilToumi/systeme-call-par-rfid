import { db } from '../db.js';

// get all active employees present today
export const getActiveEmployees = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT e.* FROM Employee e JOIN Attendance a ON e.id = a.employeeId WHERE e.isActive = 1 AND DATE(a.timestamp) = CURDATE();");
        //const [rows] = await db.execute("SELECT e.* FROM Employee e JOIN Attendance a ON e.id = a.employeeId WHERE e.isActive = 1 AND DATE(a.timestamp) = '2025-12-04';");
        if(rows.length === 0){
            return res.status(404).json({ error: 'No active employees found' });
        }
        return  res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
// get employees present at a specific date
export const getEmpleyesAtDate = async (req, res) => {  
    const { date } = req.params;
    if(!date){
        return res.status(400).json({ error: 'Date parameter is missing' });    
    }
    try {
        const [rows] = await db.execute("SELECT e.* FROM Employee e JOIN Attendance a ON e.id = a.employeeId WHERE e.isActive = 1 AND DATE(a.timestamp) = ?;", [date]);
        if(rows.length === 0){
            return res.status(404).json({ error: 'No employees found for the specified date' });
        }
        return  res.status(200).json(rows);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

