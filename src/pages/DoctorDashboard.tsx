import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PatientRecord } from '@/types/auth';
import { Brain, Users, Activity, Clock, LogOut, RefreshCw, QrCode } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchPatientRecords, syncPatientRecord } from '@/utils/serverSync';
import Footer from '@/components/Footer';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.userType !== 'doctor' && user?.userType !== 'admin') {
      navigate('/');
      return;
    }
    loadPatients();
    
    // Refresh every 5 seconds to see real-time updates from other PCs
    const interval = setInterval(loadPatients, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const loadPatients = async () => {
    setIsLoading(true);
    
    // Try to fetch from server first, fallback to localStorage
    let patientRecords: PatientRecord[] = [];
    try {
      const serverRecords = await fetchPatientRecords();
      const localRecords = JSON.parse(localStorage.getItem('pd_patient_records') || '[]');
      
      if (serverRecords && serverRecords.length > 0) {
        // Merge server records with local records, prioritizing server data
        const merged = [...localRecords];
        serverRecords.forEach((serverRecord: any) => {
          const localIndex = merged.findIndex((r: any) => r.id === serverRecord.id || r.patientId === serverRecord.patientId);
          if (localIndex >= 0) {
            // Server data takes precedence, especially for status and appointment info
            merged[localIndex] = { 
              ...merged[localIndex], 
              ...serverRecord,
              status: serverRecord.status || merged[localIndex].status,
              appointmentRequestedAt: serverRecord.appointmentRequestedAt || merged[localIndex].appointmentRequestedAt,
            };
          } else {
            merged.push(serverRecord);
          }
        });
        patientRecords = merged;
        localStorage.setItem('pd_patient_records', JSON.stringify(merged));
      } else {
        // If server has no records, use local but still try to sync local to server
        patientRecords = localRecords;
        if (localRecords.length > 0) {
          // Sync all local records to server
          localRecords.forEach((record: PatientRecord) => {
            syncPatientRecord(record).catch(console.error);
          });
        }
      }
    } catch (error) {
      console.error('Error fetching from server, using localStorage:', error);
      patientRecords = JSON.parse(localStorage.getItem('pd_patient_records') || '[]');
    }
    
    // Update status based on last login (but preserve book_appointment status)
    const updatedRecords = patientRecords.map((record: PatientRecord) => {
      // Don't change status if it's book_appointment
      if (record.status === 'book_appointment') {
        return record;
      }
      
      const lastLogin = new Date(record.lastLogin);
      const now = new Date();
      const minutesSinceLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60);
      
      let status: 'available' | 'busy' | 'offline' | 'book_appointment' | 'active' = record.status;
      
      if (minutesSinceLogin > 30) {
        status = 'offline';
      } else if (minutesSinceLogin <= 5) {
        status = 'active'; // Show as active if logged in within 5 minutes
      } else if (minutesSinceLogin <= 15) {
        status = 'available';
      } else {
        status = 'busy';
      }
      
      return { ...record, status };
    });
    
    setPatients(updatedRecords);
    localStorage.setItem('pd_patient_records', JSON.stringify(updatedRecords));
    
    // Sync all records to server (but don't wait, do it in background)
    updatedRecords.forEach((record) => {
      syncPatientRecord(record).catch((err) => {
        console.error('Failed to sync record:', err);
      });
    });
    
    setIsLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
      case 'available':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'busy':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Busy</Badge>;
      case 'offline':
        return <Badge variant="secondary">Offline</Badge>;
      case 'book_appointment':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Book Appointment</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const minutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (user?.userType !== 'doctor' && user?.userType !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Brain className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">PD DiagnoSys</h1>
                <p className="text-sm text-muted-foreground">Doctor Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="mr-4 text-sm text-muted-foreground">
                {user?.name} ({user?.userType === 'admin' ? 'Admin' : 'Doctor'})
              </div>
              <Button variant="outline" onClick={() => navigate('/doctor-qrcode')}>
                <QrCode className="h-4 w-4 mr-2" />
                My QR Codes
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Patients</CardDescription>
              <CardTitle className="text-3xl">{patients.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <Users className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Available</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {patients.filter(p => p.status === 'available').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Activity className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Busy</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">
                {patients.filter(p => p.status === 'busy').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Activity className="h-8 w-8 text-yellow-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Offline</CardDescription>
              <CardTitle className="text-3xl text-muted-foreground">
                {patients.filter(p => p.status === 'offline').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>View and monitor all registered patients</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadPatients} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No patients registered yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Total Analyses</TableHead>
                      <TableHead>Last Analysis</TableHead>
                      <TableHead>Appointment Request</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell className="font-medium">{patient.patientName}</TableCell>
                        <TableCell>{patient.patientEmail}</TableCell>
                        <TableCell>{getStatusBadge(patient.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(patient.lastLogin)}</span>
                            <span className="text-xs text-muted-foreground">
                              {getTimeAgo(patient.lastLogin)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{patient.totalAnalyses}</TableCell>
                        <TableCell>
                          {patient.lastAnalysis ? (
                            <div className="flex flex-col">
                              <span>{formatDate(patient.lastAnalysis)}</span>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(patient.lastAnalysis)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No analyses yet</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.appointmentRequestedAt ? (
                            <div className="flex flex-col">
                              <span>{formatDate(patient.appointmentRequestedAt)}</span>
                              <span className="text-xs text-muted-foreground">
                                {getTimeAgo(patient.appointmentRequestedAt)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorDashboard;

