import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001; // Different port from the React app
const DATA_FILE = path.join(__dirname, 'server-data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      patientRecords: [],
      appointments: [],
      loginLogs: [],
      logoutLogs: [],
      deleteLogs: [],
    };
  fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Helper function to read data
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return {
      patientRecords: [],
      appointments: [],
      loginLogs: [],
      logoutLogs: [],
    };
  }
};

// Helper function to write data
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

// Sync endpoint - handles all sync operations
app.post('/api/sync', (req, res) => {
  try {
    const { type, data, timestamp } = req.body;
    const serverData = readData();

    console.log(`[Server] Received sync: ${type}`, data);

    switch (type) {
      case 'patient_record':
        // Update or add patient record
        const patientIndex = serverData.patientRecords.findIndex(
          (p) => p.id === data.id || p.patientId === data.patientId
        );
        if (patientIndex >= 0) {
          // Merge with existing record, server data takes precedence for status/appointment
          serverData.patientRecords[patientIndex] = {
            ...serverData.patientRecords[patientIndex],
            ...data,
            status: data.status || serverData.patientRecords[patientIndex].status,
            appointmentRequestedAt: data.appointmentRequestedAt || serverData.patientRecords[patientIndex].appointmentRequestedAt,
          };
        } else {
          serverData.patientRecords.push(data);
        }
        break;

      case 'appointment':
        // Add appointment event
        serverData.appointments.push({
          ...data,
          timestamp: timestamp || new Date().toISOString(),
        });
        
        // Also update patient record status
        const appointmentPatientIndex = serverData.patientRecords.findIndex(
          (p) => p.patientId === data.patientId || p.id === data.patientId
        );
        if (appointmentPatientIndex >= 0) {
          serverData.patientRecords[appointmentPatientIndex].status = 'book_appointment';
          serverData.patientRecords[appointmentPatientIndex].appointmentRequestedAt = data.timestamp || new Date().toISOString();
        }
        break;

      case 'login':
        serverData.loginLogs.push({
          ...data,
          timestamp: timestamp || new Date().toISOString(),
        });
        break;

      case 'logout':
        serverData.logoutLogs.push({
          ...data,
          timestamp: timestamp || new Date().toISOString(),
        });
        break;

      case 'delete_patient':
        // Remove patient record
        serverData.patientRecords = serverData.patientRecords.filter(
          (p) => p.id !== data.patientId && p.patientId !== data.patientId
        );
        serverData.deleteLogs = serverData.deleteLogs || [];
        serverData.deleteLogs.push({
          type: 'patient',
          ...data,
          timestamp: timestamp || new Date().toISOString(),
        });
        break;

      case 'delete_doctor':
        // Remove doctor's patient records and QR codes
        serverData.patientRecords = serverData.patientRecords.filter(
          (p) => p.patientId !== data.doctorId
        );
        serverData.deleteLogs = serverData.deleteLogs || [];
        serverData.deleteLogs.push({
          type: 'doctor',
          ...data,
          timestamp: timestamp || new Date().toISOString(),
        });
        break;

      case 'delete_qrcode':
        serverData.deleteLogs = serverData.deleteLogs || [];
        serverData.deleteLogs.push({
          type: 'qrcode',
          ...data,
          timestamp: timestamp || new Date().toISOString(),
        });
        break;

      default:
        return res.status(400).json({ error: 'Unknown sync type' });
    }

    writeData(serverData);
    res.json({ success: true, message: `Synced ${type}` });
  } catch (error) {
    console.error('Error in sync endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patient records
app.get('/api/patient-records', (req, res) => {
  try {
    const serverData = readData();
    res.json({ records: serverData.patientRecords });
  } catch (error) {
    console.error('Error fetching patient records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointments
app.get('/api/appointments', (req, res) => {
  try {
    const serverData = readData();
    res.json({ appointments: serverData.appointments });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Sync Server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 Accessible from network at http://10.177.156.54:${PORT}`);
  console.log(`📁 Data file: ${DATA_FILE}`);
});

