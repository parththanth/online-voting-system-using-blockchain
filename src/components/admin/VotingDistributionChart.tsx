
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";
import { PartyVoteStats } from "@/types/api";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface VotingDistributionChartProps {
  data: PartyVoteStats[];
}

const VotingDistributionChart = ({ data }: VotingDistributionChartProps) => {
  // Map party IDs to short names and colors
  const partyMap = {
    "PTY-001": { short: "INC", color: "#0078D7", full: "Indian National Congress" },
    "PTY-002": { short: "BJP", color: "#FF9933", full: "Bharatiya Janata Party" },
    "PTY-003": { short: "AAP", color: "#019934", full: "Aam Aadmi Party" },
    "PTY-005": { short: "NOTA", color: "#6B7280", full: "None Of The Above" }
  };
  
  // Format data for chart, filtering out NF party
  const chartData = data
    .filter(party => party.partyId !== "PTY-004") // Filter out NF party
    .map((party) => {
    const partyInfo = partyMap[party.partyId as keyof typeof partyMap] || { 
      short: party.partyName?.substring(0, 3) || "UNK", 
      color: "#8884d8",
      full: party.partyName || "Unknown"
    };
    
    return {
      name: partyInfo.short,
      fullName: partyInfo.full,
      value: party.votes,
      percentage: party.percentage,
      fill: partyInfo.color,
    };
  });

  const chartConfig = {
    votes: {
      label: "Votes",
    },
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="w-full h-full"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Party Distribution</h3>
        <Badge variant="outline" className="text-xs">Live Results</Badge>
      </div>
      
      <ChartContainer className="h-[240px] overflow-hidden" config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 10, right: 30, bottom: 40, left: 30 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius={60}
              innerRadius={25}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              // Remove labels to prevent overflow - data will be shown in legend and tooltip
              label={false}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ 
                fontSize: '10px', 
                paddingTop: '8px',
                textAlign: 'center',
                maxWidth: '100%',
                overflow: 'hidden'
              }}
              formatter={(value: string, entry: any) => {
                const data = chartData.find(item => item.name === value);
                return (
                  <span style={{ color: entry.color, fontSize: '10px' }}>
                    {value}: {data?.percentage.toFixed(1)}%
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );
};

// Custom tooltip component to show party full names
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg p-2 rounded-md text-xs">
        <p className="font-medium">{data.fullName}</p>
        <p>Votes: <span className="font-mono">{data.value.toLocaleString()}</span></p>
        <p>Share: <span className="font-mono">{data.percentage.toFixed(2)}%</span></p>
      </div>
    );
  }
  return null;
};

export default VotingDistributionChart;
