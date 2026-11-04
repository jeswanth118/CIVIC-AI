export type ComplaintCategory =
  | 'Road Damage'
  | 'Waste Management'
  | 'Water Leakage'
  | 'Streetlight'
  | 'Drainage'
  | 'Public Infrastructure'
  | 'Other';

export type ComplaintStatus = 'Submitted' | 'Under Review' | 'In Progress' | 'Resolved';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AIAnalysis {
  category: ComplaintCategory;
  summary: string;
  suggested_department: string;
  suggested_priority: ComplaintPriority;
  priority_reason: string;
  recommended_action: string;
  possible_safety_risk: string;
}

export interface StatusUpdate {
  status: ComplaintStatus;
  note: string;
  timestamp: string;
  updatedBy: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  status: ComplaintStatus;
  aiAnalysis: AIAnalysis;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
  imageUrl?: string;
  statusHistory?: StatusUpdate[];
  potentialDuplicateOf?: string;
}

export interface DuplicateMatch {
  complaint: Complaint;
  similarityScore: number;
  reason: string;
}
