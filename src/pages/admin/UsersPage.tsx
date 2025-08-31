
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, UserCheck, UserX, Info } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useRealtimeUsers } from "@/hooks/admin/useRealtimeUsers";

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

export default function UsersPage() {
  const { users, loading } = useRealtimeUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Filter users based on search query and status filter
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(q) || user.voterId.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'verified':
        return <Badge className="bg-green-500/20 text-green-700 hover:bg-green-500/30">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30">Pending</Badge>;
      case 'flagged':
        return <Badge className="bg-red-500/20 text-red-700 hover:bg-red-500/30">Flagged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariant}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <motion.div variants={itemVariant} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Voter Management</h1>
            <p className="text-sm text-muted-foreground">View and manage registered voters</p>
          </div>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => console.log("Export users CSV")}>
            <Download size={16} />
            Export Data
          </Button>
        </motion.div>

        <motion.div variants={itemVariant}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Registered Voters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or voter ID..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-1">
                    <Filter size={16} />
                    <span className="hidden sm:inline">Filters</span>
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Voter ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : currentUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-6">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.voterId}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.lastActivity}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" title="Verify">
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Flag">
                              <UserX className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Details">
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink 
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / usersPerPage), prev + 1))}
                        className={currentPage === Math.ceil(filteredUsers.length / usersPerPage) ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
