import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Trash2, ShieldCheck, FileText } from 'lucide-react';
import RiskBadge from '../ui/RiskBadge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';

export default function AssessmentTable({ assessments = [], onEdit, onDelete, showFarmerColumn = false }) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden shadow-sm bg-card text-foreground">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-left">
          <thead className="bg-muted/30">
            <tr>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Report ID</th>
              {showFarmerColumn && (
                <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Farmer</th>
              )}
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Risk Level</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Key Recommendation</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {assessments.map((a) => {
              const farmerRef = a.farmerId || {};
              const userRef = farmerRef.userId || {};
              const farmerName = userRef.fullName || 'N/A';

              return (
                <tr key={a._id} className="hover:bg-muted/10 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">
                    <Link to={`/assessment/${a._id}`} className="hover:underline flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      #{a._id.substring(18)}
                    </Link>
                  </td>
                  {showFarmerColumn && (
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-bold text-foreground">{farmerName}</div>
                      <div className="text-xs text-muted-foreground">{farmerRef.farmName}</div>
                    </td>
                  )}
                  <td className="whitespace-nowrap px-6 py-4">
                    <RiskBadge risk={a.overallRisk} />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <StatusBadge status={a.assessmentStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm max-w-xs truncate text-muted-foreground">
                    {a.recommendation}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground font-semibold">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/assessment/${a._id}`}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="View Report details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onEdit(a._id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Edit Report"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(a._id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-muted-foreground hover:text-red-600 transition-all"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
