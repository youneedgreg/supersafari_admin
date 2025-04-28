/* eslint-disable @typescript-eslint/no-explicit-any */
// /app/api/clients/[id]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const updateData = await request.json();

    let query = 'UPDATE sgftw_reservation_submissions SET ';
    const queryParams: (string | number)[] = [];
    const updates: string[] = [];

    if (updateData.status) {
      updates.push('status = ?');
      queryParams.push(updateData.status);
    }

    if (updateData.notes) {
      updates.push('additional_info = ?');
      queryParams.push(updateData.notes);
    }

    if (updates.length === 0) {
      return NextResponse.json({
        status: 'ERROR',
        message: 'No fields to update'
      }, { status: 400 });
    }

    query += updates.join(', ') + ' WHERE id = ?';
    queryParams.push(Number(id));

    await executeQuery(query, queryParams);

    return NextResponse.json({
      status: 'OK',
      message: 'Client updated successfully'
    });

  } catch (error: any) {
    console.error('Failed to update client:', error);
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to update client',
      error: { name: error.name, message: error.message }
    }, { status: 500 });
  }
}