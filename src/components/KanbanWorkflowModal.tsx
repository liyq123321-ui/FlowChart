import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Layers, 
  Play, 
  Clock, 
  Filter, 
  Workflow, 
  Activity, 
  ShieldCheck, 
  Terminal,
  GitBranch
} from 'lucide-react';
import { WorkItem } from '../types/workflow';

interface KanbanWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workItems: WorkItem[];
  onSelectWorkItem?: (item: WorkItem) => void;
}

interface WorkflowStateNode {
  id: string;
  name: string;
  nameZh: string;
  category: 'neutral' | 'decision' | 'ready' | 'active' | 'warning' | 'failure' | 'success';
  phase: string;
  phaseIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
  icon: string;
}

interface WorkflowTransitionEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: 'normal' | 'yes' | 'no' | 'warning' | 'fail' | 'rework' | 'success';
  description?: string;
}

const WORKFLOW_NODES: WorkflowStateNode[] = [
  // Phase 1: Ingestion & Triage
  {
    id: 'INIT',
    name: 'INITIALIZING_KANBAN',
    nameZh: '工单初始化建档',
    category: 'neutral',
    phase: '1. 需求初始化与分配排期',
    phaseIndex: 1,
    x: 80,
    y: 80,
    width: 220,
    height: 76,
    description: '需求摄取解析完成，在系统看板生成初始元数据工单',
    icon: 'Sparkles'
  },
  {
    id: 'HAS',
    name: 'Has Assignee?',
    nameZh: '是否有指定责任人/Agent？',
    category: 'decision',
    phase: '1. 需求初始化与分配排期',
    phaseIndex: 1,
    x: 370,
    y: 80,
    width: 200,
    height: 76,
    description: '条件判定：检查工单元数据中是否预先指定了智能体或责任工程师',
    icon: 'HelpCircle'
  },
  {
    id: 'ASSIGN',
    name: 'ASSIGNMENT_PENDING',
    nameZh: '待分发指派池',
    category: 'neutral',
    phase: '1. 需求初始化与分配排期',
    phaseIndex: 1,
    x: 370,
    y: 220,
    width: 200,
    height: 76,
    description: '尚未分配具体执行者，等待多智能体调度总线（Matcher）算力抢单或主管派发',
    icon: 'Clock'
  },
  {
    id: 'PLAN',
    name: 'Planned Now?',
    nameZh: '是否立即加入当前迭代？',
    category: 'decision',
    phase: '1. 需求初始化与分配排期',
    phaseIndex: 1,
    x: 640,
    y: 80,
    width: 200,
    height: 76,
    description: '条件判定：依据项目优先级与Sprint容量决定是否当前启动',
    icon: 'HelpCircle'
  },
  {
    id: 'BACKLOG',
    name: 'BACKLOG',
    nameZh: '需求待办沉淀池 (Backlog)',
    category: 'neutral',
    phase: '1. 需求初始化与分配排期',
    phaseIndex: 1,
    x: 640,
    y: 220,
    width: 200,
    height: 76,
    description: '暂不进入本次迭代，沉淀在产品待办池中等待排期召唤',
    icon: 'Layers'
  },
  {
    id: 'DEPS',
    name: 'Dependencies Satisfied?',
    nameZh: '前置依赖拓扑是否已满足？',
    category: 'decision',
    phase: '1. 需求初始化与分配排期',
    phaseIndex: 1,
    x: 910,
    y: 80,
    width: 210,
    height: 76,
    description: '条件判定：检查 DAG 上游依赖工单是否均已达到完成状态',
    icon: 'GitBranch'
  },

  // Phase 2: Ready & Execution Loop
  {
    id: 'BLOCKED',
    name: 'BLOCKED',
    nameZh: '依赖未满足 / 运行时阻塞',
    category: 'warning',
    phase: '2. 就绪排队与沙箱执行循环',
    phaseIndex: 2,
    x: 910,
    y: 220,
    width: 210,
    height: 76,
    description: '存在前置依赖未完成或运行时检测到外部阻塞（权限/网络/缺少API）',
    icon: 'AlertCircle'
  },
  {
    id: 'READY',
    name: 'READY',
    nameZh: '就绪待领单 (Ready for Execution)',
    category: 'ready',
    phase: '2. 就绪排队与沙箱执行循环',
    phaseIndex: 2,
    x: 1190,
    y: 80,
    width: 200,
    height: 76,
    description: '所有前置依赖与环境条件完备，进入可执行队列，等待智能体加锁认领',
    icon: 'CheckCircle2'
  },
  {
    id: 'CLAIMED',
    name: 'CLAIMED',
    nameZh: '智能体已认领 / 容器加锁',
    category: 'ready',
    phase: '2. 就绪排队与沙箱执行循环',
    phaseIndex: 2,
    x: 1460,
    y: 80,
    width: 200,
    height: 76,
    description: '指定 Agent 取得分布式租约加锁，准备初始化执行沙箱环境',
    icon: 'Terminal'
  },
  {
    id: 'PROGRESS',
    name: 'IN_PROGRESS',
    nameZh: '智能执行中 (ReAct Loop)',
    category: 'active',
    phase: '2. 就绪排队与沙箱执行循环',
    phaseIndex: 2,
    x: 1460,
    y: 220,
    width: 200,
    height: 76,
    description: '智能体进入 ReAct 思考与工具调用循环，进行代码编写与架构实现',
    icon: 'Activity'
  },
  {
    id: 'PAUSED',
    name: 'PAUSED',
    nameZh: '暂停挂起 (Paused)',
    category: 'warning',
    phase: '2. 就绪排队与沙箱执行循环',
    phaseIndex: 2,
    x: 1730,
    y: 150,
    width: 190,
    height: 76,
    description: '人为干预或 Token 限流保护触发，任务暂时挂起保持状态',
    icon: 'Clock'
  },
  {
    id: 'FAILED',
    name: 'EXECUTION_FAILED',
    nameZh: '执行失败熔断 (Failed)',
    category: 'failure',
    phase: '2. 就绪排队与沙箱执行循环',
    phaseIndex: 2,
    x: 1730,
    y: 290,
    width: 200,
    height: 76,
    description: '重试上限耗尽或遇到无法自愈的致命语法/环境异常',
    icon: 'AlertCircle'
  },
  {
    id: 'CANCELLED',
    name: 'CANCELLED',
    nameZh: '已取消废弃 (Cancelled)',
    category: 'failure',
    phase: '2. 就绪排队与沙箱执行循环',
    phaseIndex: 2,
    x: 1730,
    y: 430,
    width: 190,
    height: 76,
    description: '业务变更或决策判定不再执行，工单直接标记取消',
    icon: 'X'
  },

  // Phase 3: Review, QA & Acceptance Gate
  {
    id: 'SUBMITTED',
    name: 'RESULT_SUBMITTED',
    nameZh: '执行成果已提交待初验',
    category: 'neutral',
    phase: '3. 评审、质检与业务验收',
    phaseIndex: 3,
    x: 1460,
    y: 540,
    width: 210,
    height: 76,
    description: '智能体已生成全部代码与产物，提交至评审就绪通道',
    icon: 'Sparkles'
  },
  {
    id: 'REVIEW_PENDING',
    name: 'REVIEW_PENDING',
    nameZh: '等待评审人指派 (Review Pending)',
    category: 'active',
    phase: '3. 评审、质检与业务验收',
    phaseIndex: 3,
    x: 1190,
    y: 540,
    width: 210,
    height: 76,
    description: '进入待评审池，系统指派 Peer Reviewer 或人类架构师认领',
    icon: 'Clock'
  },
  {
    id: 'REVIEW',
    name: 'IN_REVIEW',
    nameZh: '人机协同评审中 (In Review)',
    category: 'active',
    phase: '3. 评审、质检与业务验收',
    phaseIndex: 3,
    x: 910,
    y: 540,
    width: 210,
    height: 76,
    description: '评审员正在对照 DoD 准则核验代码结构与架构合理性',
    icon: 'ShieldCheck'
  },
  {
    id: 'CHANGES',
    name: 'CHANGES_REQUESTED',
    nameZh: '评审/质检驳回 · 请求返工',
    category: 'warning',
    phase: '3. 评审、质检与业务验收',
    phaseIndex: 3,
    x: 910,
    y: 380,
    width: 210,
    height: 76,
    description: '评审未通过或自动化用例失败，携带 Diff 批注退回执行阶段返工',
    icon: 'RotateCcw'
  },
  {
    id: 'QA',
    name: 'QA_RUNNING',
    nameZh: '自动化与安全质检 (QA Running)',
    category: 'active',
    phase: '3. 评审、质检与业务验收',
    phaseIndex: 3,
    x: 640,
    y: 540,
    width: 210,
    height: 76,
    description: '触发 Playwright E2E、Vitest 单元测试以及 OWASP SAST 扫描',
    icon: 'ShieldCheck'
  },
  {
    id: 'ACCEPTANCE',
    name: 'ACCEPTANCE_PENDING',
    nameZh: '业务与主管最终验收 (Acceptance)',
    category: 'active',
    phase: '3. 评审、质检与业务验收',
    phaseIndex: 3,
    x: 370,
    y: 540,
    width: 210,
    height: 76,
    description: '进入产品总监/业务方最终功能验收与签名放行门禁',
    icon: 'ShieldCheck'
  },
  {
    id: 'REJECTED',
    name: 'REJECTED',
    nameZh: '业务验收彻底驳回 (Rejected)',
    category: 'failure',
    phase: '3. 评审、质检与业务验收',
    phaseIndex: 3,
    x: 370,
    y: 680,
    width: 200,
    height: 76,
    description: '严重偏离业务目标，无法通过返工修复，被业务方直接废弃',
    icon: 'X'
  },

  // Phase 4: Delivery & Archive
  {
    id: 'ACCEPTED',
    name: 'ACCEPTED',
    nameZh: '验收通过 · 已就绪 (Accepted)',
    category: 'success',
    phase: '4. 交付就绪与经验归档',
    phaseIndex: 4,
    x: 80,
    y: 540,
    width: 220,
    height: 76,
    description: '通过全部门禁验证，正式标记为 Accepted / Done，可随时上线发布',
    icon: 'CheckCircle2'
  },
  {
    id: 'ARCHIVE',
    name: 'READY_FOR_ARCHIVE',
    nameZh: '归档与智能体记忆沉淀 (Archive)',
    category: 'success',
    phase: '4. 交付就绪与经验归档',
    phaseIndex: 4,
    x: 80,
    y: 680,
    width: 220,
    height: 76,
    description: '提取执行过程中的优秀 Prompt、代码模版与错误教训，蒸馏入持久记忆库',
    icon: 'Sparkles'
  }
];

const WORKFLOW_EDGES: WorkflowTransitionEdge[] = [
  // 1. Ingestion branch
  { id: 'e1', from: 'INIT', to: 'HAS', label: 'Start', type: 'normal' },
  { id: 'e2', from: 'HAS', to: 'ASSIGN', label: 'No', type: 'no', description: '未指定负责人' },
  { id: 'e3', from: 'ASSIGN', to: 'PLAN', label: 'Assignment Completed', type: 'normal', description: '分配完成' },
  { id: 'e4', from: 'HAS', to: 'PLAN', label: 'Yes', type: 'yes', description: '已有责任人' },
  { id: 'e5', from: 'PLAN', to: 'BACKLOG', label: 'No', type: 'no', description: '暂不进入迭代' },
  { id: 'e6', from: 'BACKLOG', to: 'DEPS', label: 'Added to Plan', type: 'normal', description: '加入排期' },
  { id: 'e7', from: 'PLAN', to: 'DEPS', label: 'Yes', type: 'yes', description: '立即排期' },
  { id: 'e8', from: 'DEPS', to: 'BLOCKED', label: 'No', type: 'warning', description: '依赖未满足' },
  { id: 'e9', from: 'BLOCKED', to: 'READY', label: 'Dependency Satisfied', type: 'yes', description: '依赖解除' },
  { id: 'e10', from: 'DEPS', to: 'READY', label: 'Yes', type: 'yes', description: '依赖均完备' },

  // 2. Execution loop
  { id: 'e11', from: 'READY', to: 'CLAIMED', label: 'Agent Claimed', type: 'normal', description: '智能体领单' },
  { id: 'e12', from: 'CLAIMED', to: 'PROGRESS', label: 'Run Started', type: 'normal', description: '沙箱启动' },
  { id: 'e13', from: 'PROGRESS', to: 'PAUSED', label: 'Paused', type: 'warning', description: '人工暂停' },
  { id: 'e14', from: 'PAUSED', to: 'PROGRESS', label: 'Resumed', type: 'normal', description: '恢复执行' },
  { id: 'e15', from: 'PROGRESS', to: 'BLOCKED', label: 'Blocker Detected', type: 'warning', description: '发现外部阻塞' },
  { id: 'e16', from: 'BLOCKED', to: 'PROGRESS', label: 'Runtime Blocker Resolved', type: 'normal', description: '阻塞解除恢复' },
  { id: 'e17', from: 'PROGRESS', to: 'FAILED', label: 'Run Failed', type: 'fail', description: '执行失败' },
  { id: 'e18', from: 'FAILED', to: 'READY', label: 'Retry', type: 'normal', description: '重试领单' },
  { id: 'e19', from: 'FAILED', to: 'ASSIGN', label: 'Reassign', type: 'normal', description: '重新指派' },
  { id: 'e20', from: 'FAILED', to: 'CANCELLED', label: 'Cancel', type: 'fail', description: '废弃取消' },

  // 3. Review & QA
  { id: 'e21', from: 'PROGRESS', to: 'SUBMITTED', label: 'Result Submitted', type: 'normal', description: '提交成果' },
  { id: 'e22', from: 'SUBMITTED', to: 'REVIEW_PENDING', label: 'Submission Accepted', type: 'normal', description: '通过初验' },
  { id: 'e23', from: 'REVIEW_PENDING', to: 'REVIEW', label: 'Reviewer Claimed', type: 'normal', description: '评审员认领' },
  { id: 'e24', from: 'REVIEW', to: 'CHANGES', label: 'Changes Requested', type: 'rework', description: '请求修改' },
  { id: 'e25', from: 'CHANGES', to: 'PROGRESS', label: 'Rework Started', type: 'normal', description: '启动返工' },
  { id: 'e26', from: 'REVIEW', to: 'QA', label: 'Review Passed', type: 'yes', description: '代码评审通过' },
  { id: 'e27', from: 'QA', to: 'CHANGES', label: 'QA Failed', type: 'rework', description: '测试用例失败' },
  { id: 'e28', from: 'QA', to: 'ACCEPTANCE', label: 'QA Passed', type: 'yes', description: 'QA全部通过' },

  // 4. Acceptance & Archive
  { id: 'e29', from: 'ACCEPTANCE', to: 'CHANGES', label: 'Rework Requested', type: 'rework', description: '主管要求微调' },
  { id: 'e30', from: 'ACCEPTANCE', to: 'REJECTED', label: 'Rejected', type: 'fail', description: '业务彻底驳回' },
  { id: 'e31', from: 'ACCEPTANCE', to: 'ACCEPTED', label: 'Approved', type: 'success', description: '验收通过交付' },
  { id: 'e32', from: 'ACCEPTED', to: 'ARCHIVE', label: 'Archive Requested', type: 'success', description: '经验提取归档' }
];

export const KanbanWorkflowModal: React.FC<KanbanWorkflowModalProps> = ({
  isOpen,
  onClose,
  workItems,
  onSelectWorkItem
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('PROGRESS');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  // Map each state to matching work items count
  const getItemCountForNode = (nodeId: string): number => {
    return workItems.filter(item => {
      const s = item.status;
      if (nodeId === 'INIT' && (s === 'in_triage' || s === 'decomposing')) return true;
      if (nodeId === 'ASSIGN' && (s === 'assigned' || item.assigneeId === 'unassigned')) return true;
      if (nodeId === 'BACKLOG' && s === 'backlog') return true;
      if (nodeId === 'READY' && s === 'ready') return true;
      if (nodeId === 'CLAIMED' && s === 'claimed') return true;
      if (nodeId === 'PROGRESS' && s === 'in_progress') return true;
      if (nodeId === 'PAUSED' && s === 'paused') return true;
      if (nodeId === 'BLOCKED' && s === 'blocked') return true;
      if (nodeId === 'FAILED' && s === 'execution_failed') return true;
      if (nodeId === 'CANCELLED' && s === 'cancelled') return true;
      if (nodeId === 'REVIEW_PENDING' && (s === 'review_pending' || s === 'code_review')) return true;
      if (nodeId === 'REVIEW' && s === 'in_review') return true;
      if (nodeId === 'QA' && (s === 'qa_testing' || s === 'qa_running')) return true;
      if (nodeId === 'ACCEPTANCE' && (s === 'acceptance_pending' || s === 'staging')) return true;
      if (nodeId === 'CHANGES' && s === 'changes_requested') return true;
      if (nodeId === 'ACCEPTED' && (s === 'done' || s === 'accepted')) return true;
      if (nodeId === 'ARCHIVE' && s === 'ready_for_archive') return true;
      if (nodeId === 'REJECTED' && s === 'rejected') return true;
      return false;
    }).length;
  };

  const selectedNode = WORKFLOW_NODES.find(n => n.id === selectedNodeId);
  const selectedNodeItems = selectedNodeId ? workItems.filter(item => {
    const s = item.status;
    if (selectedNodeId === 'INIT' && (s === 'in_triage' || s === 'decomposing')) return true;
    if (selectedNodeId === 'ASSIGN' && (s === 'assigned' || item.assigneeId === 'unassigned')) return true;
    if (selectedNodeId === 'BACKLOG' && s === 'backlog') return true;
    if (selectedNodeId === 'READY' && s === 'ready') return true;
    if (selectedNodeId === 'CLAIMED' && s === 'claimed') return true;
    if (selectedNodeId === 'PROGRESS' && s === 'in_progress') return true;
    if (selectedNodeId === 'PAUSED' && s === 'paused') return true;
    if (selectedNodeId === 'BLOCKED' && s === 'blocked') return true;
    if (selectedNodeId === 'FAILED' && s === 'execution_failed') return true;
    if (selectedNodeId === 'CANCELLED' && s === 'cancelled') return true;
    if (selectedNodeId === 'REVIEW_PENDING' && (s === 'review_pending' || s === 'code_review')) return true;
    if (selectedNodeId === 'REVIEW' && s === 'in_review') return true;
    if (selectedNodeId === 'QA' && (s === 'qa_testing' || s === 'qa_running')) return true;
    if (selectedNodeId === 'ACCEPTANCE' && (s === 'acceptance_pending' || s === 'staging')) return true;
    if (selectedNodeId === 'CHANGES' && s === 'changes_requested') return true;
    if (selectedNodeId === 'ACCEPTED' && (s === 'done' || s === 'accepted')) return true;
    if (selectedNodeId === 'ARCHIVE' && s === 'ready_for_archive') return true;
    if (selectedNodeId === 'REJECTED' && s === 'rejected') return true;
    return false;
  }) : [];

  // Theme styling for node categories matching Mermaid specs
  const getNodeStyle = (category: string, isSelected: boolean) => {
    let base = 'transition-all duration-200 border cursor-pointer select-none rounded-xl p-3.5 shadow-sm ';
    if (isSelected) {
      base += 'ring-2 ring-indigo-500 shadow-lg scale-105 z-20 ';
    } else {
      base += 'hover:scale-[1.02] hover:shadow-md ';
    }

    switch (category) {
      case 'decision':
        return base + 'bg-[#F5F3FF] border-[#7C3AED]/50 text-[#4C1D95] dark:bg-[#251A3D] dark:border-[#8B5CF6] dark:text-purple-200';
      case 'ready':
        return base + 'bg-[#EFF6FF] border-[#2563EB]/50 text-[#1E3A8A] dark:bg-[#15233D] dark:border-[#3B82F6] dark:text-blue-200';
      case 'active':
        return base + 'bg-[#FFFBEB] border-[#D97706]/50 text-[#78350F] dark:bg-[#342410] dark:border-[#F59E0B] dark:text-amber-200';
      case 'warning':
        return base + 'bg-[#FFF7ED] border-[#EA580C]/50 text-[#7C2D12] dark:bg-[#381B10] dark:border-[#FB923C] dark:text-orange-200';
      case 'failure':
        return base + 'bg-[#FEF2F2] border-[#DC2626]/50 text-[#7F1D1D] dark:bg-[#361314] dark:border-[#EF4444] dark:text-red-200';
      case 'success':
        return base + 'bg-[#F0FDF4] border-[#16A34A]/50 text-[#14532D] dark:bg-[#0E2C18] dark:border-[#22C55E] dark:text-emerald-200';
      case 'neutral':
      default:
        return base + 'bg-[#F8FAFC] border-[#64748B]/40 text-[#1E293B] dark:bg-[#1E222B] dark:border-[#475569] dark:text-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[96vw] h-[92vh] bg-[#121418] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#181B22] border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Workflow size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Jira 工单全生命周期状态机图谱 (Work Item Workflow Engine)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  Mermaid 完整映射
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                覆盖初始化、多智能体指派、DAG依赖排期、ReAct沙箱执行、自动化QA质检、业务验收与记忆归档
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Zoom Controls */}
            <div className="flex items-center bg-[#202530] border border-slate-700/80 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                className="p-1.5 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white"
                title="缩小"
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-2 font-mono text-[11px] text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="p-1.5 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white"
                title="放大"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() => setZoomLevel(0.85)}
                className="p-1.5 hover:bg-slate-700/60 rounded text-slate-300 hover:text-white border-l border-slate-700 ml-0.5"
                title="重置缩放"
              >
                <RotateCcw size={13} />
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="hidden xl:flex items-center gap-1.5 bg-[#202530] border border-slate-700/80 rounded-lg p-1 text-xs">
              {[
                { id: 'all', label: '全部状态' },
                { id: 'active', label: '活跃执行' },
                { id: 'decision', label: '决策网关' },
                { id: 'warning', label: '阻塞/返工' },
                { id: 'success', label: '验收归档' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterCategory(f.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    filterCategory === f.id
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#202530] hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors border border-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Area: Left Diagram Canvas + Right Detail Inspector */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* 1. Interactive Visual Flowchart Canvas */}
          <div className="flex-1 overflow-auto bg-[#0E1013] relative p-8 select-none">
            
            {/* Background Canvas Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle, #384152 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* Scaled Visual Graph Container */}
            <div 
              className="relative transition-transform duration-150 origin-top-left"
              style={{
                width: 2000,
                height: 820,
                transform: `scale(${zoomLevel})`
              }}
            >
              {/* Phase Boundary Background Lanes */}
              <div className="absolute inset-0 grid grid-rows-2 gap-4 pointer-events-none opacity-40">
                <div className="border border-dashed border-indigo-500/20 rounded-2xl bg-indigo-950/10 p-3">
                  <span className="text-[11px] font-bold text-indigo-400/70 uppercase tracking-widest">
                    Lane A: 任务接入、分配决策与沙箱就绪 (Ingestion, Allocation & Sandbox)
                  </span>
                </div>
                <div className="border border-dashed border-emerald-500/20 rounded-2xl bg-emerald-950/10 p-3">
                  <span className="text-[11px] font-bold text-emerald-400/70 uppercase tracking-widest">
                    Lane B: 成果提交、多轮质检门禁与记忆归档 (QA Gates, Acceptance & Memory Distillation)
                  </span>
                </div>
              </div>

              {/* SVG Edges Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <marker id="arrow-normal" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#64748B" />
                  </marker>
                  <marker id="arrow-yes" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#22C55E" />
                  </marker>
                  <marker id="arrow-no" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#EF4444" />
                  </marker>
                  <marker id="arrow-rework" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#F59E0B" />
                  </marker>
                  <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#6366F1" />
                  </marker>
                </defs>

                {WORKFLOW_EDGES.map(edge => {
                  const fromNode = WORKFLOW_NODES.find(n => n.id === edge.from);
                  const toNode = WORKFLOW_NODES.find(n => n.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const startX = fromNode.x + fromNode.width / 2;
                  const startY = fromNode.y + fromNode.height / 2;
                  const endX = toNode.x + toNode.width / 2;
                  const endY = toNode.y + toNode.height / 2;

                  // Determine stroke color
                  let strokeColor = '#475569';
                  let markerId = 'arrow-normal';
                  let isDashed = false;

                  if (edge.type === 'yes' || edge.type === 'success') {
                    strokeColor = '#22C55E';
                    markerId = 'arrow-yes';
                  } else if (edge.type === 'no' || edge.type === 'fail') {
                    strokeColor = '#EF4444';
                    markerId = 'arrow-no';
                    isDashed = true;
                  } else if (edge.type === 'rework' || edge.type === 'warning') {
                    strokeColor = '#F59E0B';
                    markerId = 'arrow-rework';
                    isDashed = true;
                  }

                  // Midpoint for transition badge
                  const midX = (startX + endX) / 2;
                  const midY = (startY + endY) / 2;

                  return (
                    <g key={edge.id} className="transition-opacity duration-200">
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke={strokeColor}
                        strokeWidth={1.8}
                        strokeDasharray={isDashed ? '4,4' : undefined}
                        markerEnd={`url(#${markerId})`}
                        opacity={0.85}
                      />
                      {edge.label && (
                        <g transform={`translate(${midX}, ${midY})`}>
                          <rect
                            x={- (edge.label.length * 4.2 + 8)}
                            y={-10}
                            width={edge.label.length * 8.4 + 16}
                            height={20}
                            rx={6}
                            fill="#1E232D"
                            stroke={strokeColor}
                            strokeWidth={1}
                            opacity={0.95}
                          />
                          <text
                            x={0}
                            y={4}
                            textAnchor="middle"
                            fontSize={10}
                            fontWeight="bold"
                            fill="#E2E8F0"
                            className="font-mono pointer-events-none"
                          >
                            {edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Nodes Cards */}
              {WORKFLOW_NODES.map(node => {
                const count = getItemCountForNode(node.id);
                const isSelected = selectedNodeId === node.id;
                const isDimmed = filterCategory !== 'all' && node.category !== filterCategory;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    style={{
                      position: 'absolute',
                      left: node.x,
                      top: node.y,
                      width: node.width,
                      height: node.height
                    }}
                    className={`${getNodeStyle(node.category, isSelected)} ${
                      isDimmed ? 'opacity-30' : 'opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          node.category === 'decision' ? 'bg-purple-500' :
                          node.category === 'ready' ? 'bg-blue-500' :
                          node.category === 'active' ? 'bg-amber-500 animate-pulse' :
                          node.category === 'warning' ? 'bg-orange-500' :
                          node.category === 'failure' ? 'bg-red-500' :
                          node.category === 'success' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        <span className="font-mono text-[11px] font-bold tracking-tight truncate">
                          {node.name}
                        </span>
                      </div>

                      {/* Work Items Count Badge */}
                      {count > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-500 text-white shadow-xs">
                          {count}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-semibold truncate text-slate-200/90 flex items-center justify-between">
                      <span>{node.nameZh}</span>
                      <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-black/20 text-slate-400">
                        {node.category}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Right Side Status Inspector & Work Items Drilldown */}
          <div className="w-80 lg:w-96 bg-[#161920] border-l border-slate-800 flex flex-col overflow-hidden flex-shrink-0">
            {selectedNode ? (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Node Inspector Header */}
                <div className="p-4 bg-[#1C2029] border-b border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase border border-indigo-500/30">
                      {selectedNode.category} Node
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedNode.phase.split(' ')[0]}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white font-mono">
                    {selectedNode.name}
                  </h3>
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                    {selectedNode.nameZh}
                  </p>

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed bg-[#121418] p-2.5 rounded-lg border border-slate-800/80">
                    {selectedNode.description}
                  </p>
                </div>

                {/* Status Transitions List */}
                <div className="p-4 border-b border-slate-800 bg-[#14171E]">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GitBranch size={13} className="text-indigo-400" />
                    <span>状态跃迁规则 (Transitions)</span>
                  </h4>

                  <div className="space-y-1.5 text-xs">
                    {WORKFLOW_EDGES.filter(e => e.from === selectedNode.id).map(e => {
                      const target = WORKFLOW_NODES.find(n => n.id === e.to);
                      return (
                        <div key={e.id} className="p-2 rounded-lg bg-[#1D212B] border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-slate-400 font-mono text-[11px]">[{e.label}]</span>
                            <ArrowRight size={11} className="text-indigo-400" />
                            <span className="font-semibold text-slate-200 truncate">{target?.nameZh || e.to}</span>
                          </div>
                          {e.description && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{e.description}</span>
                          )}
                        </div>
                      );
                    })}
                    {WORKFLOW_EDGES.filter(e => e.from === selectedNode.id).length === 0 && (
                      <div className="text-xs text-slate-500 italic p-2 bg-[#1D212B] rounded">
                        终端归档状态，无后续自动流转
                      </div>
                    )}
                  </div>
                </div>

                {/* Items in this state */}
                <div className="flex-1 flex flex-col overflow-hidden p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <span>当前处于该状态的工单</span>
                      <span className="px-2 py-0.2 rounded-full bg-indigo-500 text-white font-mono text-[10px] font-bold">
                        {selectedNodeItems.length}
                      </span>
                    </h4>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                    {selectedNodeItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => onSelectWorkItem && onSelectWorkItem(item)}
                        className="p-3 rounded-xl bg-[#1C2029] border border-slate-800 hover:border-indigo-500/60 hover:bg-[#222733] cursor-pointer transition-all duration-150 space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/60">
                            {item.id}
                          </span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">
                            {item.progressPercent}%
                          </span>
                        </div>

                        <h5 className="text-xs font-semibold text-slate-100 line-clamp-1">
                          {item.title}
                        </h5>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                          <span>{item.assigneeName || (item.assigneeId === 'unassigned' ? '未分配' : item.assigneeId)}</span>
                          <span>{item.relativeTime || item.updatedAt}</span>
                        </div>
                      </div>
                    ))}

                    {selectedNodeItems.length === 0 && (
                      <div className="h-32 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl bg-[#121418]/60 text-slate-500 text-xs">
                        <Activity size={20} className="text-slate-600 mb-1" />
                        <span>当前状态暂无活跃工单</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 text-xs">
                <Workflow size={28} className="text-slate-600 mb-2" />
                <span>点击左侧流程图中的任意状态卡片以查看详细定义与当前工单</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
