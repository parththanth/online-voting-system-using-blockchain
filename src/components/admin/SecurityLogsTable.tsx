
import { useState } from "react";
import { SecurityLog } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SecurityLogsTableProps {
  logs: SecurityLog[];
}

const SecurityLogsTable = ({ logs }: SecurityLogsTableProps) => {
  const [sortBy, setSortBy] = useState<keyof SecurityLog>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const handleSort = (column: keyof SecurityLog) => {
    if (column === sortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };
  
  const getSeverityColor = (severity: SecurityLog["severity"]) => {
    switch (severity) {
      case "critical": return "bg-red-500 hover:bg-red-600";
      case "high": return "bg-orange-500 hover:bg-orange-600";
      case "medium": return "bg-yellow-500 hover:bg-yellow-600";
      case "low": return "bg-blue-500 hover:bg-blue-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  const getStatusColor = (status: SecurityLog["status"]) => {
    switch (status) {
      case "failed": return "bg-yellow-500 hover:bg-yellow-600";
      case "blocked": return "bg-red-500 hover:bg-red-600";
      case "warning": return "bg-orange-500 hover:bg-orange-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };
  
  const formattedLogs = [...logs].sort((a, b) => {
    if (sortBy === "timestamp") {
      return sortDirection === "asc"
        ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    
    if (a[sortBy] < b[sortBy]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortBy] > b[sortBy]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort("timestamp")}>
              Timestamp {sortBy === "timestamp" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("type")}>
              Type {sortBy === "type" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Voter</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("severity")}>
              Severity {sortBy === "severity" && (sortDirection === "asc" ? "↑" : "↓")}
            </TableHead>
            <TableHead>Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {formattedLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono">
                {new Date(log.timestamp).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                {log.type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(log.status)}>
                  {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{log.voter} {log.voterID}</TableCell>
              <TableCell>{log.location}</TableCell>
              <TableCell>
                <Badge className={getSeverityColor(log.severity)}>
                  {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{log.description}</TableCell>
            </TableRow>
          ))}
          {formattedLogs.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4">
                No security logs available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SecurityLogsTable;
