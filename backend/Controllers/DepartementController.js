import { db } from '../db.js';


export const getDepartements = async () => {
    try {
        const [rows] = await db.execute("SELECT id, name, description, location, workStartTime, workEndTime, gracePeriodMinutes FROM Department;");
        return rows;
    } catch (err) {
        console.error(err);
        throw new Error('Internal server error');
    }
}


