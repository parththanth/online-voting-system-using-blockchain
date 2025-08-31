
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  UserCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number | string;
};

export default function AdminSidebar() {
  const location = useLocation();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Security", path: "/admin/security", icon: Shield },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Face Enrollment", path: "/admin/face-enrollment", icon: UserCheck },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Notifications", path: "/admin/notifications", icon: Bell, badge: 3 },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  const handleLogout = () => {
    authService.logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    window.location.href = "/";
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarContent className="px-2 pt-20"> {/* Added pt-20 for top padding */}
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive(item.path)}
                tooltip={collapsed ? item.name : undefined}
              >
                <Link to={item.path} className="flex items-center gap-2">
                  <item.icon className="h-5 w-5" />
                  {!collapsed && <span>{item.name}</span>}
                  {item.badge && (
                    <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={18} />
          <span className="font-medium">Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
