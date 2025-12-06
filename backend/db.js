import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();


// Data base configuration
export const db = await mysql2.createPool({
host: process.env.DATABASE_HOST || 'localhost',        
  user: process.env.DATABASE_USER,             
  password: process.env.DATABASE_PASSWORD,             
  database: process.env.DATABASE_NAME, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// connect to database
try{
  const connection = await db.getConnection();
  console.log('Connexion à la base de données MySQL réussie');
  connection.release();
}
catch(err){
    console.error('Error connection to data base ' + err);
}