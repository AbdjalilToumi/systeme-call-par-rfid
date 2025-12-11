import { db } from '../db.js';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Handle Login
export const login = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Request information is missing' });
  }
  const { email, password } = req.body;

  try {

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Query the Admin table to check if the email and password match
    const [rows] = await db.execute(
      'SELECT email, firstName, lastName, imagePath FROM Admin WHERE email = ? AND password = ?',
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // get the image file path and build a public URL for the client
    const imagePath = path.join(process.cwd(), rows[0].imagePath);

    // check if the image file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image file not found' });
    }

    // Login successful:
    // generate a JWT token
    const token = jwt.sign({
      email: rows[0].email,
    }, process.env.JWT_SECRET);

    // build a URL path for the client to fetch the image
    const imageFilename = path.basename(rows[0].imagePath);
    const imageUrl = `/profileImage/${imageFilename}`;

    // return JSON with image URL and admin info
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      email: email,
      firstName: rows[0].firstName,
      lastName: rows[0].lastName,
      imageUrl
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdmins = async (req, res) => {
  try {
    if(!req.body){
        return res.status(400).json({ error: 'Request informtion is missing' });
    }
    const {email} = req.body;
    const [rows] = await db.execute(" SELECT email, firstName, lastName, phone, address, imagePath FROM Admin WHERE email = ?", [email]);
   
    if(rows.length === 0){
        return res.status(404).json({ error: 'Admin not found' });
    }
    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}