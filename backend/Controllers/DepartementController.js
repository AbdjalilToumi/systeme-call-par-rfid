import { db } from '../db.js';


export const getDepartements = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT id, name, description, location, managerId, workStartTime, workEndTime, gracePeriodMinutes FROM Department;");
        if(rows.length === 0){
            return res.status(404).json({ error: 'No departement found' });
        }
        return  res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

