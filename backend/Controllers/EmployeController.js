import { db } from '../db.js';

// get all active employees present today
export const getActiveEmployees = async () => {
    try {
        const [rows] = await db.execute("SELECT e.* FROM Employee e JOIN Attendance a ON e.id = a.employeeId WHERE e.isActive = 1 AND DATE(a.timestamp) = CURDATE();");
        return rows;
    } catch (err) {
        console.error(err);
        throw new Error('Internal server error while fetching active employees');
    }
}



// get employees present at a specific date
export const getEmpleyesAtDate = async (date) => {  
    if(!date){
        throw new Error('Date parameter is missing');    
    }
    try {
        const [rows] = await db.execute("SELECT e.* FROM Employee e JOIN Attendance a ON e.id = a.employeeId WHERE e.isActive = 1 AND DATE(a.timestamp) = ?;", [date]);
        return rows;
    }
    catch (err) {
        console.error(err);
        throw new Error('Internal server error while fetching employees by date');
    }
}


export const getEmployeGracePeriod = async (employeID) => {
    if (!employeID) {
        throw new Error('Employee ID parameter is missing');
    }
    try{
        const [rows] = await db.execute("SELECT d.gracePeriodMinutes FROM Employee e JOIN Department d ON e.departmentId = d.id WHERE e.id = ?;", [employeID]);
        if (rows.length === 0) {
            return 15; // Or throw an error if an employee should always be found
        }
        return rows[0];
    } catch(err) {
        console.error(err);
        throw new Error('Internal server error while fetching employee grace period');
    }
}
// Returns the employee object or undefined if not found
export const getEmployeeByUID = async (uid) => {
    if (!uid) {
        throw new Error('UID parameter is missing');
    }
    try {
        const [rows] = await db.execute(
            `SELECT e.id ,e.firstName, e.lastName, d.workStartTime, d.workEndTime, d.gracePeriodMinutes 
             FROM Employee e 
             JOIN Department d ON e.departmentId = d.id 
             WHERE e.id = ? AND e.isActive = 1;`, [uid]);
        return rows[0]; 
    } catch (err) {
        console.error(err);
        throw new Error('Internal server error while fetching employee by UID');
    }
};