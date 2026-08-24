import React, { useState } from 'react';
import { 
  WorkItem, 
  Agent, 
  DepartmentInfo 
} from '../types/workflow';
import { 
  ChevronRight, 
  ChevronDown, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  UserCheck, 
  ExternalLink,
  Zap,
  Code2
} from 'lucide-react';

interface WorkBreakdownViewProps {
  workItems: WorkItem[];
  agents: Agent[];
  departments: DepartmentInfo[];
  onOpenWorkItem: (item: WorkItem) => void;
}

export const WorkBreakdownView: React.FC<WorkBreakdownViewProps> = ({
  workItems,
  agents,
  departments,
  onOpenWorkItem,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    'EPIC-01': true,
    'FEAT-101': true,
    'FEAT-102': true,
    'FEAT-103': true,
  });

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Group into tree
  const rootEpics = workItems.filter(w => w.type === 'epic');

  const renderWorkItemRow = (item: WorkItem, depth = 0) => {
    const isExpanded = !!expandedIds[item.id];
    const hasChildren = item.childIds.length > 0;
    const childItems = workItems.filter(w => item.childIds.includes(w.id));
    const agent = agents.find(a => a.id === item.assigneeId);
    const dept = departments.find(d => d.id === item.departmentId);

    return (
      <React.Fragment key={item.id}>
        <tr
          onClick={() => onOpenWorkItem(item)}
          className={`border-b border-slate-100 hover:bg-indigo-50/40 cursor-pointer transition-colors text-xs ${
            item.type === 'epic' ? 'bg-slate-50/90 font-bold text-slate-900' : item.type === 'feature' ? 'bg-white text-slate-800' : 'text-slate-700'
          }`}
        >
          {/* Key & Title Tree Column */}
          <td className="py-3 px-4">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren ? (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleExpand(item.id);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/50"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              ) : (
                <span className="w-5" />
              )}

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                item.type === 'epic' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                item.type === 'feature' ? 'bg-sky-100 text-sky-700' :
                item.type === 'qa_gate' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {item.id}
              </span>

              <span className="text-slate-800 font-medium truncate max-w-md">
                {item.title}
              </span>
            </div>
          </td>

          {/* Department */}
          <td className="py-3 px-3">
            <span
              className="text-[11px] font-semibold"
              style={{ color: dept?.color }}
            >
              {dept?.name.split(' ')[0]}
            </span>
          </td>

          {/* Assignee */}
          <td className="py-3 px-3">
            {agent ? (
              <div className="flex items-center gap-1.5 truncate">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="text-[11px] text-slate-700 font-medium truncate">
                  {agent.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <span className="text-slate-400 text-[11px]">-</span>
            )}
          </td>

          {/* Status */}
          <td className="py-3 px-3">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              item.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
              item.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-600'
            }`}>
              {item.status}
            </span>
          </td>

          {/* Story Points */}
          <td className="py-3 px-3 font-mono text-indigo-700 font-bold text-right">
            {item.storyPoints} pts
          </td>

          {/* Progress */}
          <td className="py-3 px-3">
            <div className="w-24 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${item.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-600 font-bold w-7 text-right">
                {item.progressPercent}%
              </span>
            </div>
          </td>

          {/* Tokens */}
          <td className="py-3 px-3 font-mono text-slate-600 text-right">
            {item.metrics.tokensUsed > 0 ? `${(item.metrics.tokensUsed / 1000).toFixed(0)}k` : '-'}
          </td>

          {/* Action */}
          <td className="py-3 px-3 text-right">
            <ExternalLink size={13} className="text-slate-400 hover:text-indigo-600 inline-block" />
          </td>
        </tr>

        {/* Render Children Recursively */}
        {hasChildren && isExpanded && childItems.map(c => renderWorkItemRow(c, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] text-slate-800 overflow-y-auto p-6 space-y-6 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-indigo-600" />
            <span>Work Breakdown Structure (WBS 全生命周期分解矩阵)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jira 敏捷架构：Epic (史诗) ➔ Feature (特性) ➔ Task (原子任务) ➔ Subtask (Agent执行体)
          </p>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">工单与拆分层级 (Key & Title)</th>
              <th className="py-3.5 px-3">所属部门</th>
              <th className="py-3.5 px-3">认领 Agent</th>
              <th className="py-3.5 px-3">生命周期状态</th>
              <th className="py-3.5 px-3 text-right">故事点</th>
              <th className="py-3.5 px-3">执行进度</th>
              <th className="py-3.5 px-3 text-right">Token 开销</th>
              <th className="py-3.5 px-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {rootEpics.map(epic => renderWorkItemRow(epic, 0))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
