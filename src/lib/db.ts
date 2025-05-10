import mysql from 'mysql2/promise';

// Create a connection pool instead of a single connection
const pool = mysql.createPool({
  host: process.env.DB_HOST!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 500,
  queueLimit: 500,
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
  let connection;
  try {
    console.log('Acquiring connection...');
    connection = await pool.getConnection();
    console.log('Connection acquired');
    
    const [results] = await connection.query(query, params);
    
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      console.log('Releasing connection...');
      connection.release();
      console.log('Connection released');
    } else {
      console.error('Connection was not acquired');
    }
  }
}
