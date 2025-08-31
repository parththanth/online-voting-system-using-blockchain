
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import SecurityPage from "./pages/admin/SecurityPage";
import UsersPage from "./pages/admin/UsersPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import FaceEnrollmentPage from "./pages/admin/FaceEnrollmentPage";
import AdminRoute from "./components/AdminRoute";
import Voting from "./pages/Voting";
import Confirmation from "./pages/Confirmation";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/voting" element={<Voting />} />
          <Route path="/confirmation" element={<Confirmation />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/admin/security" element={<AdminRoute><SecurityPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
          <Route path="/admin/face-enrollment" element={<AdminRoute><FaceEnrollmentPage /></AdminRoute>} />
          <Route path="/admin/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
          <Route path="/admin/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><SettingsPage /></AdminRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
