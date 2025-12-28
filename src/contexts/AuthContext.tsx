import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserType } from '@/types/auth';
import { syncLogin, syncLogout, syncPatientRecord } from '@/utils/serverSync';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType: UserType) => Promise<boolean>;
  register: (email: string, password: string, name: string, userType: UserType) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('pd_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, userType: UserType): Promise<boolean> => {
    // Simulate API call - in production, this would be a real API
    const users = JSON.parse(localStorage.getItem('pd_users') || '[]');
    
    // Special admin login (works with admin userType or when using admin credentials)
    if ((userType === 'admin' || email === 'admin@pddiagnosys.com') && 
        email === 'admin@pddiagnosys.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-001',
        email: 'admin@pddiagnosys.com',
        name: 'System Administrator',
        userType: 'admin',
        createdAt: new Date().toISOString(),
      };
      setUser(adminUser);
      localStorage.setItem('pd_user', JSON.stringify(adminUser));
      
      // Sync admin login to server
      syncLogin({
        userId: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        userType: adminUser.userType,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
      
      return true;
    }
    
    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password && u.userType === userType
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        userType: foundUser.userType,
        createdAt: foundUser.createdAt,
      };
      setUser(userData);
      localStorage.setItem('pd_user', JSON.stringify(userData));
      
      // Sync login to server
      syncLogin({
        userId: userData.id,
        email: userData.email,
        name: userData.name,
        userType: userData.userType,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
      
      // Update patient record last login
      if (userType === 'patient') {
        const patientRecords = JSON.parse(localStorage.getItem('pd_patient_records') || '[]');
        const patientIndex = patientRecords.findIndex((p: any) => p.patientId === foundUser.id);
        if (patientIndex >= 0) {
          patientRecords[patientIndex].lastLogin = new Date().toISOString();
          patientRecords[patientIndex].status = 'available';
          localStorage.setItem('pd_patient_records', JSON.stringify(patientRecords));
          
          // Sync patient record to server
          syncPatientRecord(patientRecords[patientIndex]).catch(console.error);
        }
      }
      
      return true;
    }
    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    userType: UserType
  ): Promise<boolean> => {
    // Simulate API call - in production, this would be a real API
    const users = JSON.parse(localStorage.getItem('pd_users') || '[]');
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return false;
    }

    // Prevent registering as admin through UI
    if (userType === 'admin') {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In production, this should be hashed
      name,
      userType,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('pd_users', JSON.stringify(users));

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      userType: newUser.userType,
      createdAt: newUser.createdAt,
    };

    setUser(userData);
    localStorage.setItem('pd_user', JSON.stringify(userData));
    
    // Initialize patient record if patient
    if (userType === 'patient') {
      const patientRecords = JSON.parse(localStorage.getItem('pd_patient_records') || '[]');
      const newPatientRecord = {
        id: newUser.id,
        patientId: newUser.id,
        patientName: newUser.name,
        patientEmail: newUser.email,
        lastLogin: new Date().toISOString(),
        status: 'available' as const,
        totalAnalyses: 0,
      };
      patientRecords.push(newPatientRecord);
      localStorage.setItem('pd_patient_records', JSON.stringify(patientRecords));
      
      // Sync new patient record to server
      syncPatientRecord(newPatientRecord).catch(console.error);
    }
    
    // Generate QR code for doctors
    if (userType === 'doctor') {
      import('@/utils/qrCode').then(({ createDoctorQRCode }) => {
        createDoctorQRCode(newUser.id, newUser.name, newUser.email).catch(console.error);
      });
    }
    
    return true;
  };

  const logout = () => {
    const currentUser = user;
    setUser(null);
    localStorage.removeItem('pd_user');
    
    // Sync logout to server
    if (currentUser) {
      syncLogout({
        userId: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        userType: currentUser.userType,
        timestamp: new Date().toISOString(),
      }).catch(console.error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

