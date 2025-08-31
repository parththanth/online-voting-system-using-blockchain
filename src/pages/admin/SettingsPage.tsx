
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Calendar, 
  Flag, 
  Trophy, 
  User, 
  Moon, 
  Sun, 
  Lock,
  Save
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getAdminToken } from "@/services/api";

// Animation variants
const containerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("election");
  
  // Election settings
  const [electionStart, setElectionStart] = useState<string>("");
  const [electionEnd, setElectionEnd] = useState<string>("");
  const [votesGoal, setVotesGoal] = useState<string>("5000");
  const [isActive, setIsActive] = useState<boolean>(false);
  
  // Security settings
  const [facialAuthEnabled, setFacialAuthEnabled] = useState<boolean>(true);
  const [otpVerificationEnabled, setOtpVerificationEnabled] = useState<boolean>(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  const [fraudDetectionEnabled, setFraudDetectionEnabled] = useState<boolean>(true);
  
  // Appearance settings
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(false);
  
  // Admin profile settings
  const [username, setUsername] = useState<string>("admin");
  const [email, setEmail] = useState<string>("admin@voteguard.io");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

// Load schedule and subscribe to realtime updates
useEffect(() => {
  const fetchSchedule = async () => {
    try {
      const token = getAdminToken();
      const url = "https://zjymowjrqidmgslauauv.supabase.co/functions/v1/admin-schedule";
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const json = await res.json();
      const schedule = (json as any)?.schedule;
      if (schedule) {
        setElectionStart(schedule.voting_start ? schedule.voting_start.slice(0, 16) : "");
        setElectionEnd(schedule.voting_end ? schedule.voting_end.slice(0, 16) : "");
        setIsActive(!!schedule.is_active);
      }
    } catch (e) {
      console.error("[Settings] fetchSchedule error", e);
    }
  };

  fetchSchedule();

  const channel = supabase
    .channel("realtime-voting-schedule-settings")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "voting_schedule" },
      () => {
        console.log("[Settings] Real-time schedule update");
        fetchSchedule();
      }
    )
    .subscribe();

  // Refresh every 15 seconds for real-time schedule updates
  const interval = setInterval(fetchSchedule, 15000);

  return () => {
    supabase.removeChannel(channel);
    clearInterval(interval);
  };
}, []);

  const handleSaveSettings = async (settingType: string) => {
    if (settingType === "election") {
      try {
        const token = getAdminToken();
        const url = "https://zjymowjrqidmgslauauv.supabase.co/functions/v1/admin-schedule";
        const res = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            votingStart: electionStart,
            votingEnd: electionEnd,
            isActive,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error((json as any)?.error || "Failed to update schedule");
        toast({ title: "Election schedule saved", description: "Schedule updated successfully." });
        return;
      } catch (e: any) {
        console.error("[Settings] save election error", e);
        toast({ title: "Save failed", description: e.message || "Unable to save schedule.", variant: "destructive" });
        return;
      }
    }

    // Default toast for other tabs
    toast({
      title: "Settings saved",
      description: `Your ${settingType} settings have been updated successfully.`,
    });
  };
  const handlePasswordChange = () => {
    // Simple validation
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, this would verify the current password and update to the new one
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });
    
    // Reset form
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariant} className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your election settings and preferences
            </p>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="election" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Election</span>
            </TabsTrigger>
            <TabsTrigger value="parties" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span>Parties</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="election">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Election Schedule</CardTitle>
                  <CardDescription>Set the start and end time for the election</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="election-start">Start Date and Time</Label>
                      <Input 
                        id="election-start" 
                        type="datetime-local" 
                        value={electionStart}
                        onChange={(e) => setElectionStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="election-end">End Date and Time</Label>
                      <Input 
                        id="election-end" 
                        type="datetime-local" 
                        value={electionEnd}
                        onChange={(e) => setElectionEnd(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Election Active</Label>
                      <p className="text-xs text-muted-foreground">Toggle to open/close voting</p>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="votes-goal">Votes Goal to Win</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="votes-goal" 
                        type="number" 
                        value={votesGoal}
                        onChange={(e) => setVotesGoal(e.target.value)}
                        className="max-w-[200px]"
                      />
                      <span className="text-sm text-muted-foreground">votes</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => handleSaveSettings('election')}
                  >
                    <Save className="h-4 w-4" />
                    Save Election Settings
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="parties">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Party Management</CardTitle>
                  <CardDescription>Add or edit parties participating in the election</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-center py-6 text-muted-foreground">
                      Party management interface coming soon
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="flex items-center gap-2"
                    disabled
                  >
                    <Save className="h-4 w-4" />
                    Save Party Settings
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Configure security options for the election</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Facial Authentication</Label>
                        <p className="text-xs text-muted-foreground">
                          Enable or disable facial recognition for voter verification
                        </p>
                      </div>
                      <Switch 
                        checked={facialAuthEnabled}
                        onCheckedChange={setFacialAuthEnabled}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>OTP Verification</Label>
                        <p className="text-xs text-muted-foreground">
                          Require one-time password verification during login
                        </p>
                      </div>
                      <Switch 
                        checked={otpVerificationEnabled}
                        onCheckedChange={setOtpVerificationEnabled}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication (Admin)</Label>
                        <p className="text-xs text-muted-foreground">
                          Require 2FA for admin panel access
                        </p>
                      </div>
                      <Switch 
                        checked={twoFactorEnabled}
                        onCheckedChange={setTwoFactorEnabled}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Fraud Detection Notifications</Label>
                        <p className="text-xs text-muted-foreground">
                          Receive alerts for suspicious voting activities
                        </p>
                      </div>
                      <Switch 
                        checked={fraudDetectionEnabled}
                        onCheckedChange={setFraudDetectionEnabled}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => handleSaveSettings('security')}
                  >
                    <Save className="h-4 w-4" />
                    Save Security Settings
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="profile">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 mb-6">
                <CardHeader>
                  <CardTitle>Admin Profile</CardTitle>
                  <CardDescription>Update your administrator profile information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => handleSaveSettings('profile')}
                  >
                    <Save className="h-4 w-4" />
                    Save Profile
                  </Button>
                </CardFooter>
              </Card>

              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your administrator password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input 
                        id="current-password" 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input 
                        id="new-password" 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input 
                        id="confirm-password" 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={handlePasswordChange}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    <Lock className="h-4 w-4" />
                    Update Password
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="appearance">
            <motion.div variants={itemVariant}>
              <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>Customize the appearance of the admin panel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {darkModeEnabled ? (
                          <Moon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Sun className="h-5 w-5 text-muted-foreground" />
                        )}
                        <Label>Dark Mode</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Toggle between light and dark themes
                      </p>
                    </div>
                    <Switch 
                      checked={darkModeEnabled}
                      onCheckedChange={setDarkModeEnabled}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => handleSaveSettings('appearance')}
                  >
                    <Save className="h-4 w-4" />
                    Save Appearance
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </AdminLayout>
  );
}
