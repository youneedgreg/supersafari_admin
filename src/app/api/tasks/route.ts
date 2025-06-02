// app/api/tasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { logActivity } from '@/lib/logger';
import { notifyTaskCreated, notifyTaskCompleted } from '@/lib/notifications';

// Define the interfaces
interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  due_date: string;
  priority: string;
  status: string;
  client_id: number | null;
  client_name: string | null;
}

interface TaskRequest {
  id?: number;
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'completed';
  clientId?: number | null;
}

interface TaskResponse {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  status: string;
  clientId: number | null;
  clientName: string | null;
}

interface TaskCreateRequest {
  title: string;
  description?: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  clientId?: number;
}

interface TaskUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'completed';
  clientId?: number;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Query to get all tasks
    const query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.due_date,
        t.priority,
        t.status,
        t.client_id,
        CASE 
          WHEN t.client_id IS NOT NULL THEN c.name
          ELSE NULL
        END as client_name
      FROM 
        sgftw_tasks t
      LEFT JOIN 
        sgftw_reservation_submissions c ON t.client_id = c.id
      ORDER BY 
        CASE
          WHEN t.priority = 'high' THEN 1
          WHEN t.priority = 'medium' THEN 2
          WHEN t.priority = 'low' THEN 3
          ELSE 4
        END,
        STR_TO_DATE(t.due_date, '%Y-%m-%d') ASC
    `;

    // Use the executeQuery function
    const rows = await executeQuery(query) as TaskRow[];

    // Format dates to be more user-friendly
    const formattedResults: TaskResponse[] = rows.map(row => ({
      id: Number(row.id),
      title: row.title,
      description: row.description,
      dueDate: new Date(row.due_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      priority: row.priority,
      status: row.status,
      clientId: row.client_id ? Number(row.client_id) : null,
      clientName: row.client_name
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TaskCreateRequest = await request.json();
    
    if (!body.title || !body.dueDate || !body.priority) {
      return NextResponse.json(
        { error: 'Title, due date, and priority are required' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO sgftw_tasks (
        title,
        description,
        due_date,
        priority,
        status,
        client_id,
        created_at
      ) VALUES (?, ?, ?, ?, 'pending', ?, NOW())
    `;

    const result = await executeQuery(query, [
      body.title,
      body.description || null,
      body.dueDate,
      body.priority,
      body.clientId || null
    ]) as { insertId: number };

    // Get client name if task is associated with a client
    let clientName: string | undefined;
    if (body.clientId) {
      const clientQuery = 'SELECT name FROM sgftw_reservation_submissions WHERE id = ?';
      const clientResult = await executeQuery(clientQuery, [body.clientId]) as RowDataPacket[];
      clientName = clientResult[0]?.name;
    }

    // Create notification for new task
    await notifyTaskCreated(result.insertId, body.title, clientName);

    return NextResponse.json({
      message: 'Task created successfully',
      taskId: result.insertId
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PUT endpoint to update a task
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TaskUpdateRequest = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get current task details
    const currentTaskQuery = `
      SELECT t.*, c.name as client_name
      FROM sgftw_tasks t
      LEFT JOIN sgftw_reservation_submissions c ON t.client_id = c.id
      WHERE t.id = ?
    `;
    const currentTask = await executeQuery(currentTaskQuery, [body.id]) as TaskRow[];

    if (currentTask.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Build update query based on provided fields
    const updateFields: string[] = [];
    const params: (string | number | null)[] = [];
    
    if (body.title !== undefined) {
      updateFields.push('title = ?');
      params.push(body.title);
    }
    
    if (body.description !== undefined) {
      updateFields.push('description = ?');
      params.push(body.description);
    }
    
    if (body.dueDate !== undefined) {
      updateFields.push('due_date = ?');
      params.push(body.dueDate);
    }
    
    if (body.priority !== undefined) {
      updateFields.push('priority = ?');
      params.push(body.priority);
    }
    
    if (body.status !== undefined) {
      updateFields.push('status = ?');
      params.push(body.status);
    }
    
    if (body.clientId !== undefined) {
      updateFields.push('client_id = ?');
      params.push(body.clientId);
    }
    
    updateFields.push('updated_at = NOW()');
    
    // Add task ID to params
    params.push(body.id);
    
    const query = `
      UPDATE sgftw_tasks
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    await executeQuery(query, params);

    // If status was changed to completed, create notification
    if (body.status === 'completed' && currentTask[0].status !== 'completed') {
      await notifyTaskCompleted(
        body.id,
        body.title || currentTask[0].title,
        currentTask[0].client_name || undefined
      );
    }
    
    return NextResponse.json({
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove a task
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get task details before deletion
    const taskQuery = 'SELECT title FROM sgftw_tasks WHERE id = ?';
    const task = await executeQuery(taskQuery, [id]) as RowDataPacket[];
    
    if (task.length === 0) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const query = 'DELETE FROM sgftw_tasks WHERE id = ?';
    await executeQuery(query, [id]);

    // Log the activity
    await logActivity({
      actionType: 'DELETE',
      actionDescription: `Deleted task: ${task[0].title}`,
      entityType: 'TASK',
      entityId: Number(id),
      request
    });
    
    return NextResponse.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}