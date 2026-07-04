import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export default function RiskChart({ type = 'radar', assessment }) {
  if (!assessment) return null;

  const data = [
    { subject: 'Finance', value: assessment.financialRisk, fullMark: 100 },
    { subject: 'Weather', value: assessment.weatherRisk, fullMark: 100 },
    { subject: 'Crop', value: assessment.cropRisk, fullMark: 100 },
    { subject: 'Market', value: assessment.marketRisk, fullMark: 100 },
    { subject: 'Wellness', value: assessment.wellnessRisk, fullMark: 100 },
  ];

  if (type === 'bar') {
    return (
      <div className="h-64 w-full text-foreground">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            />
            <Bar dataKey="value" name="Risk level (%)" fill="#16a34a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-64 w-full text-foreground flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={9} />
          <Radar
            name="Risk Level"
            dataKey="value"
            stroke="#16a34a"
            fill="#10b981"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
