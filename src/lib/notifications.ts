import { executeQuery } from './db';
import { NextRequest } from 'next/server';
import { addDays, differenceInDays } from 'date-fns';
import { RowDataPacket } from 'mysql2';

export type NotificationType = 
  | 'CLIENT_CREATED'
  | 'CLIENT_STATUS_CHANGED'
  | 'CLIENT_DELETED'
  | 'INVOICE_CREATED'
  | 'INVOICE_STATUS_CHANGED'
  | 'INVOICE_DUE_SOON'
  | 'TASK_CREATED'
  | 'TASK_DUE_SOON'
  | 'TASK_COMPLETED'
  | 'ARRIVAL_SOON'
  | 'DEPARTURE_SOON';

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  client_id?: number | null;
}

interface ArrivalRow extends RowDataPacket {
  id: number;
  name: string;
  arrival_date: string;
}

interface DepartureRow extends RowDataPacket {
  id: number;
  name: string;
  departure_date: string;
}

interface TaskRow extends RowDataPacket {
  id: number;
  title: string;
  due_date: string;
  client_name: string | null;
}

interface InvoiceRow extends RowDataPacket {
  id: string;
  due_date: string;
  client_name: string;
}

export async function createNotification(data: NotificationData) {
  const query = `
    INSERT INTO sgftw_notifications (
      title,
      message,
      type,
      client_id,
      created_at,
      \`read\`
    ) VALUES (?, ?, ?, ?, NOW(), 0)
  `;

  await executeQuery(query, [
    data.title,
    data.message,
    data.type,
    data.client_id || null
  ]);
}

// Client-related notifications
export async function notifyClientCreated(clientId: number, clientName: string) {
  await createNotification({
    title: 'New Client Added',
    message: `New client "${clientName}" has been added to the system.`,
    type: 'CLIENT_CREATED',
    client_id: clientId
  });
}

export async function notifyClientStatusChanged(clientId: number, clientName: string, oldStatus: string, newStatus: string) {
  await createNotification({
    title: 'Client Status Updated',
    message: `Client "${clientName}" status changed from ${oldStatus} to ${newStatus}.`,
    type: 'CLIENT_STATUS_CHANGED',
    client_id: clientId
  });
}

export async function notifyClientDeleted(clientName: string) {
  await createNotification({
    title: 'Client Deleted',
    message: `Client "${clientName}" has been removed from the system.`,
    type: 'CLIENT_DELETED'
  });
}

// Invoice-related notifications
export async function notifyInvoiceCreated(invoiceId: string, clientName: string, amount: number) {
  await createNotification({
    title: 'New Invoice Created',
    message: `New invoice #${invoiceId} for ${clientName} with amount $${amount} has been created.`,
    type: 'INVOICE_CREATED'
  });
}

export async function notifyInvoiceStatusChanged(invoiceId: string, clientName: string, newStatus: string) {
  await createNotification({
    title: 'Invoice Status Updated',
    message: `Invoice #${invoiceId} for ${clientName} status changed to ${newStatus}.`,
    type: 'INVOICE_STATUS_CHANGED'
  });
}

export async function notifyInvoiceDueSoon(invoiceId: string, clientName: string, dueDate: Date) {
  await createNotification({
    title: 'Invoice Due Soon',
    message: `Invoice #${invoiceId} for ${clientName} is due in ${differenceInDays(dueDate, new Date())} days.`,
    type: 'INVOICE_DUE_SOON'
  });
}

// Task-related notifications
export async function notifyTaskCreated(taskId: number, title: string, clientName?: string) {
  await createNotification({
    title: 'New Task Created',
    message: `New task "${title}"${clientName ? ` for ${clientName}` : ''} has been created.`,
    type: 'TASK_CREATED'
  });
}

export async function notifyTaskDueSoon(taskId: number, title: string, dueDate: Date, clientName?: string) {
  await createNotification({
    title: 'Task Due Soon',
    message: `Task "${title}"${clientName ? ` for ${clientName}` : ''} is due in ${differenceInDays(dueDate, new Date())} days.`,
    type: 'TASK_DUE_SOON'
  });
}

export async function notifyTaskCompleted(taskId: number, title: string, clientName?: string) {
  await createNotification({
    title: 'Task Completed',
    message: `Task "${title}"${clientName ? ` for ${clientName}` : ''} has been completed.`,
    type: 'TASK_COMPLETED'
  });
}

// Arrival/Departure notifications
export async function notifyArrivalSoon(clientId: number, clientName: string, arrivalDate: Date) {
  await createNotification({
    title: 'Client Arrival Soon',
    message: `${clientName} is arriving in ${differenceInDays(arrivalDate, new Date())} days.`,
    type: 'ARRIVAL_SOON',
    client_id: clientId
  });
}

export async function notifyDepartureSoon(clientId: number, clientName: string, departureDate: Date) {
  await createNotification({
    title: 'Client Departure Soon',
    message: `${clientName} is departing in ${differenceInDays(departureDate, new Date())} days.`,
    type: 'DEPARTURE_SOON',
    client_id: clientId
  });
}

// Check for upcoming events and create notifications
export async function checkUpcomingEvents() {
  const today = new Date();
  const thirtyDaysFromNow = addDays(today, 30);

  // Check upcoming arrivals
  const arrivalQuery = `
    SELECT id, name, arrival_date
    FROM sgftw_reservation_submissions
    WHERE arrival_date BETWEEN ? AND ?
    AND status IN ('confirmed', 'booked')
  `;
  const arrivals = await executeQuery(arrivalQuery, [today, thirtyDaysFromNow]) as ArrivalRow[];

  for (const arrival of arrivals) {
    await notifyArrivalSoon(
      arrival.id,
      arrival.name,
      new Date(arrival.arrival_date)
    );
  }

  // Check upcoming departures
  const departureQuery = `
    SELECT id, name, departure_date
    FROM sgftw_reservation_submissions
    WHERE departure_date BETWEEN ? AND ?
    AND status IN ('confirmed', 'booked')
  `;
  const departures = await executeQuery(departureQuery, [today, thirtyDaysFromNow]) as DepartureRow[];

  for (const departure of departures) {
    await notifyDepartureSoon(
      departure.id,
      departure.name,
      new Date(departure.departure_date)
    );
  }

  // Check upcoming tasks
  const taskQuery = `
    SELECT t.id, t.title, t.due_date, c.name as client_name
    FROM sgftw_tasks t
    LEFT JOIN sgftw_reservation_submissions c ON t.client_id = c.id
    WHERE STR_TO_DATE(t.due_date, '%Y-%m-%d') BETWEEN ? AND ?
    AND t.status = 'pending'
  `;
  const tasks = await executeQuery(taskQuery, [today, thirtyDaysFromNow]) as TaskRow[];

  for (const task of tasks) {
    await notifyTaskDueSoon(
      task.id,
      task.title,
      new Date(task.due_date),
      task.client_name || undefined
    );
  }

  // Check upcoming invoice due dates
  const invoiceQuery = `
    SELECT i.id, i.due_date, c.name as client_name
    FROM sgftw_invoices i
    JOIN sgftw_reservation_submissions c ON i.client_id = c.id
    WHERE i.due_date BETWEEN ? AND ?
    AND i.status = 'pending'
  `;
  const invoices = await executeQuery(invoiceQuery, [today, thirtyDaysFromNow]) as InvoiceRow[];

  for (const invoice of invoices) {
    await notifyInvoiceDueSoon(
      invoice.id,
      invoice.client_name,
      new Date(invoice.due_date)
    );
  }
} 