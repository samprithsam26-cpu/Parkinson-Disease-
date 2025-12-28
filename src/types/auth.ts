export type UserType = 'doctor' | 'patient' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  createdAt: string;
}

export interface PatientRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  lastLogin: string;
  status: 'available' | 'busy' | 'offline' | 'book_appointment' | 'active';
  totalAnalyses: number;
  lastAnalysis?: string;
  appointmentRequestedAt?: string;
}

export interface DoctorQRCode {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  qrCode: string; // Unique QR code string
  sessionId: string; // Unique session ID
  createdAt: string;
  lastSignIn: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

