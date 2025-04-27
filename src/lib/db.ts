import mysql from 'mysql2/promise';

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_DATABASE!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add connection timeout
  connectTimeout: 10000, // 10 seconds
  // Add SSL if connecting to a cloud database (uncomment if needed)
  // ssl: {
  //   rejectUnauthorized: true
  // }
});

export async function connectDB() {
  // Return the pool instead of creating a new connection each time
  return pool;
}

// Function to execute a query and release the connection
export async function executeQuery(query: string, params: unknown[] = []) {
  try {
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.query(query, params);
      return results;
    } finally {
      connection.release(); // Always release the connection back to the pool
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}