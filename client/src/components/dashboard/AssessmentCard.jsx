import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, Calendar, FileText, User } from 'lucide-react';
import RiskBadge from '../ui/RiskBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function AssessmentCard({ assessment, onEdit, onDelete, showFarmerName = false }) {
  const farmerRef = assessment.farmerId || {};
  const userRef = farmerRef.userId || {};
  const farmerName = userRef.fullName || 'N/A';

  return (
    <div className="border border-border bg-card p-5 rounded-2xl shadow-sm space-y-4 flex flex-col text-foreground text-left transition-all hover:shadow-md">
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm leading-tight">
              Report #{assessment._id.substring(18)}
            </h4>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(assessment.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge status={assessment.assessmentStatus} />
      </div>

      {/* Farmer profile linkage (for admin list context) */}
      {showFarmerName && (
        <div className="p-3 bg-muted/30 border border-border rounded-xl flex items-center gap-2 text-xs">
          <User className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <div>
            <p className="font-bold text-foreground truncate max-w-[150px]">{farmerName}</p>
            <p className="text-muted-foreground text-[10px]">{farmerRef.farmName}</p>
          </div>
        </div>
      )}

      {/* Parameters */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="block text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Overall Risk</span>
          <RiskBadge risk={assessment.overallRisk} />
        </div>
        <div className="space-y-0.5">
          <span className="block text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Weather Risk</span>
          <span className="font-bold">{assessment.weatherRisk}%</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Crop Threat</span>
          <span className="font-bold">{assessment.cropRisk}%</span>
        </div>
        <div className="space-y-0.5">
          <span className="block text-muted-foreground uppercase text-[9px] font-bold tracking-wider">Financial Risk</span>
          <span className="font-bold">{assessment.financialRisk}%</span>
        </div>
      </div>

      {/* Advisory Snippet */}
      {assessment.summary && (
        <div className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-muted/20 p-2.5 rounded-xl border border-border/50">
          {assessment.summary}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2 mt-auto border-t border-border/50">
        <Link
          to={`/assessment/${assessment._id}`}
          className="flex-1 py-2 border border-border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <Eye className="w-4 h-4" /> Details
        </Link>
        <button
          onClick={() => onEdit(assessment._id)}
          className="p-2 border border-border rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          title="Edit Report"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(assessment._id)}
          className="p-2 border border-border hover:border-red-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 transition-all"
          title="Delete Report"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
