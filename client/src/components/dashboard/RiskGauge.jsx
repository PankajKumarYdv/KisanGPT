import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function RiskGauge({ risk = 0 }) {
  const data = [
    { value: risk },
    { value: 100 - risk },
  ];

  const getRiskColor = (val) => {
    if (val < 35) return '#10b981'; // Green
    if (val < 65) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const color = getRiskColor(risk);
  const COLORS = [color, '#e2e8f0']; // Color vs Grey background

  return (
    <div className="flex flex-col items-center justify-center h-48 w-full relative text-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="80%"
            startAngle={180}
            endAngle={0}
            innerRadius="70%"
            outerRadius="95%"
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute bottom-4 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black leading-none">{risk}%</span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1.5">
          Composite Risk
        </span>
      </div>
    </div>
  );
}
