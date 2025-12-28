// Backend server runs on port 3001, React app on 8080
const SERVER_URL = 'http://10.177.156.54:3001';

export interface SyncData {
  type: 'patient_record' | 'appointment' | 'login' | 'logout' | 'delete_patient' | 'delete_doctor' | 'delete_qrcode';
  data: any;
  timestamp: string;
}

/**
 * Sync data to the server
 */
export const syncToServer = async (type: SyncData['type'], data: any): Promise<boolean> => {
  try {
    const syncData: SyncData = {
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    console.log(`[Server Sync] Syncing ${type} to ${SERVER_URL}/api/sync`, syncData);

    const response = await fetch(`${SERVER_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(syncData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`[Server Sync] Failed to sync ${type}:`, response.status, errorText);
      return false;
    }

    const result = await response.json().catch(() => ({}));
    console.log(`[Server Sync] Successfully synced ${type}`, result);
    return true;
  } catch (error) {
    console.error(`[Server Sync] Error syncing ${type} to server:`, error);
    // Don't throw - allow app to continue working even if sync fails
    return false;
  }
};

/**
 * Sync patient record to server
 */
export const syncPatientRecord = async (patientRecord: any): Promise<boolean> => {
  return syncToServer('patient_record', patientRecord);
};

/**
 * Sync appointment booking to server
 */
export const syncAppointment = async (appointmentData: {
  patientId: string;
  patientName: string;
  patientEmail: string;
  status: string;
  timestamp: string;
}): Promise<boolean> => {
  return syncToServer('appointment', appointmentData);
};

/**
 * Sync login event to server
 */
export const syncLogin = async (loginData: {
  userId: string;
  email: string;
  name: string;
  userType: string;
  timestamp: string;
}): Promise<boolean> => {
  return syncToServer('login', loginData);
};

/**
 * Sync logout event to server
 */
export const syncLogout = async (logoutData: {
  userId: string;
  email: string;
  name: string;
  userType: string;
  timestamp: string;
}): Promise<boolean> => {
  return syncToServer('logout', logoutData);
};

/**
 * Fetch patient records from server
 */
export const fetchPatientRecords = async (): Promise<any[]> => {
  try {
    console.log(`[Server Sync] Fetching patient records from ${SERVER_URL}/api/patient-records`);
    
    const response = await fetch(`${SERVER_URL}/api/patient-records`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`[Server Sync] Failed to fetch patient records:`, response.status, errorText);
      return [];
    }

    const data = await response.json();
    const records = data.records || data || [];
    console.log(`[Server Sync] Fetched ${records.length} patient records from server`);
    return records;
  } catch (error) {
    console.error('[Server Sync] Error fetching patient records:', error);
    return [];
  }
};

/**
 * Fetch appointments from server
 */
export const fetchAppointments = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${SERVER_URL}/api/appointments`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch appointments:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.appointments || [];
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return [];
  }
};

/**
 * Sync delete patient event to server
 */
export const syncDeletePatient = async (patientId: string, patientName: string): Promise<boolean> => {
  return syncToServer('delete_patient', {
    patientId,
    patientName,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sync delete doctor event to server
 */
export const syncDeleteDoctor = async (doctorId: string, doctorName: string): Promise<boolean> => {
  return syncToServer('delete_doctor', {
    doctorId,
    doctorName,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Sync delete QR code event to server
 */
export const syncDeleteQRCode = async (qrCodeId: string, doctorName: string): Promise<boolean> => {
  return syncToServer('delete_qrcode', {
    qrCodeId,
    doctorName,
    timestamp: new Date().toISOString(),
  });
};

