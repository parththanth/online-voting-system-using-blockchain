
import { SidebarProvider } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminSidebar from "./AdminSidebar";
import { Toaster } from "@/components/ui/toaster";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 w-full">
      <div className="w-full"> {/* Removed left padding to fix logo position */}
        <Header />
      </div>
      
      <div className="flex-1 pt-20"> {/* Keep existing padding-top */}
        <SidebarProvider>
          <div className="flex w-full">
            <AdminSidebar />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </div>
      
      <Footer />
      <Toaster />
    </div>
  );
}
