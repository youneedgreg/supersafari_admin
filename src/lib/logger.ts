import { executeQuery } from './db';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface LogActivityParams {
  actionType: string;
  actionDescription: string;
  entityType: string;
  entityId?: number;
  request: Request;
}

export async function logActivity({
  actionType,
  actionDescription,
  entityType,
  entityId,
  request
}: LogActivityParams) {
  try {
    // Get auth token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      console.error('No auth token found for activity logging');
      return;
    }

    // Verify token to get user ID
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Get IP address and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Insert activity log
    await executeQuery(
      `INSERT INTO activity_logs (
        user_id,
        action_type,
        action_description,
        entity_type,
        entity_id,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, actionType, actionDescription, entityType, entityId, ipAddress, userAgent]
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
} 