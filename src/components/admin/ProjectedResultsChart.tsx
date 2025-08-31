
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, LabelList, Cell } from "recharts";
import { PartyVoteStats } from "@/types/api";
import { ChartContainer } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectedResultsChartProps {
  data: PartyVoteStats[];
}

const ProjectedResultsChart = ({ data = [] }: ProjectedResultsChartProps) => {
  // Map party IDs to short names and colors
  const partyMap = {
    "PTY-001": { short: "INC", color: "#0078D7", full: "Indian National Congress" },
    "PTY-002": { short: "BJP", color: "#FF9933", full: "Bharatiya Janata Party" },
    "PTY-003": { short: "AAP", color: "#019934", full: "Aam Aadmi Party" },
    "PTY-004": { short: "NF", color: "#F4511E", full: "National Front" },
    "PTY-005": { short: "NOTA", color: "#6B7280", full: "None Of The Above" }
  };

  // Calculate winning threshold (assuming simple majority)
  const totalVotes = data.reduce((sum, party) => sum + party.votes, 0);
  const winningThreshold = Math.floor(totalVotes * 0.5) + 1;
  
  // Projected votes with random growth factor for simulation
  const projectedData = data.map(party => {
    const partyInfo = partyMap[party.partyId as keyof typeof partyMap] || {
      short: party.partyName?.substring(0, 3) || "UNK",
      color: "#8884d8",
      full: party.partyName || "Unknown"
    };
    
    // Random growth between 1.0 and 1.5 for projection
    const growthFactor = 1 + Math.random() * 0.5;
    const projectedVotes = Math.round(party.votes * growthFactor);
    
    return {
      name: partyInfo.short,
      fullName: partyInfo.full,
      current: party.votes,
      projected: projectedVotes,
      fill: partyInfo.color
    };
  }).sort((a, b) => b.projected - a.projected);
  
  // Find projected winner
  const projectedWinner = projectedData.length ? [...projectedData].sort((a, b) => b.projected - a.projected)[0] : undefined;
  
  // Chart configuration
  const chartConfig = {
    current: {
      label: "Current Votes",
    },
    projected: {
      label: "Projected Votes",
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="w-full h-full"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-muted-foreground">Projected Results</h3>
        </div>
        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
          Projected Winner: {projectedWinner?.name ?? "N/A"}
        </Badge>
      </div>

      <ChartContainer className="h-[240px]" config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={projectedData}
            layout="vertical"
            margin={{ top: 15, right: 30, left: 40, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} opacity={0.3} />
            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fontSize: 11 }} 
              tickLine={false} 
              axisLine={false} 
              width={30}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg p-2 rounded-md text-xs">
                      <p className="font-medium">{data.fullName}</p>
                      <p>Current: <span className="font-mono">{data.current.toLocaleString()}</span></p>
                      <p>Projected: <span className="font-mono">{data.projected.toLocaleString()}</span></p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine 
              x={winningThreshold} 
              stroke="#FF0000" 
              strokeDasharray="3 3" 
              label={{
                position: 'top',
                value: 'Winning Threshold',
                fill: '#FF0000',
                fontSize: 10
              }}
            />
            <Bar dataKey="current" name="Current Votes" fill="rgba(136, 132, 216, 0.4)" radius={[0, 0, 0, 0]}>
              <LabelList dataKey="current" position="right" fill="#666" fontSize={10} />
            </Bar>
            <Bar dataKey="projected" name="Projected Votes" radius={[0, 4, 4, 0]}>
              {projectedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList dataKey="projected" position="right" fill="#333" fontSize={10} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );
};

export default ProjectedResultsChart;
