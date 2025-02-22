const { mailTrapClient, sender } = require('./mailtrap');
const { VERIFICATION_EMAIL_TEMPLATE, SEND_WELCOME_EMAIL_TEMPLATE } = require('./emailTemplate');

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

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail
};
