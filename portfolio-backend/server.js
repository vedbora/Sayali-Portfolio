// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Email template
const createEmailTemplate = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">New Contact Form Submission</h2>
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px;">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p style="background-color: #fff; padding: 15px; border-left: 4px solid #00ffff;">${data.message}</p>
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">
        This message was sent from your portfolio contact form.
      </p>
    </div>
  `;
};

// Contact form endpoint
app.post('/send', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Input validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Setup email data
    const mailOptions = {
      from: email,
      to: process.env.CONTACT_EMAIL || 'sayalijain1203@gmail.com',
      subject: `New message from ${name} - Portfolio Contact Form`,
      html: createEmailTemplate({ name, email, message }),
      replyTo: email
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Send confirmation response
    res.status(200).json({
      success: true,
      message: 'Message sent successfully!'
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  // ✅ Fix: use a regex instead of '*'
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
