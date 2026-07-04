import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, ShieldCheck } from 'lucide-react';
import RiskBadge from '../ui/RiskBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function AssessmentTimeline({ assessments = [] }) {
  if (assessments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No assessment records found.
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pl-6 border-l border-border text-foreground text-left">
      {assessments.map((a, idx) => {
        const dateStr = new Date(a.createdAt).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <div key={a._id} className="relative space-y-2">
            {/* Timeline bullet */}
            <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-card shadow-sm"></span>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                <Calendar className="w-3.5 h-3.5" />
                {dateStr}
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge risk={a.overallRisk} />
                <StatusBadge status={a.assessmentStatus} />
              </div>
            </div>

            <h4 className="font-extrabold text-sm hover:underline">
              <Link to={`/assessment/${a._id}`} className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                Assessment #{a._id.substring(18)}
              </Link>
            </h4>
            
            <p className="text-xs text-muted-foreground leading-relaxed pl-5">
              {a.summary}
            </p>
          </div>
        );
      })}
    </div>
  );
}
