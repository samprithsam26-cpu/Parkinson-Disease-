import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PatientRecord, User } from '@/types/auth';
import { Brain, Users, Activity, Clock, LogOut, RefreshCw, Shield, UserCheck, Trash2, QrCode } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchPatientRecords, syncPatientRecord, syncDeletePatient, syncDeleteDoctor, syncDeleteQRCode } from '@/utils/serverSync';
import { getAllQRCodes, deleteQRCode } from '@/utils/qrCode';
import { DoctorQRCode } from '@/types/auth';
import Footer from '@/components/Footer';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [qrCodes, setQRCodes] = useState<DoctorQRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.userType !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
    
    // Refresh every 5 seconds to see real-time updates from other PCs
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    
    // Load patients - try server first, fallback to localStorage
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
    
    // Sync all records to server
    updatedRecords.forEach((record) => {
      syncPatientRecord(record).catch(console.error);
    });
    
    // Load doctors
    const allUsers = JSON.parse(localStorage.getItem('pd_users') || '[]');
    const doctorUsers = allUsers
      .filter((u: any) => u.userType === 'doctor')
      .map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        userType: u.userType,
        createdAt: u.createdAt,
      }));
    
    setDoctors(doctorUsers);
    
    // Load QR codes
    const allQRCodes = getAllQRCodes();
    setQRCodes(allQRCodes);
    
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

  const handleDeletePatient = async (patientId: string, patientName: string) => {
    try {
      console.log('Deleting patient:', patientId, patientName);
      
      // Remove from patient records - check both id and patientId fields
      const patientRecords = JSON.parse(localStorage.getItem('pd_patient_records') || '[]');
      const beforeCount = patientRecords.length;
      const updatedRecords = patientRecords.filter((p: any) => {
        const matches = p.id === patientId || p.patientId === patientId;
        if (matches) {
          console.log('Removing patient record:', p);
        }
        return !matches;
      });
      const afterCount = updatedRecords.length;
      console.log(`Patient records: ${beforeCount} -> ${afterCount}`);
      localStorage.setItem('pd_patient_records', JSON.stringify(updatedRecords));
      
      // Remove from users
      const users = JSON.parse(localStorage.getItem('pd_users') || '[]');
      const beforeUserCount = users.length;
      const updatedUsers = users.filter((u: any) => {
        const matches = u.id === patientId;
        if (matches) {
          console.log('Removing user:', u);
        }
        return !matches;
      });
      const afterUserCount = updatedUsers.length;
      console.log(`Users: ${beforeUserCount} -> ${afterUserCount}`);
      localStorage.setItem('pd_users', JSON.stringify(updatedUsers));
      
      // Sync delete to server
      await syncDeletePatient(patientId, patientName);
      
      // Reload data
      await loadData();
      
      toast({
        title: "Patient Deleted",
        description: `${patientName} has been removed from the system.`,
      });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast({
        title: "Error",
        description: "Failed to delete patient. Please check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    try {
      // Remove from users
      const users = JSON.parse(localStorage.getItem('pd_users') || '[]');
      const updatedUsers = users.filter((u: any) => u.id !== doctorId);
      localStorage.setItem('pd_users', JSON.stringify(updatedUsers));
      
      // Remove QR codes for this doctor
      const qrCodes = JSON.parse(localStorage.getItem('pd_doctor_qrcodes') || '[]');
      const updatedQRCodes = qrCodes.filter((qr: any) => qr.doctorId !== doctorId);
      localStorage.setItem('pd_doctor_qrcodes', JSON.stringify(updatedQRCodes));
      
      // Sync delete to server
      await syncDeleteDoctor(doctorId, doctorName);
      
      // Reload data
      loadData();
      
      toast({
        title: "Doctor Deleted",
        description: `${doctorName} has been removed from the system.`,
      });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast({
        title: "Error",
        description: "Failed to delete doctor.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQRCode = async (qrId: string) => {
    const qrCode = qrCodes.find(qr => qr.id === qrId);
    if (deleteQRCode(qrId)) {
      setQRCodes(qrCodes.filter(qr => qr.id !== qrId));
      
      // Sync delete to server
      if (qrCode) {
        await syncDeleteQRCode(qrId, qrCode.doctorName);
      }
      
      toast({
        title: "QR Code Deleted",
        description: "The QR code has been removed.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to delete QR code.",
        variant: "destructive",
      });
    }
  };

  if (user?.userType !== 'admin') {
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
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">PD DiagnoSys</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="mr-4 text-sm text-muted-foreground">
                {user?.name} (Admin)
              </div>
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
              <CardDescription>Total Doctors</CardDescription>
              <CardTitle className="text-3xl">{doctors.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Patients</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {patients.filter(p => p.status === 'available' || p.status === 'busy').length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Activity className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Analyses</CardDescription>
              <CardTitle className="text-3xl">
                {patients.reduce((sum, p) => sum + p.totalAnalyses, 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Brain className="h-8 w-8 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Patients and Doctors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>System Management</CardTitle>
                <CardDescription>Manage all patients and doctors in the system</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="patients" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="patients">Patients ({patients.length})</TabsTrigger>
                <TabsTrigger value="doctors">Doctors ({doctors.length})</TabsTrigger>
                <TabsTrigger value="qrcodes">QR Codes ({qrCodes.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="patients" className="mt-4">
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
                          <TableHead>Actions</TableHead>
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
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Patient</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {patient.patientName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeletePatient(patient.id, patient.patientName)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="doctors" className="mt-4">
                {doctors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No doctors registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead>Account Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {doctors.map((doctor) => (
                          <TableRow key={doctor.id}>
                            <TableCell className="font-medium">{doctor.name}</TableCell>
                            <TableCell>{doctor.email}</TableCell>
                            <TableCell>
                              <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(doctor.createdAt)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getTimeAgo(doctor.createdAt)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Doctor</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {doctor.name}? This will also delete all their QR codes. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="qrcodes" className="mt-4">
                {qrCodes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <QrCode className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No QR codes registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Doctor Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Session ID</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Last Sign-In</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {qrCodes.map((qr) => (
                          <TableRow key={qr.id}>
                            <TableCell className="font-medium">{qr.doctorName}</TableCell>
                            <TableCell>{qr.doctorEmail}</TableCell>
                            <TableCell className="font-mono text-xs">{qr.sessionId.substring(0, 20)}...</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(qr.createdAt)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getTimeAgo(qr.createdAt)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(qr.lastSignIn)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {getTimeAgo(qr.lastSignIn)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={qr.isActive ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500'}>
                                {qr.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this QR code for {qr.doctorName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteQRCode(qr.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;

