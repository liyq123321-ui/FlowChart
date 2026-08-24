import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Sparkles, 
  Bot, 
  Layers, 
  FileText, 
  ShieldCheck, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  Terminal,
  Kanban,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';

import { 
  PageNode, 
  FlowNode, 
  FlowEdge, 
  WorkItem, 
  Agent, 
  DepartmentInfo, 
  SubWorkflowSpec,
  WorkItemStatus 
} from './types/workflow';

import { 
  DEPARTMENTS, 
  AGENTS, 
  INITIAL_FLOW_NODES, 
  INITIAL_FLOW_EDGES, 
  INITIAL_WORK_ITEMS, 
  INITIAL_PAGES, 
  SUB_WORKFLOW_SPECS 
} from './data/initialData';

import { ALL_DRAWIO_DIAGRAMS } from './data/diagramData';
import { FigmaSidebar } from './components/FigmaSidebar';
import { FlowCanvas } from './components/FlowCanvas';
import { SubFlowModal } from './components/SubFlowModal';
import { WorkItemDetailModal } from './components/WorkItemDetailModal';
import { KanbanBoardView } from './components/KanbanBoardView';
import { AgentSwarmView } from './components/AgentSwarmView';
import { WorkBreakdownView } from './components/WorkBreakdownView';
import { MetricsAnalyticsView } from './components/MetricsAnalyticsView';
import { RequirementInputModal } from './components/RequirementInputModal';
import { DynamicIcon } from './components/DynamicIcon';

export default function App() {
  // Navigation State
  const [pages] = useState<PageNode[]>(INITIAL_PAGES);
  const [activePageId, setActivePageId] = useState<string>('page_overview_canvas');
  const [activeDiagramId, setActiveDiagramId] = useState<string>('root_workflow');

  // Workflow Data State
  const [workItems, setWorkItems] = useState<WorkItem[]>(INITIAL_WORK_ITEMS);
  const [agents, setAgents] = useState<Agent[]>(AGENTS);
  const [departments] = useState<DepartmentInfo[]>(DEPARTMENTS);

  // Modals & Active Drilldown
  const [activeNodeId, setActiveNodeId] = useState<string | null>('pm');
  const [selectedSubWorkflow, setSelectedSubWorkflow] = useState<SubWorkflowSpec | null>(null);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);

  // Simulation Engine State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simSpeed, setSimSpeed] = useState<1 | 2 | 5>(1);
  const [liveAgentLog, setLiveAgentLog] = useState<string>(
    '🚀 [Nova PM Orchestrator] 正在协调 10 个专业 Agent 推进企业级全流程架构...'
  );

  const simulationTimerRef = useRef<any>(null);

  // Simulation Engine Loop
  useEffect(() => {
    if (!isSimulating) {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
      return;
    }

    const intervalTime = Math.max(1400 / simSpeed, 400);

    simulationTimerRef.current = setInterval(() => {
      // Update simulation log messages
      const msgs = [
        '🔍 [Nova PM Master] 解析业务需求语义，向量化召回历史技术 ADR 架构记录...',
        '📋 [Apex Decomposer] 拆解 Epic -> Story -> Task，构建有向无环拓扑任务图(DAG)...',
        '⚡ [Capability Matcher] 执行硬约束筛选与多维评分，为任务绑定最佳 Agent 与沙箱容器...',
        '💻 [Titan Backend Architect] 生成 OpenAPI 3.1 协议契约与 Drizzle ORM 数据模型...',
        '🎨 [Prism UI/UX Lead] 输出 Tailwind 设计变量与 React 19 响应式交互状态机...',
        '🛡️ [Aegis Security Auditor] 执行 OWASP Top 10 SAST 扫描与边界用例自动化验证...',
        '🚀 [Orbit DevOps Center] 执行 CI/CD 自动化构建，零宕机灰度发布完成！'
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLiveAgentLog(randomMsg);

      // Update work items progress
      setWorkItems(prevItems =>
        prevItems.map(item => {
          if (item.status === 'in_progress') {
            const newProgress = Math.min(100, item.progressPercent + 10);
            return {
              ...item,
              progressPercent: newProgress,
              status: newProgress >= 100 ? 'done' : 'in_progress',
              metrics: {
                ...item.metrics,
                tokensUsed: item.metrics.tokensUsed + 8000,
                codeLinesGenerated: item.metrics.codeLinesGenerated + 25,
              },
            };
          }
          return item;
        })
      );
    }, intervalTime);

    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [isSimulating, simSpeed]);

  // Reset Simulation
  const handleResetSimulation = () => {
    setIsSimulating(false);
    setWorkItems(INITIAL_WORK_ITEMS);
    setActiveNodeId('pm');
    setLiveAgentLog('🔄 工作流状态已重置，等待人类项目经理发布指令。');
  };

  // Select node in canvas
  const handleSelectNode = (node: FlowNode) => {
    setActiveNodeId(node.id);
    if (node.subWorkflowId && SUB_WORKFLOW_SPECS[node.subWorkflowId]) {
      setSelectedSubWorkflow(SUB_WORKFLOW_SPECS[node.subWorkflowId]);
    }
  };

  // Select page from sidebar
  const handleSelectPage = (pageId: string, subflowNodeId?: string) => {
    setActivePageId(pageId);
    
    // Map page IDs to drawio diagrams
    if (pageId === 'page_overview_canvas') {
      setActiveDiagramId('root_workflow');
    } else if (pageId === 'page_phase0_detail') {
      setActivePageId('page_overview_canvas');
      setActiveDiagramId('phase0_detail');
    } else if (pageId === 'page_phase1_detail') {
      setActivePageId('page_overview_canvas');
      setActiveDiagramId('phase1_detail');
    } else if (pageId === 'page_phase2_detail') {
      setActivePageId('page_overview_canvas');
      setActiveDiagramId('phase2_detail');
    } else if (pageId === 'page_phase3_detail') {
      setActivePageId('page_overview_canvas');
      setActiveDiagramId('phase3_detail');
    } else if (pageId === 'page_phase4_detail') {
      setActivePageId('page_overview_canvas');
      setActiveDiagramId('phase4_detail');
    } else if (subflowNodeId && ALL_DRAWIO_DIAGRAMS[subflowNodeId]) {
      setActivePageId('page_overview_canvas');
      setActiveDiagramId(subflowNodeId);
    }
  };

  // Work Item Status update
  const handleUpdateWorkItemStatus = (itemId: string, newStatus: WorkItemStatus) => {
    setWorkItems(prev =>
      prev.map(w => (w.id === itemId ? { ...w, status: newStatus, updatedAt: '刚刚' } : w))
    );
    if (selectedWorkItem && selectedWorkItem.id === itemId) {
      setSelectedWorkItem(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Human approval toggle
  const handleToggleHumanApproval = (itemId: string) => {
    setWorkItems(prev =>
      prev.map(w =>
        w.id === itemId
          ? {
              ...w,
              humanApproved: !w.humanApproved,
              status: !w.humanApproved ? 'done' : 'in_progress',
            }
          : w
      )
    );
    if (selectedWorkItem && selectedWorkItem.id === itemId) {
      setSelectedWorkItem(prev =>
        prev
          ? {
              ...prev,
              humanApproved: !prev.humanApproved,
              status: !prev.humanApproved ? 'done' : 'in_progress',
            }
          : null
      );
    }
  };

  // Publish new mission
  const handlePublishMission = (title: string, description: string, scenarioId: string) => {
    const newEpicId = `EPIC-0${workItems.filter(w => w.type === 'epic').length + 1}`;
    const newEpic: WorkItem = {
      id: newEpicId,
      title,
      description,
      type: 'epic',
      status: 'in_progress',
      priority: 'critical',
      storyPoints: 18,
      departmentId: 'pm_office',
      assigneeId: 'agent_pm_master',
      childIds: [],
      dependsOnIds: [],
      humanReviewRequired: true,
      humanApproved: false,
      progressPercent: 25,
      createdAt: '刚刚',
      updatedAt: '刚刚',
      metrics: {
        tokensUsed: 120000,
        estimatedCostUsd: 0.35,
        executionTimeSeconds: 4,
        codeLinesGenerated: 280,
        testCasesPassed: 12,
        testCasesTotal: 12,
      },
      flowNodeId: 'node_pm_ingest',
      subWorkflowId: 'sub_pm_ingestion',
      logs: [
        {
          id: `log_init_${Date.now()}`,
          timestamp: '刚刚',
          agentId: 'agent_pm_master',
          agentName: 'Nova PM Orchestrator',
          agentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          phase: 'Mission Ingested',
          message: `人类项目经理已发布新工程任务: [${title}]。AI PM 调度大脑已完成需求语义向量提取与算力槽位加锁。`,
        },
      ],
    };

    setWorkItems(prev => [newEpic, ...prev]);
    setIsSimulating(true);
    setLiveAgentLog(`🚀 已发布新任务: ${title}，正在分发至各部门 Agent 执行...`);
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  // Title for current view
  const currentDiagramInfo = ALL_DRAWIO_DIAGRAMS[activeDiagramId] || ALL_DRAWIO_DIAGRAMS['root_workflow'];

  return (
    <div className="flex h-screen w-screen bg-[#F3F4F6] text-slate-800 overflow-hidden font-sans antialiased select-none">
      
      {/* 1. Draw.io / Figma Style Hierarchical Left Sidebar */}
      <FigmaSidebar
        pages={pages}
        activePageId={activePageId}
        onSelectPage={handleSelectPage}
        workItems={workItems}
        onSelectWorkItem={item => setSelectedWorkItem(item)}
        onOpenNewMissionModal={() => setIsRequirementModalOpen(true)}
      />

      {/* 2. Main Content & Draw.io Canvas Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header & Live Agent Thought Streamer */}
        <div className="h-14 bg-white border-b border-slate-200 px-5 flex items-center justify-between gap-4 z-20 flex-shrink-0 shadow-xs">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs truncate">
            <span className="text-slate-400 font-medium">Multica Engine</span>
            <ChevronRight size={13} className="text-slate-300" />
            <span className="text-slate-500 font-medium">Draw.io Architecture</span>
            <ChevronRight size={13} className="text-slate-300" />
            <span className="text-indigo-600 font-bold truncate flex items-center gap-1.5">
              {activePageId === 'page_overview_canvas' 
                ? currentDiagramInfo.titleZh 
                : pages.find(p => p.id === activePageId)?.title || '工作空间'}
            </span>
          </div>

          {/* Live Agent Thought Ticker */}
          <div className="hidden lg:flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-full max-w-xl truncate text-xs shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <Terminal size={13} className="text-indigo-600 flex-shrink-0" />
            <span className="font-mono text-[11px] text-slate-700 truncate">
              {liveAgentLog}
            </span>
          </div>

          {/* Simulation Controls & Speed Toggles */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {/* Speed Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs font-mono">
              {([1, 2, 5] as const).map(speed => (
                <button
                  key={speed}
                  onClick={() => setSimSpeed(speed)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    simSpeed === speed ? 'bg-indigo-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isSimulating
                  ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {isSimulating ? <Pause size={13} /> : <Play size={13} />}
              <span>{isSimulating ? '暂停流转' : '启动模拟'}</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={handleResetSimulation}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white shadow-xs"
              title="重置工作流状态"
            >
              <RotateCcw size={14} />
            </button>

            {/* Publish Mission Button */}
            <button
              onClick={() => setIsRequirementModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>发布任务</span>
            </button>
          </div>
        </div>

        {/* View Switcher based on Active Page */}
        <div className="flex-1 relative overflow-hidden bg-[#F9FAFB]">
          {activePageId === 'page_overview_canvas' && (
            <FlowCanvas
              activeDiagramId={activeDiagramId}
              onChangeDiagram={diagId => setActiveDiagramId(diagId)}
              agents={agents}
              departments={departments}
              workItems={workItems}
              activeNodeId={activeNodeId}
              onSelectNode={handleSelectNode}
              onOpenWorkItem={item => setSelectedWorkItem(item)}
              isSimulating={isSimulating}
              onToggleSimulation={() => setIsSimulating(!isSimulating)}
              onOpenNewMissionModal={() => setIsRequirementModalOpen(true)}
            />
          )}

          {activePageId === 'page_jira_kanban' && (
            <KanbanBoardView
              workItems={workItems}
              agents={agents}
              departments={departments}
              onOpenWorkItem={item => setSelectedWorkItem(item)}
              onUpdateStatus={handleUpdateWorkItemStatus}
              onOpenNewMission={() => setIsRequirementModalOpen(true)}
            />
          )}

          {activePageId === 'page_agent_swarm' && (
            <AgentSwarmView
              agents={agents}
              departments={departments}
            />
          )}

          {activePageId === 'page_work_items_tree' && (
            <WorkBreakdownView
              workItems={workItems}
              agents={agents}
              departments={departments}
              onOpenWorkItem={item => setSelectedWorkItem(item)}
            />
          )}

          {activePageId === 'page_analytics' && (
            <MetricsAnalyticsView
              workItems={workItems}
              agents={agents}
              departments={departments}
            />
          )}
        </div>
      </div>

      {/* 3. Sub-Workflow Detail Modal */}
      {selectedSubWorkflow && (
        <SubFlowModal
          subWorkflow={selectedSubWorkflow}
          onClose={() => setSelectedSubWorkflow(null)}
          agents={agents}
          departments={departments}
          onOpenWorkItem={item => setSelectedWorkItem(item)}
        />
      )}

      {/* 4. Work Item Jira-grade Detail Modal */}
      {selectedWorkItem && (
        <WorkItemDetailModal
          workItem={selectedWorkItem}
          onClose={() => setSelectedWorkItem(null)}
          agents={agents}
          departments={departments}
          onUpdateStatus={handleUpdateWorkItemStatus}
          onToggleHumanApproval={handleToggleHumanApproval}
        />
      )}

      {/* 5. Requirement / Mission Ingestion Modal */}
      {isRequirementModalOpen && (
        <RequirementInputModal
          onClose={() => setIsRequirementModalOpen(false)}
          onSubmit={handlePublishMission}
        />
      )}
    </div>
  );
}
