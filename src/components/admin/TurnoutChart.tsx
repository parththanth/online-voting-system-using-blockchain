
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DistrictTurnout } from "@/types/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TurnoutChartProps {
  data: DistrictTurnout[];
}

const TurnoutChart = ({ data }: TurnoutChartProps) => {
  // Format data for chart
  const chartData = data.map(district => ({
    name: district.district,
    turnout: district.turnout,
    votesCast: district.votesCast,
    totalVoters: district.totalVoters,
  }));
  
  const chartConfig = {
    turnout: {
      label: "Turnout %",
    },
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="w-full h-full"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">District Performance</h3>
        <Badge variant="outline" className="text-xs">Live Data</Badge>
      </div>
      <ChartContainer className="h-[240px]" config={chartConfig}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              height={40}
              angle={-35}
              textAnchor="end"
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 10 }} 
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend wrapperStyle={{ fontSize: 10, bottom: -10 }} />
            <Bar dataKey="turnout" name="Turnout %" fill="#8884d8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </motion.div>
  );
};

export default TurnoutChart;
