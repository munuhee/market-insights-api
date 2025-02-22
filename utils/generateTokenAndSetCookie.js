const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const generateTokenAndSetCookie = (user, res) => {
    const token = jwt.sign(
        {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.cookie('token', token, {
        httpOnly: true, // accessible only by the web server
        secure: process.env.NODE_ENV === 'production', // only sent over HTTPS in production
        sameSite: 'strict', // prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expires after 7 days
    });

    res.status(200).json(
        {
            success: true,
            token
        }
    )
};

module.exports = generateTokenAndSetCookie;