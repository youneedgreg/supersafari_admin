// Notification types
export type NotificationType = 
  | 'client_created'
  | 'client_updated'
  | 'client_deleted'
  | 'reservation_created'
  | 'reservation_updated'
  | 'reservation_deleted'
  | 'reservation_status_changed'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_status_changed'
  | 'note_created'
  | 'note_updated'
  | 'note_deleted'
  | 'invoice_created'
  | 'invoice_updated'
  | 'invoice_deleted'
  | 'invoice_status_changed';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  entityId: number;
  entityType: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

// Add notifications table
export const notifications = sql`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    entity_type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

// Create triggers for notifications
export const notificationTriggers = sql`
  -- Client triggers
  CREATE TRIGGER IF NOT EXISTS client_created_notification
  AFTER INSERT ON clients
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'client_created',
      'New Client Added',
      'A new client has been added to the system',
      NEW.id,
      'client'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS client_updated_notification
  AFTER UPDATE ON clients
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'client_updated',
      'Client Updated',
      'Client information has been updated',
      NEW.id,
      'client'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS client_deleted_notification
  AFTER DELETE ON clients
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'client_deleted',
      'Client Deleted',
      'A client has been removed from the system',
      OLD.id,
      'client'
    );
  END;

  -- Reservation triggers
  CREATE TRIGGER IF NOT EXISTS reservation_created_notification
  AFTER INSERT ON reservations
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'reservation_created',
      'New Reservation',
      'A new reservation has been created',
      NEW.id,
      'reservation'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS reservation_updated_notification
  AFTER UPDATE ON reservations
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'reservation_updated',
      'Reservation Updated',
      'Reservation details have been updated',
      NEW.id,
      'reservation'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS reservation_status_changed_notification
  AFTER UPDATE ON reservations
  WHEN OLD.status != NEW.status
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'reservation_status_changed',
      'Reservation Status Changed',
      'Reservation status changed from ' || OLD.status || ' to ' || NEW.status,
      NEW.id,
      'reservation'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS reservation_deleted_notification
  AFTER DELETE ON reservations
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'reservation_deleted',
      'Reservation Deleted',
      'A reservation has been cancelled',
      OLD.id,
      'reservation'
    );
  END;

  -- Task triggers
  CREATE TRIGGER IF NOT EXISTS task_created_notification
  AFTER INSERT ON tasks
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'task_created',
      'New Task',
      'A new task has been created',
      NEW.id,
      'task'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS task_updated_notification
  AFTER UPDATE ON tasks
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'task_updated',
      'Task Updated',
      'Task details have been updated',
      NEW.id,
      'task'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS task_status_changed_notification
  AFTER UPDATE ON tasks
  WHEN OLD.status != NEW.status
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'task_status_changed',
      'Task Status Changed',
      'Task status changed from ' || OLD.status || ' to ' || NEW.status,
      NEW.id,
      'task'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS task_deleted_notification
  AFTER DELETE ON tasks
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'task_deleted',
      'Task Deleted',
      'A task has been removed',
      OLD.id,
      'task'
    );
  END;

  -- Note triggers
  CREATE TRIGGER IF NOT EXISTS note_created_notification
  AFTER INSERT ON notes
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'note_created',
      'New Note',
      'A new note has been added',
      NEW.id,
      'note'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS note_updated_notification
  AFTER UPDATE ON notes
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'note_updated',
      'Note Updated',
      'A note has been modified',
      NEW.id,
      'note'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS note_deleted_notification
  AFTER DELETE ON notes
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'note_deleted',
      'Note Deleted',
      'A note has been removed',
      OLD.id,
      'note'
    );
  END;

  -- Invoice triggers
  CREATE TRIGGER IF NOT EXISTS invoice_created_notification
  AFTER INSERT ON invoices
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'invoice_created',
      'New Invoice',
      'A new invoice has been created',
      NEW.id,
      'invoice'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS invoice_updated_notification
  AFTER UPDATE ON invoices
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'invoice_updated',
      'Invoice Updated',
      'Invoice details have been updated',
      NEW.id,
      'invoice'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS invoice_status_changed_notification
  AFTER UPDATE ON invoices
  WHEN OLD.status != NEW.status
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'invoice_status_changed',
      'Invoice Status Changed',
      'Invoice status changed from ' || OLD.status || ' to ' || NEW.status,
      NEW.id,
      'invoice'
    );
  END;

  CREATE TRIGGER IF NOT EXISTS invoice_deleted_notification
  AFTER DELETE ON invoices
  BEGIN
    INSERT INTO notifications (type, title, message, entity_id, entity_type)
    VALUES (
      'invoice_deleted',
      'Invoice Deleted',
      'An invoice has been removed',
      OLD.id,
      'invoice'
    );
  END;
`; 