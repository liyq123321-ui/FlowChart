import React, { useState } from 'react';
import { 
  WorkItem, 
  Agent, 
  DepartmentInfo, 
  WorkItemStatus 
} from '../types/workflow';
import { 
  Plus, 
  Filter, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Zap, 
  ExternalLink 
} from 'lucide-react';

interface KanbanBoardViewProps {
  workItems: WorkItem[];
  agents: Agent[];
  departments: DepartmentInfo[];
  onOpenWorkItem: (item: WorkItem) => void;
  onUpdateStatus: (itemId: string, newStatus: WorkItemStatus) => void;
  onOpenNewMission: () => void;
}

interface ColumnDef {
  id: WorkItemStatus;
  title: string;
  badgeColor: string;
  iconName?: string;
}

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  workItems,
  agents,
  departments,
  onOpenWorkItem,
  onUpdateStatus,
  onOpenNewMission,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const columns: ColumnDef[] = [
    { id: 'backlog', title: '📋 需求待办 (Backlog)', badgeColor: 'bg-slate-700 text-slate-300' },
    { id: 'in_triage', title: '🔍 需求分拣与DAG (Triage)', badgeColor: 'bg-indigo-900/60 text-indigo-300' },
    { id: 'in_progress', title: '⚡ 智能研发执行 (In Progress)', badgeColor: 'bg-amber-900/60 text-amber-300' },
    { id: 'qa_testing', title: '🧪 自动化质检门禁 (QA & SAST)', badgeColor: 'bg-emerald-900/60 text-emerald-300' },
    { id: 'done', title: '🚀 交付就绪 / 已上线 (Done)', badgeColor: 'bg-emerald-800 text-emerald-100' },
  ];

  // Map other statuses into the 5 primary columns
  const mapStatusToColumn = (status: WorkItemStatus): WorkItemStatus => {
    if (status === 'decomposing') return 'in_triage';
    if (status === 'assigned' || status === 'code_review') return 'in_progress';
    if (status === 'staging') return 'qa_testing';
    return status;
  };

  const filteredItems = workItems.filter(item => {
    const matchesDept = selectedDept === 'all' || item.departmentId === selectedDept;
    const matchesSearch = !searchQuery || 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] text-slate-800 overflow-hidden select-none">
      
      {/* Top Filter & Toolbar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <span>Jira 敏捷工单看板</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-100">
              {filteredItems.length} Work Items
            </span>
          </h2>

          {/* Department Filter */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSelectedDept('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                selectedDept === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部部门
            </button>
            {departments.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDept(d.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedDept === d.id ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索工单..."
              className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 w-48 transition-colors"
            />
          </div>

          <button
            onClick={onOpenNewMission}
            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Plus size={14} />
            <span>新建工单</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4 bg-[#F8FAFC]">
        {columns.map(col => {
          const colItems = filteredItems.filter(item => mapStatusToColumn(item.status) === col.id);

          return (
            <div
              key={col.id}
              className="flex-1 min-w-[280px] max-w-[340px] bg-slate-100/70 border border-slate-200/90 rounded-2xl flex flex-col overflow-hidden shadow-xs"
            >
              {/* Column Header */}
              <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 truncate">
                  {col.title}
                </span>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  col.id === 'done' ? 'bg-emerald-100 text-emerald-800' :
                  col.id === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                  col.id === 'qa_testing' ? 'bg-purple-100 text-purple-800' :
                  col.id === 'in_triage' ? 'bg-indigo-100 text-indigo-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {colItems.length}
                </span>
              </div>

              {/* Items Card List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-300">
                {colItems.map(item => {
                  const agent = agents.find(a => a.id === item.assigneeId);
                  const dept = departments.find(d => d.id === item.departmentId);

                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenWorkItem(item)}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all duration-200 group space-y-2.5 shadow-2xs"
                    >
                      {/* Card Top Strip */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.type === 'epic' ? 'bg-purple-100 text-purple-700' :
                          item.type === 'feature' ? 'bg-sky-100 text-sky-700' :
                          item.type === 'qa_gate' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {item.id}
                        </span>

                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          item.priority === 'critical' ? 'text-red-700 bg-red-50 border border-red-200' :
                          item.priority === 'high' ? 'text-amber-700 bg-amber-50' :
                          'text-slate-500'
                        }`}>
                          {item.priority}
                        </span>
                      </div>

                      {/* Card Title */}
                      <h4 className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </h4>

                      {/* Story Points & Department */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                          {item.storyPoints} pts
                        </span>
                        <span
                          className="font-semibold truncate max-w-[120px]"
                          style={{ color: dept?.color }}
                        >
                          {dept?.name.split(' ')[0]}
                        </span>
                      </div>

                      {/* Card Footer: Assignee & Progress */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        {agent ? (
                          <div className="flex items-center gap-1.5 truncate">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                            />
                            <span className="text-[10px] text-slate-700 font-medium truncate">
                              {agent.name.split(' ')[0]}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400">未指派</div>
                        )}

                        <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700">
                          {item.progressPercent}%
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colItems.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-300 rounded-xl bg-white/40">
                    暂无工单
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
