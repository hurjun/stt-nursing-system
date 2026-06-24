import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

/** Minimal axis-less trend line for inline use inside cards and table cells. */
export function Sparkline({ data, color = '#0B6BCB', height = 36 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
