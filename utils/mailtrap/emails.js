const { mailTrapClient, sender } = require('./mailtrap');
const { VERIFICATION_EMAIL_TEMPLATE, SEND_WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE } = require('./emailTemplate');

const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];
    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Verify your email',
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{{verificationCode}}", verificationToken),
            category: 'Email Verification',
        })
    } catch (error) {
        console.error(`Error sending verification email: ${error}`);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

const sendWelcomeEmail = async (email, usename) => {
    const recipient = [{email}];
    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Welcome to our platform',
            html: SEND_WELCOME_EMAIL_TEMPLATE.replace("{{username}}", usename),
            category: 'Welcome',
        })
    } catch (error) {
        console.error(`Error sending verification email: ${error}`);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{email}];
    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Reset your password',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{{resetURL}}", resetURL),
            category: 'Password Reset',
        })
    } catch (error) {
        console.error(`Error sending verification email: ${error}`);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

const sendResetSuccessEmail = async (email) => {
    const recipient = [{email}];
    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recipient,
            subject: 'Password reset successful',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: 'Password Reset',
        })
    } catch (error) {
        console.error(`Error sending verification email: ${error}`);
        throw new Error(`Error sending verification email: ${error}`);
    }
};

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendResetSuccessEmail
};
