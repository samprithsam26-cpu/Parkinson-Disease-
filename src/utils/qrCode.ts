import { DoctorQRCode } from '@/types/auth';
import QRCode from 'qrcode';

/**
 * Generate a unique session ID
 */
export const generateSessionId = (): string => {
  return `SESSION_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Generate a unique QR code string
 */
export const generateQRCodeString = (doctorId: string, sessionId: string): string => {
  return `PDDIAGNOSYS_DOCTOR_${doctorId}_${sessionId}`;
};

/**
 * Create a QR code for a doctor
 */
export const createDoctorQRCode = async (
  doctorId: string,
  doctorName: string,
  doctorEmail: string
): Promise<DoctorQRCode> => {
  const sessionId = generateSessionId();
  const qrCodeString = generateQRCodeString(doctorId, sessionId);
  const now = new Date().toISOString();

  const qrCodeData: DoctorQRCode = {
    id: `QR_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    doctorId,
    doctorName,
    doctorEmail,
    qrCode: qrCodeString,
    sessionId,
    createdAt: now,
    lastSignIn: now,
    isActive: true,
  };

  // Store in localStorage
  const qrCodes = JSON.parse(localStorage.getItem('pd_doctor_qrcodes') || '[]');
  qrCodes.push(qrCodeData);
  localStorage.setItem('pd_doctor_qrcodes', JSON.stringify(qrCodes));

  return qrCodeData;
};

/**
 * Generate QR code image data URL
 */
export const generateQRCodeImage = async (qrCodeString: string): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(qrCodeString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Get QR codes for a doctor
 */
export const getDoctorQRCodes = (doctorId: string): DoctorQRCode[] => {
  const qrCodes = JSON.parse(localStorage.getItem('pd_doctor_qrcodes') || '[]');
  return qrCodes.filter((qr: DoctorQRCode) => qr.doctorId === doctorId);
};

/**
 * Get all QR codes (for admin)
 */
export const getAllQRCodes = (): DoctorQRCode[] => {
  return JSON.parse(localStorage.getItem('pd_doctor_qrcodes') || '[]');
};

/**
 * Delete a QR code
 */
export const deleteQRCode = (qrCodeId: string): boolean => {
  try {
    const qrCodes = JSON.parse(localStorage.getItem('pd_doctor_qrcodes') || '[]');
    const updated = qrCodes.filter((qr: DoctorQRCode) => qr.id !== qrCodeId);
    localStorage.setItem('pd_doctor_qrcodes', JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Error deleting QR code:', error);
    return false;
  }
};

/**
 * Update QR code last sign-in
 */
export const updateQRCodeSignIn = (qrCodeId: string): void => {
  try {
    const qrCodes = JSON.parse(localStorage.getItem('pd_doctor_qrcodes') || '[]');
    const updated = qrCodes.map((qr: DoctorQRCode) => {
      if (qr.id === qrCodeId) {
        return { ...qr, lastSignIn: new Date().toISOString(), isActive: true };
      }
      return qr;
    });
    localStorage.setItem('pd_doctor_qrcodes', JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating QR code sign-in:', error);
  }
};

/**
 * Parse QR code string to extract doctor info
 */
export const parseQRCodeString = (qrCodeString: string): { doctorId: string; sessionId: string } | null => {
  try {
    const match = qrCodeString.match(/PDDIAGNOSYS_DOCTOR_([^_]+)_(.+)/);
    if (match) {
      return {
        doctorId: match[1],
        sessionId: match[2],
      };
    }
    return null;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
};

