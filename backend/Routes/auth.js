import jwt from 'jsonwebtoken';

// Function for verifying JWT tokens
export const verifyToken = (Token) => {
    try{
        return jwt.verify(Token, process.env.JWT_SECRET);
    }
    catch(err){
        console.error(err);
        return null;
    }
}