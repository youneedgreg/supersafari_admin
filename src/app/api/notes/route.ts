// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { format } from 'date-fns';

// Define the interfaces
interface NoteRow extends RowDataPacket {
  id: number;
  title: string;
  content: string;
  client_id: number | null;
  client_name: string | null;
  created_at: string;
  updated_at: string | null;
}

interface TagRow extends RowDataPacket {
  note_id: number;
  tag_name: string;
}

interface NoteResponse {
  id: number;
  title: string;
  content: string;
  clientId: number | null;
  clientName: string | null;
  date: string;
  tags: string[];
}

interface NoteRequest {
  title: string;
  content: string;
  clientId?: number | null;
  tags?: string[];
}

interface UpdateNoteRequest {
  id: number;
  title?: string;
  content?: string;
  clientId?: number | null;
  tags?: string[];
}

// Get all notes
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, get a specific note with its tags
    if (id) {
      // Get note details
      const noteQuery = `
        SELECT 
          n.id,
          n.title,
          n.content,
          n.client_id,
          CASE 
            WHEN n.client_id IS NOT NULL THEN c.name
            ELSE NULL
          END as client_name,
          n.created_at,
          n.updated_at
        FROM 
          sgftw_notes n
        LEFT JOIN 
          sgftw_reservation_submissions c ON n.client_id = c.id
        WHERE 
          n.id = ?
      `;
      
      const noteResult = await executeQuery(noteQuery, [id]) as NoteRow[];
      
      if (noteResult.length === 0) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }
      
      const note = noteResult[0];
      
      // Get note tags
      const tagsQuery = `
        SELECT 
          note_id,
          tag_name
        FROM 
          sgftw_note_tags
        WHERE 
          note_id = ?
      `;
      
      const tagsResult = await executeQuery(tagsQuery, [id]) as TagRow[];
      
      const formattedNote: NoteResponse = {
        id: note.id,
        title: note.title,
        content: note.content,
        clientId: note.client_id,
        clientName: note.client_name,
        date: format(new Date(note.created_at), 'MMMM d, yyyy'),
        tags: tagsResult.map(tag => tag.tag_name)
      };
      
      return NextResponse.json(formattedNote);
    }
    
    // Get all notes
    const query = `
      SELECT 
        n.id,
        n.title,
        n.content,
        n.client_id,
        CASE 
          WHEN n.client_id IS NOT NULL THEN c.name
          ELSE NULL
        END as client_name,
        n.created_at,
        n.updated_at
      FROM 
        sgftw_notes n
      LEFT JOIN 
        sgftw_reservation_submissions c ON n.client_id = c.id
      ORDER BY 
        n.created_at DESC
    `;
    
    const rows = await executeQuery(query) as NoteRow[];
    
    // Get all tags for all notes
    const tagsQuery = `
      SELECT 
        note_id,
        tag_name
      FROM 
        sgftw_note_tags
      ORDER BY
        note_id
    `;
    
    const tagsResult = await executeQuery(tagsQuery) as TagRow[];
    
    // Group tags by note_id
    const tagsByNoteId = tagsResult.reduce((acc, tag) => {
      if (!acc[tag.note_id]) {
        acc[tag.note_id] = [];
      }
      acc[tag.note_id].push(tag.tag_name);
      return acc;
    }, {} as Record<number, string[]>);
    
    // Format the result
    const formattedResults: NoteResponse[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      content: row.content,
      clientId: row.client_id,
      clientName: row.client_name,
      date: format(new Date(row.created_at), 'MMMM d, yyyy'),
      tags: tagsByNoteId[row.id] || []
    }));
    
    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

// Create a new note
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: NoteRequest = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await executeQuery('START TRANSACTION');
    
    try {
      // Insert note
      const noteQuery = `
        INSERT INTO sgftw_notes (
          title,
          content,
          client_id,
          created_at
        ) VALUES (?, ?, ?, NOW())
      `;
      
      const result = await executeQuery(noteQuery, [
        body.title,
        body.content,
        body.clientId || null
      ]) as ResultSetHeader;
      
      const noteId = result.insertId;
      
      // Insert tags if provided
      if (body.tags && body.tags.length > 0) {
        for (const tag of body.tags) {
          const tagQuery = `
            INSERT INTO sgftw_note_tags (
              note_id,
              tag_name
            ) VALUES (?, ?)
          `;
          
          await executeQuery(tagQuery, [noteId, tag]);
        }
      }
      
      // Commit transaction
      await executeQuery('COMMIT');
      
      return NextResponse.json({
        message: 'Note created successfully',
        id: noteId
      }, { status: 201 });
    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
}

// Update a note
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body: UpdateNoteRequest = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    // Start a transaction
    await executeQuery('START TRANSACTION');
    
    try {
      // Update note
      const updateFields: string[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any[] = [];
      
      if (body.title !== undefined) {
        updateFields.push('title = ?');
        params.push(body.title);
      }
      
      if (body.content !== undefined) {
        updateFields.push('content = ?');
        params.push(body.content);
      }
      
      if (body.clientId !== undefined) {
        updateFields.push('client_id = ?');
        params.push(body.clientId);
      }
      
      updateFields.push('updated_at = NOW()');
      
      // Add note ID to params
      params.push(body.id);
      
      const query = `
        UPDATE sgftw_notes
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      await executeQuery(query, params);
      
      // Update tags if provided
      if (body.tags !== undefined) {
        // Delete existing tags
        const deleteTagsQuery = 'DELETE FROM sgftw_note_tags WHERE note_id = ?';
        await executeQuery(deleteTagsQuery, [body.id]);
        
        // Insert new tags
        if (body.tags.length > 0) {
          for (const tag of body.tags) {
            const tagQuery = `
              INSERT INTO sgftw_note_tags (
                note_id,
                tag_name
              ) VALUES (?, ?)
            `;
            
            await executeQuery(tagQuery, [body.id, tag]);
          }
        }
      }
      
      // Commit transaction
      await executeQuery('COMMIT');
      
      return NextResponse.json({
        message: 'Note updated successfully'
      });
    } catch (error) {
      // Rollback transaction on error
      await executeQuery('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// Delete a note
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }
    
    // Delete note (the tags will be deleted automatically due to CASCADE constraint)
    const query = 'DELETE FROM sgftw_notes WHERE id = ?';
    const result = await executeQuery(query, [id]) as ResultSetHeader;
    
    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}