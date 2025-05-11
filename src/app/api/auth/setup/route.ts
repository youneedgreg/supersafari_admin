import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Create users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create login_logs table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create default admin user if not exists
    const adminEmail = 'admin@superafrica.com';
    const adminPassword = await bcrypt.hash('admin123', 10);

    await executeQuery(`
      INSERT IGNORE INTO users (email, password, name, role)
      VALUES (?, ?, 'Admin User', 'admin')
    `, [adminEmail, adminPassword]);

    return NextResponse.json({ 
      status: 'OK',
      message: 'Authentication tables created successfully' 
    });
  } catch (error: any) {
    console.error('Failed to setup auth tables:', error);
    return NextResponse.json({ 
      status: 'ERROR',
      message: 'Failed to setup auth tables',
      error: error.message 
    }, { status: 500 });
  }
} 