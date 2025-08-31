import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Search, Users, CheckCircle, XCircle, Trash2, RefreshCw, AlertTriangle, Shield, Camera } from 'lucide-react';
import SimpleFaceEnrollment from '@/components/SimpleFaceEnrollment';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { faceEnrollmentService } from '@/services/faceEnrollmentService';
import { authService } from '@/services/authService';
import { getAdminToken } from '@/services/api';
import AdminLayout from '@/components/admin/AdminLayout';
interface User {
  id: string;
  email?: string;
  phone_number?: string;
  face_verified: boolean;
  created_at: string;
  role: string;
}
interface FaceEnrollmentData {
  id: string;
  user_id: string;
  enrollment_date: string;
  enrolled_by?: string;
  is_active: boolean;
  confidence_threshold: number;
}
const FaceEnrollmentManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<FaceEnrollmentData[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [showSelfEnrollment, setShowSelfEnrollment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentAdminUser, setCurrentAdminUser] = useState<User | null>(null);
  const [justEnrolled, setJustEnrolled] = useState(false);

  const fetchAllData = async () => {
    try {
      const token = getAdminToken();
      const { data: result, error } = await supabase.functions.invoke('admin-face-data', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (error) throw error;
      setUsers((result as any)?.users || []);
      setEnrollments((result as any)?.enrollments || []);
    } catch (error) {
      console.error('Error fetching admin face data:', error);
      toast.error('Failed to fetch admin face data');
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Starting data load...');
      setLoading(true);
      await fetchAllData();

      // Get current admin user using OTP-based authentication
      console.log('🔄 Loading current admin user...');
      try {
        // Check if user is admin using OTP-based auth
        const isAdmin = authService.isAdmin();
        const userPhone = localStorage.getItem('userPhone');
        
        console.log('🔍 Auth check - isAdmin:', isAdmin, 'userPhone:', userPhone);
        
        if (isAdmin && userPhone) {
          console.log('✅ User authenticated via OTP, fetching from users table...');
          const {
            data: currentUser,
            error
          } = await supabase.from('users').select('*').eq('phone_number', userPhone).maybeSingle();
          console.log('📊 Current user from DB:', currentUser, 'DB Error:', error);
          
          if (currentUser && !error) {
            setCurrentAdminUser(currentUser);
            console.log('✅ Admin user set successfully:', currentUser);
          } else {
            console.log('⚠️ User not found in DB, creating minimal admin user...');
            // If user doesn't exist in users table, create a minimal admin user object
            const adminUser: User = {
              id: `admin-${userPhone}`, // Use phone as unique identifier
              email: undefined,
              phone_number: userPhone,
              face_verified: false,
              created_at: new Date().toISOString(),
              role: 'admin'
            };
            setCurrentAdminUser(adminUser);
            console.log('✅ Created minimal admin user:', adminUser);
          }
        } else {
          console.log('❌ No authenticated user found');
        }
      } catch (error) {
        console.error('❌ Error loading admin user:', error);
      }
      setLoading(false);
      console.log('✅ Data load complete');
    };
    loadData();

// Set up realtime subscriptions for comprehensive updates
const channel = supabase
  .channel('face-enrollment-realtime')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'users'
  }, payload => {
    console.log('Users table changed:', payload);
    fetchAllData();
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'face_enrollment'
  }, payload => {
    console.log('Face enrollment table changed:', payload);
    fetchAllData();
  })
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'face_verification_attempts'
  }, payload => {
    console.log('Face verification attempts changed:', payload);
    fetchAllData();
  })
  .subscribe();

// Refresh every 4 seconds for real-time enrollment monitoring
const interval = setInterval(fetchAllData, 4000);

return () => {
  supabase.removeChannel(channel);
  clearInterval(interval);
};
  }, []);
  const handleEnrollmentSuccess = async (faceDescriptors: number[][]) => {
    if (!selectedUser) return;
    try {
      const result = await faceEnrollmentService.enrollFaceMultiple(
        selectedUser.id,
        faceDescriptors,
        'admin'
      );
      if (result.success) {
        toast.success('Face enrollment completed successfully!');
        setShowEnrollment(false);
        setSelectedUser(null);
        await refreshData();
        setJustEnrolled(true);
        setTimeout(() => setJustEnrolled(false), 4000);
      } else {
        toast.error(result.error || 'Failed to save face enrollment');
      }
    } catch (error) {
      console.error('Error saving face enrollment:', error);
      toast.error('Failed to save face enrollment');
    }
  };
  const handleSelfEnrollmentSuccess = async (faceDescriptors: number[][]) => {
    if (!currentAdminUser) return;
    try {
      const result = await faceEnrollmentService.enrollFaceMultiple(
        currentAdminUser.id,
        faceDescriptors,
        currentAdminUser.id
      );
      if (result.success) {
        toast.success('Your face has been enrolled successfully! You can now use facial authentication for voting.');
        setShowSelfEnrollment(false);
        // Update current admin user state
        setCurrentAdminUser({
          ...currentAdminUser,
          face_verified: true
        });
        await refreshData();
        setJustEnrolled(true);
        setTimeout(() => setJustEnrolled(false), 4000);
      } else {
        toast.error(result.error || 'Failed to enroll your face');
      }
    } catch (error) {
      console.error('Error enrolling admin face:', error);
      toast.error('Failed to enroll your face');
    }
  };
  const handleRemoveEnrollment = async (userId: string) => {
    try {
      const result = await faceEnrollmentService.removeFaceEnrollment(userId);
      if (result.success) {
        toast.success('Face enrollment removed successfully');
        // If removing own enrollment, update current admin user
        if (currentAdminUser && userId === currentAdminUser.id) {
          setCurrentAdminUser({
            ...currentAdminUser,
            face_verified: false
          });
        }
      } else {
        toast.error(result.error || 'Failed to remove face enrollment');
      }
    } catch (error) {
      console.error('Error removing face enrollment:', error);
      toast.error('Failed to remove face enrollment');
    }
  };
  const filteredUsers = users.filter(user => user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '' || user.phone_number?.includes(searchTerm) || '' || user.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const enrolledUsers = users.filter(user => user.face_verified);
  const unenrolledUsers = users.filter(user => !user.face_verified);
  if (loading) {
    return <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>
      </AdminLayout>;
  }
  if (showSelfEnrollment && currentAdminUser) {
    return <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Register Your Face
              </h2>
              <p className="text-muted-foreground">
                Set up facial authentication for secure voting access
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowSelfEnrollment(false)}>
              Cancel
            </Button>
          </div>

          <div className="max-w-md mx-auto">
            <SimpleFaceEnrollment userId={currentAdminUser.id} onSuccess={handleSelfEnrollmentSuccess} onSkip={() => setShowSelfEnrollment(false)} />
          </div>
        </div>
      </AdminLayout>;
  }
  if (showEnrollment && selectedUser) {
    return <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Face Enrollment</h2>
              <p className="text-muted-foreground">
                Enrolling face verification for: {selectedUser.email || selectedUser.phone_number}
              </p>
            </div>
            <Button variant="outline" onClick={() => {
            setShowEnrollment(false);
            setSelectedUser(null);
          }}>
              Cancel
            </Button>
          </div>

          <div className="max-w-md mx-auto">
            <SimpleFaceEnrollment userId={selectedUser.id} onSuccess={handleEnrollmentSuccess} onSkip={() => {
            setShowEnrollment(false);
            setSelectedUser(null);
          }} />
          </div>
        </div>
      </AdminLayout>;
  }
  return <AdminLayout>
      <div className="space-y-6">
        {justEnrolled && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2"
          >
            <div className="border border-green-200 rounded-xl p-3 bg-gradient-to-r from-green-50/80 to-emerald-50/80">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Enrollment confirmed</span>
              </div>
            </div>
          </motion.div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Face Enrollment Management</h2>
            <p className="text-muted-foreground">
              Manage face verification enrollment for users
            </p>
          </div>
          <Button onClick={refreshData} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Debug info */}
        

        {/* Self Registration Section */}
        {currentAdminUser && <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
            <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 rounded-full p-3">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      Your Face Registration
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {currentAdminUser.face_verified ? 'Your face is registered and ready for secure voting authentication' : 'Register your face to enable secure facial authentication for voting'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={currentAdminUser.face_verified ? "default" : "secondary"}>
                    {currentAdminUser.face_verified ? <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Registered
                      </> : <>
                        <Camera className="w-3 h-3 mr-1" />
                        Not Registered
                      </>}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button onClick={() => setShowSelfEnrollment(true)} variant={currentAdminUser.face_verified ? "outline" : "default"} className="flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      {currentAdminUser.face_verified ? 'Re-register Face' : 'Register My Face'}
                    </Button>
                    {currentAdminUser.face_verified && <Button variant="destructive" size="sm" onClick={() => handleRemoveEnrollment(currentAdminUser.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Face Enrolled</p>
                <p className="text-2xl font-bold">{enrolledUsers.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Not Enrolled</p>
                <p className="text-2xl font-bold">{unenrolledUsers.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Users</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="search" placeholder="Search by email, phone, or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Users ({filteredUsers.length})</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled ({enrolledUsers.length})</TabsTrigger>
            <TabsTrigger value="unenrolled">Not Enrolled ({unenrolledUsers.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <UsersList users={filteredUsers} onEnroll={user => {
            setSelectedUser(user);
            setShowEnrollment(true);
          }} onRemoveEnrollment={handleRemoveEnrollment} />
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <UsersList users={enrolledUsers.filter(user => user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '' || user.phone_number?.includes(searchTerm) || '' || user.id.toLowerCase().includes(searchTerm.toLowerCase()))} onEnroll={user => {
            setSelectedUser(user);
            setShowEnrollment(true);
          }} onRemoveEnrollment={handleRemoveEnrollment} />
          </TabsContent>

          <TabsContent value="unenrolled" className="space-y-4">
            <UsersList users={unenrolledUsers.filter(user => user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '' || user.phone_number?.includes(searchTerm) || '' || user.id.toLowerCase().includes(searchTerm.toLowerCase()))} onEnroll={user => {
            setSelectedUser(user);
            setShowEnrollment(true);
          }} onRemoveEnrollment={handleRemoveEnrollment} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>;
};
interface UsersListProps {
  users: User[];
  onEnroll: (user: User) => void;
  onRemoveEnrollment: (userId: string) => void;
}
const UsersList: React.FC<UsersListProps> = ({
  users,
  onEnroll,
  onRemoveEnrollment
}) => {
  if (users.length === 0) {
    return <Card className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground">Try adjusting your search criteria</p>
      </Card>;
  }
  return <div className="space-y-3">
      {users.map(user => <motion.div key={user.id} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.2
    }}>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium">
                      {user.email || user.phone_number || 'Unknown User'}
                    </p>
                    <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: {user.role} | Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge variant={user.face_verified ? "default" : "secondary"}>
                  {user.face_verified ? <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Enrolled
                    </> : <>
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Enrolled
                    </>}
                </Badge>

                <div className="flex space-x-2">
                  <Button size="sm" variant={user.face_verified ? "outline" : "default"} onClick={() => onEnroll(user)}>
                    <UserPlus className="w-4 h-4 mr-1" />
                    {user.face_verified ? 'Re-enroll' : 'Enroll'}
                  </Button>

                  {user.face_verified && <Button size="sm" variant="destructive" onClick={() => onRemoveEnrollment(user.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>)}
    </div>;
};
export default FaceEnrollmentManagement;