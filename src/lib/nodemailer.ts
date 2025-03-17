import nodemailer from 'nodemailer';

// Create a test account if no email credentials are provided
const createTestAccount = async () => {
  const testAccount = await nodemailer.createTestAccount();
  console.log("Created test email account:", testAccount.user);
  return {
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  };
};

// Create the transporter with either real credentials or test account
const createTransporter = async () => {
  // If you have real email credentials, use them
  if (process.env.EMAIL_SERVER && process.env.SENDER_EMAIL && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  } else {
    // Otherwise use a test account
    const testConfig = await createTestAccount();
    return nodemailer.createTransport(testConfig);
  }
};

// Initialize the transporter
let _transporter: nodemailer.Transporter;

export const getTransporter = async () => {
  if (!_transporter) {
    _transporter = await createTransporter();
  }
  return _transporter;
};

// For backward compatibility
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER || 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SENDER_EMAIL || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
});