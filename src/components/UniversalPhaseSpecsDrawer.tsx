import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Activity, 
  Code, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Layers,
  Cpu,
  UserCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  GitCommit,
  ArrowRight,
  Compass
} from 'lucide-react';
import { 
  PHASE_0_CHECKLIST_ITEMS, 
  PHASE_0_STATE_MACHINE_ITEMS, 
  SAMPLE_INTENT_OBJECT 
} from './Phase0SpecsDrawer';
import { 
  PHASE_1_CHECKLIST_ITEMS, 
  PHASE_1_STATE_MACHINE_ITEMS, 
  SAMPLE_PHASE_1_ARTIFACT,
  PHASE_2_CHECKLIST_ITEMS, 
  PHASE_2_STATE_MACHINE_ITEMS, 
  SAMPLE_PHASE_2_ARTIFACT,
  PHASE_3_CHECKLIST_ITEMS, 
  PHASE_3_STATE_MACHINE_ITEMS, 
  SAMPLE_PHASE_3_ARTIFACT,
  PHASE_4_CHECKLIST_ITEMS, 
  PHASE_4_STATE_MACHINE_ITEMS, 
  SAMPLE_PHASE_4_ARTIFACT,
  PhaseSpecItem,
  PhaseStateMachineItem
} from '../data/phaseSpecsData';
import {
  PHASE_5_CHECKLIST_ITEMS,
  PHASE_5_STATE_MACHINE_ITEMS,
  SAMPLE_PHASE_5_ARTIFACT,
  PHASE_6_CHECKLIST_ITEMS,
  PHASE_6_STATE_MACHINE_ITEMS,
  SAMPLE_PHASE_6_ARTIFACT,
  PHASE_7_CHECKLIST_ITEMS,
  PHASE_7_STATE_MACHINE_ITEMS,
  SAMPLE_PHASE_7_ARTIFACT,
  PHASE_8_CHECKLIST_ITEMS,
  PHASE_8_STATE_MACHINE_ITEMS,
  SAMPLE_PHASE_8_ARTIFACT,
  PHASE_9_CHECKLIST_ITEMS,
  PHASE_9_STATE_MACHINE_ITEMS,
  SAMPLE_PHASE_9_ARTIFACT,
  PHASE_10_CHECKLIST_ITEMS,
  PHASE_10_STATE_MACHINE_ITEMS,
  SAMPLE_PHASE_10_ARTIFACT,
  PHASE_11_CHECKLIST_ITEMS,
  PHASE_11_STATE_MACHINE_ITEMS,
  SAMPLE_PHASE_11_ARTIFACT,
} from '../data/phaseSpecsDataPart2';
import { GoalRefinementModal } from './GoalRefinementModal';

export type PhaseIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

interface UniversalPhaseSpecsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  phase: PhaseIndex;
  initialTab?: 'checklist' | 'statemachine' | 'artifact';
}

interface PhaseConfig {
  phaseNum: PhaseIndex;
  badge: string;
  badgeColor: string;
  titleZh: string;
  titleEn: string;
  subtitle: string;
  checklist: PhaseSpecItem[];
  stateMachine: PhaseStateMachineItem[];
  artifact: Record<string, any>;
  artifactTitle: string;
  artifactDesc: string;
  themeGradient: string;
  themeColorHex: string;
}

const PHASE_CONFIGS: Record<PhaseIndex, PhaseConfig> = {
  0: {
    phaseNum: 0,
    badge: 'Phase 0 · Intent Intake',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    titleZh: 'Phase 0：人类意图接收阶段 规约矩阵',
    titleEn: 'Phase 0: Human Intent Intake Specs',
    subtitle: '工作事项清单 (0.1 ~ 0.10) · Request 生命周期状态机 · 标准化 Intent Object JSON',
    checklist: PHASE_0_CHECKLIST_ITEMS as unknown as PhaseSpecItem[],
    stateMachine: PHASE_0_STATE_MACHINE_ITEMS as unknown as PhaseStateMachineItem[],
    artifact: SAMPLE_INTENT_OBJECT,
    artifactTitle: '标准化 Intent Object JSON',
    artifactDesc: 'Phase 0 完成后固化的标准 JSON 规范对象，供 Phase 1 Project Manager Agent 进行格式规范化与接入。',
    themeGradient: 'from-amber-500/10 via-indigo-500/10 to-emerald-500/10',
    themeColorHex: '#F59E0B',
  },
  1: {
    phaseNum: 1,
    badge: 'Phase 1 · Task Intake',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    titleZh: 'Phase 1：任务接入与格式规范化 规约矩阵',
    titleEn: 'Phase 1: Task Intake & Normalization Specs',
    subtitle: '工作事项清单 (1.1 ~ 1.10) · Task Request Intake 状态机 · Normalized Task Request JSON',
    checklist: PHASE_1_CHECKLIST_ITEMS,
    stateMachine: PHASE_1_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_1_ARTIFACT,
    artifactTitle: '标准任务请求 (Normalized Task Request JSON)',
    artifactDesc: 'Phase 1 完成后固化的标准任务请求载荷与 Context Message，供 Phase 2 PM Agent 深度理解需求。',
    themeGradient: 'from-emerald-500/10 via-teal-500/10 to-blue-500/10',
    themeColorHex: '#10B981',
  },
  2: {
    phaseNum: 2,
    badge: 'Phase 2 · Intent Understanding',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    titleZh: 'Phase 2：PM 智能体理解任务 规约矩阵',
    titleEn: 'Phase 2: PM Agent Intent Understanding Specs',
    subtitle: '工作事项清单 (2.1 ~ 2.10) · 理解模型生命周期状态机 · Task Understanding Model JSON',
    checklist: PHASE_2_CHECKLIST_ITEMS,
    stateMachine: PHASE_2_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_2_ARTIFACT,
    artifactTitle: '任务理解模型 (Task Understanding Model JSON)',
    artifactDesc: '包含核心目标 (Goal)、范围 (In/Out Scope)、约束假设与验收模型 (DoD) 的全量理解包，供 Phase 3 拆解使用。',
    themeGradient: 'from-blue-500/10 via-indigo-500/10 to-purple-500/10',
    themeColorHex: '#3B82F6',
  },
  3: {
    phaseNum: 3,
    badge: 'Phase 3 · Task Decomposition',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    titleZh: 'Phase 3：任务分级拆解 规约矩阵',
    titleEn: 'Phase 3: Task Decomposition Specs',
    subtitle: '工作事项清单 (3.1 ~ 3.10) · 拆解与重构状态机 (Split/Merge) · Task Breakdown JSON',
    checklist: PHASE_3_CHECKLIST_ITEMS,
    stateMachine: PHASE_3_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_3_ARTIFACT,
    artifactTitle: '任务拆解结果 (Task Breakdown JSON)',
    artifactDesc: '固化所有原子子任务的 Task Contracts (Input/Output/DoD/Capabilities)，供 Phase 4 构建 Task Graph。',
    themeGradient: 'from-purple-500/10 via-indigo-500/10 to-pink-500/10',
    themeColorHex: '#8B5CF6',
  },
  4: {
    phaseNum: 4,
    badge: 'Phase 4 · Dependency Planning',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    titleZh: 'Phase 4：任务图谱构建与依赖排期 规约矩阵',
    titleEn: 'Phase 4: Task Graph & Dependency Planning Specs',
    subtitle: '工作事项清单 (4.1 ~ 4.10) · DAG 验证与拓扑状态机 · Task Graph DAG JSON',
    checklist: PHASE_4_CHECKLIST_ITEMS,
    stateMachine: PHASE_4_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_4_ARTIFACT,
    artifactTitle: '有向任务图谱 (Task Graph DAG JSON)',
    artifactDesc: '具备无环 (Acyclic) 拓扑、并行分支 (Parallel Groups)、Join 汇合门禁与关键路径的完整 DAG，供 Phase 5 调度。',
    themeGradient: 'from-indigo-500/10 via-blue-500/10 to-emerald-500/10',
    themeColorHex: '#6366F1',
  },
  5: {
    phaseNum: 5,
    badge: 'Phase 5 · Capability Matching',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    titleZh: 'Phase 5：智能体能力匹配与委派 规约矩阵',
    titleEn: 'Phase 5: Agent Capability Matching & Assignment Specs',
    subtitle: '工作事项清单 (5.1 ~ 5.10) · 智能体优选与门禁状态机 · Agent Assignment Plan JSON',
    checklist: PHASE_5_CHECKLIST_ITEMS,
    stateMachine: PHASE_5_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_5_ARTIFACT,
    artifactTitle: '智能体分配计划 (Agent Assignment Plan JSON)',
    artifactDesc: '包含每个 Task 节点的 Primary/Backup Agent 绑定、Skill/Tool 权限沙箱与容量预留凭据，供 Phase 6 实例化。',
    themeGradient: 'from-rose-500/10 via-red-500/10 to-amber-500/10',
    themeColorHex: '#EF4444',
  },
  6: {
    phaseNum: 6,
    badge: 'Phase 6 · Work Item Creation',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    titleZh: 'Phase 6：工作项创建与看板状态机 规约矩阵',
    titleEn: 'Phase 6: Work Item Creation & Kanban State Machine Specs',
    subtitle: '工作事项清单 (6.1 ~ 6.10) · 事务与看板初始化状态机 · Work Item Set JSON',
    checklist: PHASE_6_CHECKLIST_ITEMS,
    stateMachine: PHASE_6_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_6_ARTIFACT,
    artifactTitle: '可调度工作项集 (Work Item Set JSON)',
    artifactDesc: '包含已完成实体持久化、看板列投影与最小充分 Context Message 的工作项全集，供 Phase 7 认领执行。',
    themeGradient: 'from-blue-500/10 via-indigo-500/10 to-cyan-500/10',
    themeColorHex: '#3B82F6',
  },
  7: {
    phaseNum: 7,
    badge: 'Phase 7 · ReAct Execution',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    titleZh: 'Phase 7：智能体执行工作项 (ReAct 循环) 规约矩阵',
    titleEn: 'Phase 7: Agent Execute Work Item (ReAct Loop) Specs',
    subtitle: '工作事项清单 (7.1 ~ 7.10) · 执行生命周期状态机 · Execution Result Package JSON',
    checklist: PHASE_7_CHECKLIST_ITEMS,
    stateMachine: PHASE_7_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_7_ARTIFACT,
    artifactTitle: '执行结果包 (Execution Result Package JSON)',
    artifactDesc: '包含已生成的代码/产物清单、可复现测试证据 (Evidence)、DoD 核对清单与状态跃迁申请，供 Phase 8 验证。',
    themeGradient: 'from-emerald-500/10 via-teal-500/10 to-indigo-500/10',
    themeColorHex: '#10B981',
  },
  8: {
    phaseNum: 8,
    badge: 'Phase 8 · State Flow',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    titleZh: 'Phase 8：状态流转与事件驱动 规约矩阵',
    titleEn: 'Phase 8: State Transition & Event Driven Specs',
    subtitle: '工作事项清单 (8.1 ~ 8.10) · 事件驱动流转状态机 · State Transition Result JSON',
    checklist: PHASE_8_CHECKLIST_ITEMS,
    stateMachine: PHASE_8_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_8_ARTIFACT,
    artifactTitle: '状态流转结果 (State Transition Result JSON)',
    artifactDesc: '原子应用状态变更、递增 state_version、移动看板卡片并自动解锁下游依赖 (BLOCKED → READY)，唤醒 Phase 9。',
    themeGradient: 'from-indigo-500/10 via-purple-500/10 to-blue-500/10',
    themeColorHex: '#6366F1',
  },
  9: {
    phaseNum: 9,
    badge: 'Phase 9 · Review & QA',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    titleZh: 'Phase 9：评审、质量验证与验收 规约矩阵',
    titleEn: 'Phase 9: Review, QA & Acceptance Specs',
    subtitle: '工作事项清单 (9.1 ~ 9.10) · 质量门禁与返工状态机 · Acceptance Result JSON',
    checklist: PHASE_9_CHECKLIST_ITEMS,
    stateMachine: PHASE_9_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_9_ARTIFACT,
    artifactTitle: '最终验收结果 (Acceptance Result JSON)',
    artifactDesc: '涵盖独立评审结论、自动化回归 QA 报告、DoD 条款核对与业务负责人签字记录，正式宣告交付进入 Phase 10。',
    themeGradient: 'from-amber-500/10 via-orange-500/10 to-emerald-500/10',
    themeColorHex: '#F59E0B',
  },
  10: {
    phaseNum: 10,
    badge: 'Phase 10 · Archive & Learning',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    titleZh: 'Phase 10：完成归档与记忆/技能学习 规约矩阵',
    titleEn: 'Phase 10: Complete Archive & Memory/Skill Learning Specs',
    subtitle: '工作事项清单 (10.1 ~ 10.10) · 归档与经验提炼状态机 · Archive Package JSON',
    checklist: PHASE_10_CHECKLIST_ITEMS,
    stateMachine: PHASE_10_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_10_ARTIFACT,
    artifactTitle: '完整归档与学习候选包 (Archive Package JSON)',
    artifactDesc: '固化全量审计索引、交付指标 (Cycle Time / Cost)，提炼经过脱敏的 Memory 与 Skill 候选，交由 Phase 11 评测。',
    themeGradient: 'from-purple-500/10 via-pink-500/10 to-indigo-500/10',
    themeColorHex: '#8B5CF6',
  },
  11: {
    phaseNum: 11,
    badge: 'Phase 11 · Agent Evolution',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    titleZh: 'Phase 11：智能体自主演化与版本闭环 规约矩阵',
    titleEn: 'Phase 11: Agent Evolution & Version Release Specs',
    subtitle: '工作事项清单 (11.1 ~ 11.10) · 演化评测与灰度状态机 · Agent Version Release JSON',
    checklist: PHASE_11_CHECKLIST_ITEMS,
    stateMachine: PHASE_11_STATE_MACHINE_ITEMS,
    artifact: SAMPLE_PHASE_11_ARTIFACT,
    artifactTitle: '智能体版本发布包 (Agent Version Release JSON)',
    artifactDesc: '不可变新版本 (如 v3.5.0) 的离线评测报告、安全红队检查、生产 Canary 灰度监控与回滚指针，形成持续自我迭代闭环。',
    themeGradient: 'from-emerald-500/10 via-teal-500/10 to-cyan-500/10',
    themeColorHex: '#10B981',
  },
};

export const UniversalPhaseSpecsDrawer: React.FC<UniversalPhaseSpecsDrawerProps> = ({
  isOpen,
  onClose,
  phase,
  initialTab = 'checklist',
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'statemachine' | 'artifact'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExpandedFull, setIsExpandedFull] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentConfig = PHASE_CONFIGS[phase] || PHASE_CONFIGS[0];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(currentConfig.artifact, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredChecklist = currentConfig.checklist.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.component.toLowerCase().includes(q) ||
      item.output.toLowerCase().includes(q) ||
      item.stateTransition.toLowerCase().includes(q)
    );
  });

  const filteredStateMachine = currentConfig.stateMachine.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.state.toLowerCase().includes(q) ||
      item.stateZh.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.entryCondition.toLowerCase().includes(q) ||
      item.exitCondition.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
          isExpandedFull ? 'w-[96vw] h-[94vh]' : 'w-[90vw] max-w-6xl h-[88vh]'
        }`}
      >
        {/* Modal Header */}
        <div className={`bg-gradient-to-r ${currentConfig.themeGradient} p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3`}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-md font-black"
              style={{ backgroundColor: currentConfig.themeColorHex }}
            >
              P{currentConfig.phaseNum}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentConfig.titleZh}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${currentConfig.badgeColor}`}>
                  {currentConfig.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {currentConfig.subtitle}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpandedFull(v => !v)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
              title={isExpandedFull ? '恢复默认大小' : '展开为全屏'}
            >
              {isExpandedFull ? '缩小窗口' : '全屏展开'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              title="关闭 (Close)"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'checklist'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet size={15} />
              <span>📋 工作事项清单 ({currentConfig.phaseNum}.1 ~ {currentConfig.phaseNum}.10)</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'checklist' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {currentConfig.checklist.length} 项
              </span>
            </button>

            <button
              onClick={() => setActiveTab('statemachine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'statemachine'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity size={15} />
              <span>🔄 状态机设计 · 阶段生命周期</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'statemachine' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {currentConfig.stateMachine.length} 状态
              </span>
            </button>

            <button
              onClick={() => setActiveTab('artifact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'artifact'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code size={15} />
              <span>📦 阶段交付产物 JSON</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'artifact' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                Output
              </span>
            </button>
          </div>

          {/* Search Box */}
          {activeTab !== 'artifact' && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="搜索编号、组件、状态或处理内容..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-400 text-slate-800"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* ====================================================
              TAB 1: 工作事项清单表格
             ==================================================== */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-3 px-4 w-16 text-center">编号</th>
                        <th className="py-3 px-4 w-44">工作项 / Name</th>
                        <th className="py-3 px-4 w-48">执行 Agent / 组件</th>
                        <th className="py-3 px-4 w-40">输入 (Input)</th>
                        <th className="py-3 px-4">处理内容 (Processing)</th>
                        <th className="py-3 px-4 w-40">输出 (Output)</th>
                        <th className="py-3 px-4 w-52">状态变化 (State Transition)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredChecklist.map((item) => (
                        <tr 
                          key={item.id} 
                          className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                          onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                        >
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-md group-hover:bg-indigo-100 group-hover:text-indigo-800 transition-colors">
                              {item.id}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.nameEn}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium border text-[11px] ${item.badgeColor}`}>
                              <Cpu size={12} />
                              {item.component}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-700">{item.input}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.inputDesc}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 leading-relaxed">
                            {item.processing}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono font-bold text-[11px]">
                              {item.output}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded font-mono text-[11px] font-semibold">
                              {item.stateTransition}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 2: 状态机生命周期表格
             ==================================================== */}
          {activeTab === 'statemachine' && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="py-3 px-4 w-44">状态 (State)</th>
                        <th className="py-3 px-4 w-60">说明 (Description)</th>
                        <th className="py-3 px-4 w-48">进入条件 (Entry Condition)</th>
                        <th className="py-3 px-4 w-48">离开条件 (Exit Condition)</th>
                        <th className="py-3 px-4">核心执行动作 (Execution Details)</th>
                        <th className="py-3 px-4 w-44">输出产物 (Output)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStateMachine.map((sm, idx) => (
                        <tr 
                          key={idx} 
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 align-top">
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border ${sm.badgeColor}`}>
                              {sm.state}
                            </span>
                            <div className="text-[11px] font-semibold text-slate-600 mt-1">{sm.stateZh}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-medium align-top">
                            {sm.description}
                          </td>
                          <td className="py-3 px-4 font-medium text-emerald-800 bg-emerald-50/30 align-top">
                            {sm.entryCondition}
                          </td>
                          <td className="py-3 px-4 font-medium text-indigo-800 bg-indigo-50/30 align-top">
                            {sm.exitCondition}
                          </td>
                          <td className="py-3 px-4 align-top">
                            <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                              {sm.executionDetails.map((detail, dIdx) => (
                                <li key={dIdx} className="leading-tight">{detail}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 bg-slate-50/50 align-top">
                            {sm.outputArtifact}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================
              TAB 3: 阶段产物 JSON PREVIEW
             ==================================================== */}
          {activeTab === 'artifact' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>
                    <span className="font-bold">最终交付产物 ({currentConfig.artifactTitle})：</span>
                    {currentConfig.artifactDesc}
                  </span>
                </div>
                <button
                  onClick={handleCopyJson}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? '已复制 JSON 到剪贴板' : '复制标准 JSON'}</span>
                </button>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner border border-slate-800 max-h-[58vh]">
                <pre className="leading-relaxed">
                  {JSON.stringify(currentConfig.artifact, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span>Phase {currentConfig.phaseNum}: {currentConfig.titleEn}</span>
            <span>•</span>
            <span>Multica Orchestration Standard</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold transition-colors shadow-2xs"
          >
            完成查看 (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
