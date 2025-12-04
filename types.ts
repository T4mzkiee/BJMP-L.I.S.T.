
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
}

export enum Rank {
  JDIR = 'JDIR',
  JCSUP = 'JCSUP',
  JSSUP = 'JSSUP',
  JSUP = 'JSUP',
  JCINSP = 'JCINSP',
  JSINSP = 'JSINSP',
  JINSP = 'JINSP',
  SJO4 = 'SJO4',
  SJO3 = 'SJO3',
  SJO2 = 'SJO2',
  SJO1 = 'SJO1',
  JO3 = 'JO3',
  JO2 = 'JO2',
  JO1 = 'JO1',
  JO1_T = 'JO1/T',
  NUP = 'NUP',
}

export const RANK_ORDER: Rank[] = [
  Rank.JDIR, Rank.JCSUP, Rank.JSSUP, Rank.JSUP, Rank.JCINSP,
  Rank.JSINSP, Rank.JINSP, Rank.SJO4, Rank.SJO3, Rank.SJO2,
  Rank.SJO1, Rank.JO3, Rank.JO2, Rank.JO1, Rank.JO1_T, Rank.NUP
];

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  extension?: string;
  email: string;
  role: Role;
  rank: Rank;
  isActive: boolean;
  mustChangePassword?: boolean;
  lastLogin?: string;
  createdAt: string;
  createdBy?: string; // ID of Super Admin
}

export interface Personnel {
  id: string;
  rank: Rank;
  lastName: string;
  firstName: string;
  middleName?: string;
  extension?: string;
  gender: 'Male' | 'Female';
  officeAssignment: string[]; // Multiple allowed
  designation: string[]; // Multiple allowed
  education: string;
  eligibility: string;
  dateOfBirth: string;
  dateOfAppointment: string;
  trainingType?: string;
  dateOfLastPromotion?: string;
  status: 'Active' | 'Retired' | 'Suspended';
  remarks?: string; // Format: ON-TYPE-SCHOOLING(DD/Month/YYYY)
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string; // User Email
  timestamp: string;
}

export interface SystemMetrics {
  totalPersonnel: number;
  totalAdmins: number;
  storageUsage: string;
}
