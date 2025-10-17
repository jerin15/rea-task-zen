export type AppRole = 'admin' | 'estimation' | 'designer' | 'operations';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: Priority;
  role: AppRole;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  position: number;
}

export const ROLE_PIPELINES: Record<AppRole, string[]> = {
  estimation: [
    'TO DO LIST',
    'SUPPLIER QUOTES PENDING',
    'CLIENT APPROVAL PENDING',
    'QUOTATION BILL RAISED',
    'AWAITING PO',
    'FINAL INVOICE RAISED',
    'DONE'
  ],
  designer: [
    'TO DO LIST',
    'MOCKUP PENDING',
    'PRODUCTION',
    'PENDING WITH CLIENT',
    'DONE'
  ],
  operations: [
    'TO DO LIST',
    'APPROVAL',
    'PRODUCTION',
    'DELIVERY',
    'DONE'
  ],
  admin: [] // Admins can view any role's pipeline
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-priority-low',
  medium: 'bg-priority-medium',
  high: 'bg-priority-high',
  urgent: 'bg-priority-urgent',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};
