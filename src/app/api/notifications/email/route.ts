import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'info@superafricasafaris.com',
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { title, message, type, clientName } = await request.json();

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER || 'info@superafricasafaris.com',
      to: 'info@superafricasafaris.com',
      subject: `[${type.toUpperCase()}] ${title}`,
      html: `
        <h2>${title}</h2>
        <p>${message}</p>
        ${clientName ? `<p><strong>Client:</strong> ${clientName}</p>` : ''}
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
} 