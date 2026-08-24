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
  MoreHorizontal,
  Folder,
  Layers,
  SlidersHorizontal,
  Kanban as KanbanIcon,
  Workflow,
  XCircle,
  PlayCircle,
  HelpCircle,
  Maximize2,
  ChevronDown,
  ArrowRight,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { KanbanWorkflowModal } from './KanbanWorkflowModal';

interface KanbanBoardViewProps {
  workItems: WorkItem[];
  agents: Agent[];
  departments: DepartmentInfo[];
  onOpenWorkItem: (item: WorkItem) => void;
  onUpdateStatus: (itemId: string, newStatus: WorkItemStatus) => void;
  onOpenNewMission: () => void;
}

export type KanbanTabType = 'all' | 'members' | 'agents';

export interface SevenColumnDef {
  id: 'planning' | 'todo' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled';
  title: string;
  dotColor: string;
  dotBg: string;
  statuses: WorkItemStatus[];
  defaultStatus: WorkItemStatus;
}

export const SEVEN_COLUMNS: SevenColumnDef[] = [
  {
    id: 'planning',
    title: '待规划',
    dotColor: '#94A3B8',
    dotBg: 'bg-slate-400',
    statuses: ['backlog'],
    defaultStatus: 'backlog',
  },
  {
    id: 'todo',
    title: '待办',
    dotColor: '#CBD5E1',
    dotBg: 'bg-slate-300',
    statuses: ['ready', 'assignment_pending', 'in_triage', 'decomposing', 'assigned'],
    defaultStatus: 'ready',
  },
  {
    id: 'in_progress',
    title: '进行中',
    dotColor: '#F59E0B',
    dotBg: 'bg-amber-400',
    statuses: ['in_progress', 'claimed'],
    defaultStatus: 'in_progress',
  },
  {
    id: 'review',
    title: '审核中',
    dotColor: '#10B981',
    dotBg: 'bg-emerald-500',
    statuses: ['review_pending', 'in_review', 'code_review', 'qa_testing', 'qa_running', 'staging', 'acceptance_pending', 'changes_requested'],
    defaultStatus: 'review_pending',
  },
  {
    id: 'done',
    title: '已完成',
    dotColor: '#3B82F6',
    dotBg: 'bg-blue-500',
    statuses: ['done', 'accepted', 'ready_for_archive'],
    defaultStatus: 'done',
  },
  {
    id: 'blocked',
    title: '已阻塞',
    dotColor: '#EF4444',
    dotBg: 'bg-red-500',
    statuses: ['blocked', 'paused'],
    defaultStatus: 'blocked',
  },
  {
    id: 'cancelled',
    title: '已取消',
    dotColor: '#64748B',
    dotBg: 'bg-slate-500',
    statuses: ['cancelled', 'rejected', 'execution_failed'],
    defaultStatus: 'cancelled',
  },
];

export const KanbanBoardView: React.FC<KanbanBoardViewProps> = ({
  workItems,
  agents,
  departments,
  onOpenWorkItem,
  onUpdateStatus,
  onOpenNewMission,
}) => {
  const [activeTab, setActiveTab] = useState<KanbanTabType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState<boolean>(false);
  const [showQuickAddColumn, setShowQuickAddColumn] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState<string>('');

  // Active agents count
  const activeAgentsCount = agents.filter(a => a.status === 'active' || a.status === 'reviewing').length;

  // Filter items
  const filteredItems = workItems.filter(item => {
    // Tab filter
    if (activeTab === 'members') {
      // Human assigned
      if (item.assigneeId === 'unassigned') return false;
      const agent = agents.find(a => a.id === item.assigneeId);
      if (agent && !agent.isHuman) return false;
    } else if (activeTab === 'agents') {
      // AI Agent assigned
      const agent = agents.find(a => a.id === item.assigneeId);
      if (!agent || agent.isHuman) return false;
    }

    // Specific Agent filter
    if (selectedAgentFilter !== 'all' && item.assigneeId !== selectedAgentFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = item.id.toLowerCase().includes(q);
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchFolder = item.folderCategory?.toLowerCase().includes(q);
      return matchId || matchTitle || matchDesc || matchFolder;
    }

    return true;
  });

  // Map item to column
  const getColumnForWorkItem = (item: WorkItem): string => {
    for (const col of SEVEN_COLUMNS) {
      if (col.statuses.includes(item.status)) {
        return col.id;
      }
    }
    return 'planning';
  };

  // Render Priority Icon
  const renderPriorityIcon = (item: WorkItem) => {
    const iconType = item.priorityIconType || 
      (item.priority === 'critical' ? 'exclamation' : item.priority === 'high' ? 'signal' : 'dash');

    if (iconType === 'exclamation') {
      return (
        <span className="w-4 h-4 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-[10px] font-bold border border-red-500/30 flex-shrink-0" title="高危/最高优先级">
          !
        </span>
      );
    }

    if (iconType === 'signal') {
      return (
        <div className="flex items-end gap-0.5 h-3.5 w-3.5 px-0.5 py-0.5 bg-amber-500/10 rounded flex-shrink-0" title="高优先级">
          <span className="w-0.5 h-1.5 bg-amber-500 rounded-xs" />
          <span className="w-0.5 h-2.5 bg-amber-500 rounded-xs" />
          <span className="w-0.5 h-3 bg-amber-500 rounded-xs" />
        </div>
      );
    }

    // Default dash
    return (
      <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0" title="普通优先级">
        —
      </span>
    );
  };

  // Quick add item inside a column
  const handleQuickAdd = (col: SevenColumnDef) => {
    if (!quickTitle.trim()) return;
    const newId = `JULI-${Math.floor(10 + Math.random() * 90)}`;
    const newItem: WorkItem = {
      id: newId,
      title: quickTitle,
      description: `目标 快速创建事项：${quickTitle}`,
      type: 'task',
      status: col.defaultStatus,
      priority: 'medium',
      storyPoints: 3,
      departmentId: 'pm_office',
      assigneeId: 'unassigned',
      assigneeName: '未分配',
      folderCategory: 'multica 系统内核拆解',
      priorityIconType: 'dash',
      relativeTime: '更新于 刚刚',
      childIds: [],
      dependsOnIds: [],
      humanReviewRequired: false,
      progressPercent: 0,
      createdAt: '刚刚',
      updatedAt: '刚刚',
      metrics: {
        tokensUsed: 0,
        estimatedCostUsd: 0,
        executionTimeSeconds: 0,
        codeLinesGenerated: 0,
        testCasesPassed: 0,
        testCasesTotal: 0,
      },
      logs: [],
    };
    onUpdateStatus(newId, col.defaultStatus);
    workItems.push(newItem);
    setQuickTitle('');
    setShowQuickAddColumn(null);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0F1115] text-slate-100 overflow-hidden select-none font-sans">
      
      {/* 1. Multica Jira Dark Top Navigation Header */}
      <div className="px-5 py-3 bg-[#14171D] border-b border-[#222733] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        
        {/* Left: Task Title & Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">任务</span>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-[#1C2029] border border-[#2B3140] rounded-lg p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'all'
                  ? 'bg-[#2A303F] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'members'
                  ? 'bg-[#2A303F] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              成员
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'agents'
                  ? 'bg-[#2A303F] text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              智能体
            </button>
            <button
              onClick={() => setSelectedAgentFilter(prev => prev === 'all' ? 'agent_pm_master' : 'all')}
              className={`p-1 hover:bg-[#2A303F] rounded-md transition-colors ${
                selectedAgentFilter !== 'all' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="切换聚焦 Mika / PM 智能体"
            >
              <Layers size={14} />
            </button>
          </div>
        </div>

        {/* Right: Actions, Agent Pulse Badge & Workflow Trigger */}
        <div className="flex items-center gap-2.5">
          
          {/* Working Agent Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2029] border border-[#2B3140] text-xs font-medium text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono">{activeAgentsCount}</span>
            <span>个智能体工作中</span>
          </div>

          {/* Search Box */}
          <div className="relative hidden md:block">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索工单标题 / ID..."
              className="bg-[#181C24] border border-[#2B3140] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44 transition-colors"
            />
          </div>

          {/* Filter Button */}
          <button className="px-2.5 py-1.5 bg-[#1C2029] hover:bg-[#262C38] border border-[#2B3140] text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
            <Filter size={13} className="text-slate-400" />
            <span>筛选</span>
          </button>

          {/* Display View Toggle */}
          <button className="px-2.5 py-1.5 bg-[#1C2029] hover:bg-[#262C38] border border-[#2B3140] text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
            <SlidersHorizontal size={13} className="text-slate-400" />
            <span>显示</span>
          </button>

          {/* Board View Button */}
          <button className="px-2.5 py-1.5 bg-[#1C2029] text-white border border-[#2B3140] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
            <KanbanIcon size={13} className="text-indigo-400" />
            <span>看板</span>
          </button>

          {/* ⭐ WORKFLOW DIAGRAM EXPAND BUTTON */}
          <button
            onClick={() => setIsWorkflowModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:text-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 group"
            title="展开 Jira 工单全生命周期状态机工作流图谱"
          >
            <Workflow size={14} className="text-indigo-400 group-hover:rotate-45 transition-transform" />
            <span>工作流状态机图谱</span>
            <span className="text-[10px] bg-indigo-500/40 text-indigo-200 px-1.5 py-0.2 rounded font-mono">
              Workflow
            </span>
          </button>

          {/* New Work Item Button */}
          <button
            onClick={onOpenNewMission}
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center shadow-sm transition-all active:scale-95"
            title="新建工单"
          >
            <Plus size={15} />
          </button>
        </div>

      </div>

      {/* 2. Seven Columns Kanban Grid */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-3.5 bg-[#0F1115] scrollbar-thin scrollbar-thumb-[#252A36]">
        {SEVEN_COLUMNS.map(col => {
          const colItems = filteredItems.filter(item => getColumnForWorkItem(item) === col.id);
          const isQuickAdding = showQuickAddColumn === col.id;

          return (
            <div
              key={col.id}
              className="flex-1 min-w-[290px] max-w-[330px] bg-[#14171D] border border-[#222733] rounded-2xl flex flex-col overflow-hidden shadow-sm"
            >
              {/* Column Header */}
              <div className="px-3.5 py-3 border-b border-[#202532] flex items-center justify-between bg-[#161A22]">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full ring-2 ring-black/40 flex-shrink-0"
                    style={{ backgroundColor: col.dotColor }}
                  />
                  <span className="text-xs font-bold text-slate-200">
                    {col.title}
                  </span>
                  <span className="text-xs text-slate-400 font-mono font-semibold">
                    {colItems.length}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-slate-400">
                  <button 
                    onClick={() => {
                      setShowQuickAddColumn(isQuickAdding ? null : col.id);
                      setQuickTitle('');
                    }}
                    className="p-1 hover:text-white hover:bg-[#232936] rounded transition-colors"
                    title="在此列快速添加任务"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    className="p-1 hover:text-white hover:bg-[#232936] rounded transition-colors"
                    title="更多选项"
                  >
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              </div>

              {/* Quick Add Inline Box */}
              {isQuickAdding && (
                <div className="p-3 bg-[#1C202B] border-b border-[#282F3F] space-y-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={e => setQuickTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleQuickAdd(col);
                      if (e.key === 'Escape') setShowQuickAddColumn(null);
                    }}
                    placeholder="输入工单标题后回车..."
                    autoFocus
                    className="w-full bg-[#121419] border border-[#333A4D] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => setShowQuickAddColumn(null)}
                      className="px-2 py-1 text-slate-400 hover:text-white rounded"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handleQuickAdd(col)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium"
                    >
                      创建
                    </button>
                  </div>
                </div>
              )}

              {/* Items Card List Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-[#252A36]">
                {colItems.map(item => {
                  const agent = agents.find(a => a.id === item.assigneeId);
                  const isMika = item.assigneeName === 'Mika' || (!item.assigneeName && agent?.role === 'orchestrator');

                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenWorkItem(item)}
                      className="p-3.5 rounded-xl bg-[#1A1D24] border border-[#282C37] hover:border-indigo-500/50 hover:bg-[#20242E] cursor-pointer transition-all duration-150 space-y-2.5 shadow-2xs group"
                    >
                      {/* 1. Top Strip: Priority Icon + Work Item ID + Queue Tag */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {renderPriorityIcon(item)}
                          <span className="text-[11px] font-mono font-bold text-slate-300">
                            {item.id}
                          </span>
                        </div>

                        {item.queueStatusTag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#262C38] text-slate-300 border border-[#373F50] font-medium">
                            {item.queueStatusTag}
                          </span>
                        )}
                      </div>

                      {/* 2. Work Item Main Title */}
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                        {item.title}
                      </h4>

                      {/* 3. Description / Target Subtitle */}
                      {item.description && (
                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* 4. Folder / Category Tag */}
                      {item.folderCategory && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#24271F] border border-[#443F24]/50 text-[#EAB308] text-[10px] font-medium truncate max-w-full">
                            <Folder size={11} className="text-[#EAB308] flex-shrink-0" />
                            <span className="truncate">{item.folderCategory}</span>
                          </div>
                        </div>
                      )}

                      {/* 5. Subtask / Runtime Indicators (e.g. 1245591919 + 1/3) */}
                      {(item.subtaskIndicator || item.subtaskProgress) && (
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-[#14171E] px-2 py-1 rounded-md border border-[#252B38]">
                          {item.subtaskIndicator && (
                            <div className="flex items-center gap-1 text-slate-300">
                              <span className="w-3.5 h-3.5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[9px] font-bold">
                                1
                              </span>
                              <span>{item.subtaskIndicator}</span>
                            </div>
                          )}
                          {item.subtaskProgress && (
                            <div className="flex items-center gap-1 text-slate-400 ml-auto">
                              <span className="w-2.5 h-2.5 rounded-full border border-slate-500 border-t-transparent animate-spin" />
                              <span>{item.subtaskProgress}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* 6. Card Bottom: Assignee & Relative Time */}
                      <div className="pt-2 border-t border-[#252A36] flex items-center justify-between text-[11px]">
                        {/* Assignee display */}
                        <div className="flex items-center gap-1.5 truncate max-w-[140px]">
                          {isMika ? (
                            <div className="flex items-center gap-1 text-slate-200 font-medium truncate">
                              <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                                🦄
                              </span>
                              <span className="truncate">Mika</span>
                            </div>
                          ) : agent && item.assigneeId !== 'unassigned' ? (
                            <div className="flex items-center gap-1 text-slate-200 font-medium truncate">
                              <img
                                src={agent.avatar}
                                alt={agent.name}
                                className="w-4 h-4 rounded-full object-cover ring-1 ring-slate-600"
                              />
                              <span className="truncate">{agent.name.split(' ')[0]}</span>
                            </div>
                          ) : (
                            <div className="text-slate-500 text-[10px]">未分配</div>
                          )}
                        </div>

                        {/* Relative update time */}
                        <div className="text-[10px] text-slate-500 font-mono truncate">
                          {item.relativeTime || item.updatedAt}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty State matching design snapshot */}
                {colItems.length === 0 && (
                  <div className="h-48 flex flex-col items-center justify-center text-center text-slate-500 text-xs border border-dashed border-[#262C38] rounded-xl bg-[#111318]/50">
                    <span>无任务</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Interactive Modal for Full Mermaid Workflow State Machine */}
      <KanbanWorkflowModal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        workItems={workItems}
        onSelectWorkItem={item => {
          setIsWorkflowModalOpen(false);
          onOpenWorkItem(item);
        }}
      />

    </div>
  );
};
