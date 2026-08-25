import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Layers,
  ArrowRight,
  HelpCircle,
  Code,
  FileText,
  Brain,
  MessageSquare,
  FileCode,
  ListOrdered,
  Cpu,
  ShieldCheck,
  Database,
  RefreshCw,
  GitBranch,
  Search,
  CheckCircle2,
  Compass,
  Sliders,
  Terminal,
  Activity,
  Info
} from 'lucide-react';

interface GoalRefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type BranchType = 'all' | 'new_idea' | 'clear_req' | 'validation' | 'iteration';

interface StepDetail {
  id: string;
  name: string;
  nameZh: string;
  role: string;
  agentName: string;
  description: string;
  input: string;
  output: string;
  promptExample: string;
  keyTechnique: string;
  color: string;
  badgeBg: string;
}

const STEP_DETAILS: Record<string, StepDetail> = {
  'brainstorming': {
    id: 'brainstorming',
    name: 'brainstorming',
    nameZh: '头脑风暴发散与场景构想',
    role: 'Product Strategy & Innovation Specialist',
    agentName: 'Nova PM Orchestrator / Innovation Agent',
    description: '针对模糊或初创的想法（New Idea），通过发散思维、价值主张设计与竞品对比，挖掘潜在痛点与真实用户场景。',
    input: '原始发散想法 (Raw Unstructured Idea / Brief)',
    output: '场景清单、核心价值主张与候选功能集 (Opportunity Matrix)',
    promptExample: `You are an expert Innovation Strategist. Deconstruct the user's raw idea into 3-5 concrete user personas, core pain points, and feasible solution hypotheses. Highlight novelty and market differentiation.`,
    keyTechnique: 'SCAMPER 发散思考模型 + 价值画布 (Value Proposition Canvas)',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  'interview-me': {
    id: 'interview-me',
    name: 'interview-me',
    nameZh: '多轮深度反问与需求澄清',
    role: 'Requirements Elicitation Specialist',
    agentName: 'Apex Work-Item Decomposer',
    description: '由智能体主动向用户/技术决策者提出针对性问题（如技术栈选型、SLA指标、安全约束、边界条件），收敛不确定性。',
    input: '初版需求或场景清单 (Draft Scope)',
    output: '结构化澄清答卷与确认事实 (Clarified Q&A Log & Confirmed Facts)',
    promptExample: `Ask me 3-5 critical clarifying questions covering: 1) System boundary & non-functional constraints, 2) Target performance & concurrency, 3) Edge case failure handling. Wait for answers before proceeding.`,
    keyTechnique: '主动式多轮反问矩阵 (Proactive Socratic Elicitation)',
    color: '#EC4899',
    badgeBg: 'bg-pink-100 text-pink-800 border-pink-300',
  },
  'spec-driven-development': {
    id: 'spec-driven-development',
    name: 'spec-driven-development',
    nameZh: '规约驱动设计与目标建模',
    role: 'System Architect & Spec Engineer',
    agentName: 'Titan Backend Architect / Nova PM',
    description: '以 OpenAPI 3.1、Given-When-Then 验收准则 (DoD) 与架构不变性契约（Invariants）为核心，将业务目标固化为严格的技术规约模型。',
    input: '澄清后的需求事实与边界 (Clarified Requirements)',
    output: '系统契约规约、DoD 可测试矩阵与 Goal Model (Formal Spec)',
    promptExample: `Synthesize a formal specification with: 1) One-sentence core objective, 2) Given-When-Then Acceptance Criteria, 3) Strict JSON schema / OpenAPI contracts, 4) Technical invariants and security boundaries.`,
    keyTechnique: 'DoD 行为驱动模型 (BDD) + 类型契约不变性验证 (Type Contract Invariants)',
    color: '#3B82F6',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  'planning-and-task-breakdown': {
    id: 'planning-and-task-breakdown',
    name: 'planning-and-task-breakdown',
    nameZh: '任务分级拆解与执行单元规划',
    role: 'Work Item Decomposer & DAG Planner',
    agentName: 'Apex Work-Item Decomposer',
    description: '将规约模型逐层分解为原子、无依赖歧义且可自动评测的 Task 契约集合，明确输入/输出及前置依赖。',
    input: '正式规约文档 (Formal Spec) + 系统依赖上下文',
    output: 'Jira 格式 Task/Story 列表与有向无环依赖图 (Work Items & DAG)',
    promptExample: `Decompose the specification into atomic engineering tasks (Story -> Task -> Subtask). Each task must specify precise input contract, output artifacts, estimated tokens, and testable DoD.`,
    keyTechnique: '敏捷工单分层分解法 (WBS) + 拓扑排序依赖计算 (DAG Planning)',
    color: '#10B981',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  'project-planner': {
    id: 'project-planner',
    name: 'project-planner',
    nameZh: '已有方案规划与可行性推演',
    role: 'Technical Feasibility & Project Planner',
    agentName: 'Nova PM Orchestrator',
    description: '针对已有架构方案或技术原型，评估实施路径、模块改造范围、算力预算与历史代码契合度。',
    input: '已有方案设计稿 / 技术建议书 (Existing Architecture Proposal)',
    output: '实施可行性报告、风险清单与演进路线图 (Feasibility & Roadmap)',
    promptExample: `Evaluate this existing architecture proposal against current codebase. Identify technical debt, migration friction, token budget, and critical milestones.`,
    keyTechnique: '架构适应度函数 (Fitness Function) + 迁移成本推演模型',
    color: '#06B6D4',
    badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  'skeptic': {
    id: 'skeptic',
    name: 'skeptic',
    nameZh: '架构怀疑论者 · 边界与反例压力质询',
    role: 'Devil\'s Advocate / Security & Edge Reviewer',
    agentName: 'Aegis Security Auditor / Senior Tech Lead',
    description: '扮演“反方角色”，专门挑刺既有方案中的单点故障、并发竞态、安全漏洞、极端边界与灾难恢复缺陷，倒逼方案完善。',
    input: '已有实施方案与初版规划 (Proposed Plan)',
    output: '漏洞挑刺清单、极端反例用例集与防御性改造要求 (Skeptic Audit)',
    promptExample: `Act as a ruthless Principal Engineer / Skeptic. Stress-test this proposal with worst-case failure scenarios: network partition, race conditions, memory leaks, malicious payload injection. Challenge all optimistic assumptions.`,
    keyTechnique: '混沌工程假设推演 (Chaos Engineering) + 红队对抗审查 (Red Team Review)',
    color: '#EF4444',
    badgeBg: 'bg-red-100 text-red-800 border-red-300',
  },
  'user-story-mapping': {
    id: 'user-story-mapping',
    name: 'user-story-mapping',
    nameZh: '用户故事地图与增量切片',
    role: 'Product UX & Story Map Architect',
    agentName: 'Prism UI/UX Architect / Nova PM',
    description: '针对已有成熟产品（已有产品），通过用户旅程主干（Backbone）与增量切片（Releases/Slices），规划持续迭代的最小可行变更。',
    input: '已有线上系统功能现状 + 新增迭代诉求 (Existing Product & Delta)',
    output: '用户故事地图、版本切片与影响域分析 (Story Map & Delta Slice)',
    promptExample: `Map the user journey across current product modules. Place new delta enhancements into prioritized horizontal release slices without disrupting existing user mental models.`,
    keyTechnique: 'Jeff Patton 用户故事地图 (User Story Mapping) + 增量切片法 (Thin Vertical Slicing)',
    color: '#F59E0B',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  'agent-execution': {
    id: 'agent-execution',
    name: 'Agent Execution',
    nameZh: '智能体多角色协同执行',
    role: 'Multi-Agent Swarm (Full-Stack Core)',
    agentName: 'Backend, Frontend, DBA & QA Swarm',
    description: '根据任务图谱并发分派，各专业智能体（后端、前端、DBA）在沙箱容器中执行 ReAct 自主编码与构建。',
    input: '待执行工单 (READY Work Items) + 上下文契约',
    output: '代码实现、Drizzle Schema、React 组件与部署产物',
    promptExample: `Execute assigned task strictly obeying input schema and constraints. Write clean code and self-test.`,
    keyTechnique: 'ReAct (Reasoning + Acting) + AST 代码生成沙箱',
    color: '#6366F1',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  'evaluation': {
    id: 'evaluation',
    name: 'Evaluation',
    nameZh: '质量评估、测试验证与反馈',
    role: 'Automated QA & Evaluation Gate',
    agentName: 'Aegis QA & Human Director',
    description: '执行 Vitest 单元测试、Playwright E2E、OWASP 安全扫描与人类技术总监放行决议，生成可量化评分。',
    input: '执行产物包 + DoD 验收标准',
    output: '测试报告 (Test Report)、安全审计报告与验收评分 (Evaluation Score)',
    promptExample: `Run full regression suite against deliverables. Assert all Given-When-Then rules.`,
    keyTechnique: '自动化测试流水线 + LLM-as-a-Judge 双重裁决',
    color: '#10B981',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  'memory': {
    id: 'memory',
    name: 'Knowledge Graph / Memory',
    nameZh: '知识图谱与长期记忆沉淀',
    role: 'Memory & Continuous Learning Engine',
    agentName: 'Chronos Memory & Evolution Agent',
    description: '将执行过程中的成功经验、技术 ADR 架构决策、代码片段与踩坑教训沉淀至全局知识图谱，并在下一次需求中主动检索召回。',
    input: '验收交付包、审计日志与复盘提炼经验',
    output: '更新后的系统知识图谱、Vector Memory 与 Skill 库 (Evolved Knowledge)',
    promptExample: `Distill reusable architecture patterns and bug prevention rules into memory graph.`,
    keyTechnique: 'RAG 向量图谱 (Knowledge Graph) + 经验反思蒸馏 (Reflexion Learning)',
    color: '#8B5CF6',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
  }
};

const MERMAID_SOURCE = `flowchart TD

START((User Request))

START
--> TYPE{Request Type?}

TYPE -->|New Idea<br/>| 不明确需求
TYPE -->|明确需求<br/>| 需要开发
TYPE -->|已有方案<br/>| 需要验证
TYPE -->|已有产品<br/>| 持续迭代

不明确需求
--> BRAIN[brainstorming]
BRAIN
--> INTERVIEW[interview-me]
INTERVIEW
--> SPEC1[spec-driven-development]
SPEC1
--> TASK1[planning-and-task-breakdown]

需要开发
--> INTERVIEW2[interview-me]
INTERVIEW2
--> SPEC2[spec-driven-development]
SPEC2
--> TASK2[planning-and-task-breakdown]

需要验证
--> PROJECT[project-planner]
PROJECT
--> SKEPTIC[skeptic]
SKEPTIC
--> SPEC3[spec-driven-development]
SPEC3
--> TASK3[planning-and-task-breakdown]

持续迭代
--> STORY[user-story-mapping]
STORY
--> TASK4[planning-and-task-breakdown]

TASK1
--> EXECUTE[Agent Execution]
TASK2
--> EXECUTE
TASK3
--> EXECUTE
TASK4
--> EXECUTE

EXECUTE
--> FEEDBACK[Evaluation]
FEEDBACK
--> MEMORY[(Knowledge Graph / Memory)]
MEMORY
--> START`;

export const GoalRefinementModal: React.FC<GoalRefinementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'pipeline' | 'mermaid'>('diagram');
  const [selectedBranch, setSelectedBranch] = useState<BranchType>('all');
  const [selectedStepId, setSelectedStepId] = useState<string>('brainstorming');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationActiveIndex, setSimulationActiveIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulation timer
  useEffect(() => {
    let timer: any = null;
    if (isSimulating) {
      timer = setInterval(() => {
        setSimulationActiveIndex(prev => (prev + 1) % 8);
      }, 1200);
    } else {
      setSimulationActiveIndex(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSimulating]);

  if (!isOpen) return null;

  const handleCopyMermaid = () => {
    navigator.clipboard.writeText(MERMAID_SOURCE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedStep = STEP_DETAILS[selectedStepId] || STEP_DETAILS['brainstorming'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`bg-[#0F1117] border border-[#232936] rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 text-slate-100 font-sans ${
          isFullscreen ? 'w-[98vw] h-[96vh]' : 'w-[94vw] max-w-6xl h-[90vh]'
        }`}
      >
        {/* ====================================================
            1. TOP HEADER & BREADCRUMBS
           ==================================================== */}
        <div className="px-5 py-3.5 bg-[#141720] border-b border-[#222834] flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                  Phase 2.3 · Refine Core Goal
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  需求分类与目标推导全景流程图
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white mt-0.5 flex items-center gap-2">
                <span>用户请求类型分流与全生命周期闭环</span>
                <span className="text-[11px] text-slate-400 font-mono font-normal">
                  (Request Taxonomy & Closed-Loop Memory Flowchart)
                </span>
              </h2>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex items-center bg-[#1A1E27] p-1 rounded-xl border border-[#2B3242] text-xs">
              <button
                onClick={() => setActiveTab('diagram')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'diagram'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>交互图谱</span>
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'pipeline'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sliders size={14} />
                <span>4大链路详解</span>
              </button>
              <button
                onClick={() => setActiveTab('mermaid')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'mermaid'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code size={14} />
                <span>Mermaid 源码</span>
              </button>
            </div>

            {/* Simulation Button */}
            <button
              onClick={() => setIsSimulating(s => !s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isSimulating
                  ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                  : 'bg-[#222836] hover:bg-[#2B3344] text-indigo-300 border border-indigo-500/30'
              }`}
              title="模拟请求在各分支与闭环中的流动"
            >
              {isSimulating ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimulating ? '暂停流转' : '全流程模拟'}</span>
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#222836] rounded-xl transition-colors"
              title={isFullscreen ? '窗口模式' : '全屏展开'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close modal */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-colors"
              title="关闭 (Close)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ====================================================
            2. BRANCH SELECTOR FILTER STRIP
           ==================================================== */}
        <div className="px-5 py-2.5 bg-[#12151D] border-b border-[#202532] flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400 font-medium text-[11px] mr-1">需求分类分支：</span>
            
            <button
              onClick={() => setSelectedBranch('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs ${
                selectedBranch === 'all'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2330]'
              }`}
            >
              🌈 全部 4 大分支 (All Branches)
            </button>

            <button
              onClick={() => setSelectedBranch('new_idea')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs flex items-center gap-1.5 ${
                selectedBranch === 'new_idea'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-purple-300 hover:bg-[#1E2330]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>1. New Idea (不明确需求)</span>
            </button>

            <button
              onClick={() => setSelectedBranch('clear_req')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs flex items-center gap-1.5 ${
                selectedBranch === 'clear_req'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-blue-300 hover:bg-[#1E2330]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>2. 明确需求 (需要开发)</span>
            </button>

            <button
              onClick={() => setSelectedBranch('validation')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs flex items-center gap-1.5 ${
                selectedBranch === 'validation'
                  ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-[#1E2330]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>3. 已有方案 (需要验证)</span>
            </button>

            <button
              onClick={() => setSelectedBranch('iteration')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs flex items-center gap-1.5 ${
                selectedBranch === 'iteration'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50 shadow-xs'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-[#1E2330]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>4. 已有产品 (持续迭代)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>闭环记忆持续回流 (Knowledge Loop)</span>
            </span>
          </div>
        </div>

        {/* ====================================================
            3. MAIN CONTENT BODY
           ==================================================== */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-[#0A0C10]">
          
          {/* ----------------------------------------------------
              TAB 1: INTERACTIVE DIAGRAM FLOW CANVAS
             ---------------------------------------------------- */}
          {activeTab === 'diagram' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Flowchart Canvas Area */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center bg-[radial-gradient(#1E2330_1px,transparent_1px)] [background-size:20px_20px]">
                
                {/* 1. START NODE */}
                <div className="flex flex-col items-center animate-in fade-in duration-200">
                  <div 
                    onClick={() => setSelectedStepId('interview-me')}
                    className={`px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-indigo-400 text-white font-bold text-xs shadow-lg flex items-center gap-2 cursor-pointer hover:scale-105 transition-all ${
                      simulationActiveIndex === 0 ? 'ring-4 ring-indigo-400 animate-bounce' : ''
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping inline-block" />
                    <span>START: User Request (用户原始请求)</span>
                  </div>

                  {/* Down Arrow to TYPE */}
                  <div className="w-0.5 h-7 bg-indigo-500/70 relative">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 border-b-2 border-r-2 border-indigo-400 rotate-45" />
                  </div>

                  {/* 2. TYPE DECISION GATEWAY (Diamond) */}
                  <div 
                    className={`px-5 py-3 rounded-2xl bg-[#1C212E] border-2 border-amber-500/80 text-amber-300 font-bold text-xs shadow-md text-center max-w-sm flex items-center gap-2 cursor-pointer hover:border-amber-400 transition-all ${
                      simulationActiveIndex === 1 ? 'ring-4 ring-amber-400 scale-105' : ''
                    }`}
                  >
                    <GitBranch size={16} className="text-amber-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-amber-200">TYPE: Request Type? (需求分类)</div>
                      <div className="text-[10px] text-amber-400/80 font-mono">评估清晰度、已有资产与成熟度</div>
                    </div>
                  </div>

                  {/* Branch Split Connectors */}
                  <div className="w-full max-w-4xl h-8 relative mt-1">
                    {/* Horizontal Bus */}
                    <div className="absolute top-3 left-10 right-10 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-amber-500 opacity-60" />
                    
                    {/* 4 Vertical Drops */}
                    <div className="absolute top-3 left-[12%] w-0.5 h-5 bg-purple-500" />
                    <div className="absolute top-3 left-[37%] w-0.5 h-5 bg-blue-500" />
                    <div className="absolute top-3 left-[63%] w-0.5 h-5 bg-cyan-500" />
                    <div className="absolute top-3 left-[88%] w-0.5 h-5 bg-amber-500" />
                  </div>
                </div>

                {/* 3. FOUR DISTINCT BRANCH LANES */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 w-full max-w-5xl mt-1">
                  
                  {/* =========================================
                      BRANCH 1: 不明确需求 (New Idea)
                     ========================================= */}
                  <div 
                    className={`p-3 rounded-2xl bg-[#141720] border transition-all duration-200 flex flex-col gap-2.5 ${
                      selectedBranch === 'new_idea' || selectedBranch === 'all'
                        ? 'border-purple-500/40 opacity-100 shadow-md shadow-purple-950/20'
                        : 'border-[#222836] opacity-35'
                    }`}
                  >
                    {/* Branch Header */}
                    <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-purple-400">BRANCH 1</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">New Idea</span>
                      </div>
                      <div className="text-xs font-bold mt-0.5">不明确需求</div>
                    </div>

                    {/* Step 1.1: brainstorming */}
                    <div
                      onClick={() => setSelectedStepId('brainstorming')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'brainstorming'
                          ? 'bg-purple-900/30 border-purple-400 ring-2 ring-purple-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Brain size={14} className="text-purple-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">brainstorming</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">头脑风暴 · 场景与价值发掘</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-purple-400 text-xs">↓</div>

                    {/* Step 1.2: interview-me */}
                    <div
                      onClick={() => setSelectedStepId('interview-me')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'interview-me'
                          ? 'bg-pink-900/30 border-pink-400 ring-2 ring-pink-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-pink-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-pink-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">interview-me</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">深度反问 · 意图挖掘与澄清</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-purple-400 text-xs">↓</div>

                    {/* Step 1.3: spec-driven-development */}
                    <div
                      onClick={() => setSelectedStepId('spec-driven-development')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'spec-driven-development'
                          ? 'bg-blue-900/30 border-blue-400 ring-2 ring-blue-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-blue-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">spec-driven-dev</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">规约驱动 · 目标与DoD建模</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-purple-400 text-xs">↓</div>

                    {/* Step 1.4: planning-and-task-breakdown */}
                    <div
                      onClick={() => setSelectedStepId('planning-and-task-breakdown')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'planning-and-task-breakdown'
                          ? 'bg-emerald-900/30 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ListOrdered size={14} className="text-emerald-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white truncate">planning-task-breakdown</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">分级拆解 · 任务规划</div>
                    </div>
                  </div>

                  {/* =========================================
                      BRANCH 2: 明确需求 (需要开发)
                     ========================================= */}
                  <div 
                    className={`p-3 rounded-2xl bg-[#141720] border transition-all duration-200 flex flex-col gap-2.5 ${
                      selectedBranch === 'clear_req' || selectedBranch === 'all'
                        ? 'border-blue-500/40 opacity-100 shadow-md shadow-blue-950/20'
                        : 'border-[#222836] opacity-35'
                    }`}
                  >
                    {/* Branch Header */}
                    <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-blue-400">BRANCH 2</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">Clear Spec</span>
                      </div>
                      <div className="text-xs font-bold mt-0.5">需要开发 (明确需求)</div>
                    </div>

                    {/* Step 2.1: interview-me */}
                    <div
                      onClick={() => setSelectedStepId('interview-me')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'interview-me'
                          ? 'bg-pink-900/30 border-pink-400 ring-2 ring-pink-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-pink-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-pink-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">interview-me</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">技术边界与验收确认</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-blue-400 text-xs">↓</div>

                    {/* Step 2.2: spec-driven-development */}
                    <div
                      onClick={() => setSelectedStepId('spec-driven-development')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'spec-driven-development'
                          ? 'bg-blue-900/30 border-blue-400 ring-2 ring-blue-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-blue-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">spec-driven-dev</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">接口契约与不变性定义</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-blue-400 text-xs">↓</div>

                    {/* Step 2.3: planning-and-task-breakdown */}
                    <div
                      onClick={() => setSelectedStepId('planning-and-task-breakdown')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'planning-and-task-breakdown'
                          ? 'bg-emerald-900/30 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ListOrdered size={14} className="text-emerald-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white truncate">planning-task-breakdown</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">工单拆解与执行包创建</div>
                    </div>
                  </div>

                  {/* =========================================
                      BRANCH 3: 已有方案 (需要验证)
                     ========================================= */}
                  <div 
                    className={`p-3 rounded-2xl bg-[#141720] border transition-all duration-200 flex flex-col gap-2.5 ${
                      selectedBranch === 'validation' || selectedBranch === 'all'
                        ? 'border-cyan-500/40 opacity-100 shadow-md shadow-cyan-950/20'
                        : 'border-[#222836] opacity-35'
                    }`}
                  >
                    {/* Branch Header */}
                    <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-cyan-400">BRANCH 3</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">Validate</span>
                      </div>
                      <div className="text-xs font-bold mt-0.5">需要验证 (已有方案)</div>
                    </div>

                    {/* Step 3.1: project-planner */}
                    <div
                      onClick={() => setSelectedStepId('project-planner')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'project-planner'
                          ? 'bg-cyan-900/30 border-cyan-400 ring-2 ring-cyan-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-cyan-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Compass size={14} className="text-cyan-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">project-planner</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">可行性评估与演进规划</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-cyan-400 text-xs">↓</div>

                    {/* Step 3.2: skeptic */}
                    <div
                      onClick={() => setSelectedStepId('skeptic')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'skeptic'
                          ? 'bg-red-900/30 border-red-400 ring-2 ring-red-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-red-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-red-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">skeptic (挑刺)</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">架构怀疑论者 · 极端边界质询</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-cyan-400 text-xs">↓</div>

                    {/* Step 3.3: spec-driven-development */}
                    <div
                      onClick={() => setSelectedStepId('spec-driven-development')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'spec-driven-development'
                          ? 'bg-blue-900/30 border-blue-400 ring-2 ring-blue-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-blue-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileCode size={14} className="text-blue-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">spec-driven-dev</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">修订版规约与安全防线</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-cyan-400 text-xs">↓</div>

                    {/* Step 3.4: planning-and-task-breakdown */}
                    <div
                      onClick={() => setSelectedStepId('planning-and-task-breakdown')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'planning-and-task-breakdown'
                          ? 'bg-emerald-900/30 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ListOrdered size={14} className="text-emerald-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white truncate">planning-task-breakdown</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">增量验证任务拆解</div>
                    </div>
                  </div>

                  {/* =========================================
                      BRANCH 4: 已有产品 (持续迭代)
                     ========================================= */}
                  <div 
                    className={`p-3 rounded-2xl bg-[#141720] border transition-all duration-200 flex flex-col gap-2.5 ${
                      selectedBranch === 'iteration' || selectedBranch === 'all'
                        ? 'border-amber-500/40 opacity-100 shadow-md shadow-amber-950/20'
                        : 'border-[#222836] opacity-35'
                    }`}
                  >
                    {/* Branch Header */}
                    <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-amber-400">BRANCH 4</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">Iteration</span>
                      </div>
                      <div className="text-xs font-bold mt-0.5">持续迭代 (已有产品)</div>
                    </div>

                    {/* Step 4.1: user-story-mapping */}
                    <div
                      onClick={() => setSelectedStepId('user-story-mapping')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'user-story-mapping'
                          ? 'bg-amber-900/30 border-amber-400 ring-2 ring-amber-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-amber-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers size={14} className="text-amber-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white">user-story-mapping</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">故事地图 · 增量切片分析</div>
                    </div>

                    {/* Down arrow */}
                    <div className="flex justify-center -my-1 text-amber-400 text-xs">↓</div>

                    {/* Step 4.2: planning-and-task-breakdown */}
                    <div
                      onClick={() => setSelectedStepId('planning-and-task-breakdown')}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        selectedStepId === 'planning-and-task-breakdown'
                          ? 'bg-emerald-900/30 border-emerald-400 ring-2 ring-emerald-500/30'
                          : 'bg-[#181C26] border-[#2A3142] hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ListOrdered size={14} className="text-emerald-400 flex-shrink-0" />
                        <div className="font-mono text-xs font-bold text-white truncate">planning-task-breakdown</div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">迭代增量工单拆解</div>
                    </div>
                  </div>
                </div>

                {/* 4. COMMON CONVERGENCE PIPELINE & CLOSED LOOP */}
                <div className="w-full max-w-3xl mt-4 flex flex-col items-center">
                  
                  {/* Convergence Bus */}
                  <div className="w-full h-6 relative">
                    <div className="absolute top-0 left-12 right-12 h-0.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 opacity-60" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-indigo-500" />
                  </div>

                  {/* Stage 1: Agent Execution */}
                  <div
                    onClick={() => setSelectedStepId('agent-execution')}
                    className={`w-full p-3 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border-2 border-indigo-500/60 flex items-center justify-between cursor-pointer hover:border-indigo-400 shadow-md transition-all ${
                      selectedStepId === 'agent-execution' ? 'ring-2 ring-indigo-400 scale-[1.01]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Cpu size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Agent Execution (智能体多角色并发执行)</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">Phase 5 ~ 7</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          后端微服务、React 19 组件、Drizzle ORM 数据建模与 API 契约实现
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-indigo-400" />
                  </div>

                  {/* Down Arrow */}
                  <div className="w-0.5 h-4 bg-indigo-500/60" />

                  {/* Stage 2: Evaluation */}
                  <div
                    onClick={() => setSelectedStepId('evaluation')}
                    className={`w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border-2 border-emerald-500/60 flex items-center justify-between cursor-pointer hover:border-emerald-400 shadow-md transition-all ${
                      selectedStepId === 'evaluation' ? 'ring-2 ring-emerald-400 scale-[1.01]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Evaluation (执行评估与多维质量反馈)</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Phase 8 ~ 9</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Playwright E2E、Vitest 用例集、OWASP 安全扫描与人类技术总监验收
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={16} className="text-emerald-400" />
                  </div>

                  {/* Down Arrow */}
                  <div className="w-0.5 h-4 bg-emerald-500/60" />

                  {/* Stage 3: Knowledge Graph / Memory (Cylinder) */}
                  <div
                    onClick={() => setSelectedStepId('memory')}
                    className={`w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900 border-2 border-purple-500/60 flex items-center justify-between cursor-pointer hover:border-purple-400 shadow-md transition-all ${
                      selectedStepId === 'memory' ? 'ring-2 ring-purple-400 scale-[1.01]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                        <Database size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Knowledge Graph / Memory (知识图谱与记忆沉淀)</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-mono">Phase 10 ~ 11</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          沉淀架构决策 ADR、最佳代码实践、踩坑教训与演化能力图谱
                        </div>
                      </div>
                    </div>
                    <RefreshCw size={16} className="text-purple-400 animate-spin" />
                  </div>

                  {/* Closed Loop Return Badge */}
                  <div className="mt-3 px-4 py-1.5 rounded-full bg-[#181C26] border border-purple-500/40 text-purple-300 text-[11px] font-mono font-medium flex items-center gap-2 shadow-xs">
                    <RefreshCw size={13} className="text-purple-400" />
                    <span>Memory 沉淀自动回流注入 ➔ START (User Request) 支持持续进化</span>
                  </div>
                </div>

              </div>

              {/* Right Step Inspector Panel */}
              <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-[#222836] bg-[#12151D] p-4 sm:p-5 flex flex-col justify-between overflow-y-auto space-y-4">
                <div className="space-y-4">
                  {/* Step Title Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#222834]">
                    <div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${selectedStep.badgeBg}`}>
                        SKILL / NODE
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1.5 font-mono">
                        {selectedStep.name}
                      </h3>
                      <p className="text-xs text-indigo-300 font-medium mt-0.5">
                        {selectedStep.nameZh}
                      </p>
                    </div>

                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: selectedStep.color }}
                    >
                      <Sparkles size={15} />
                    </div>
                  </div>

                  {/* Overview Description */}
                  <div className="bg-[#181D27] p-3 rounded-xl border border-[#283144] space-y-1.5">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <Info size={13} className="text-indigo-400" />
                      <span>节点作用与调度语义</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {selectedStep.description}
                    </p>
                  </div>

                  {/* Responsible Agent & Technique */}
                  <div className="space-y-2 text-xs">
                    <div className="bg-[#181D27] p-2.5 rounded-xl border border-[#283144]">
                      <span className="text-[10px] text-slate-400 font-mono">负责智能体角色</span>
                      <div className="text-xs font-bold text-indigo-300 mt-0.5">
                        {selectedStep.agentName}
                      </div>
                    </div>

                    <div className="bg-[#181D27] p-2.5 rounded-xl border border-[#283144]">
                      <span className="text-[10px] text-slate-400 font-mono">核心方法论与算法</span>
                      <div className="text-xs font-semibold text-emerald-300 mt-0.5">
                        {selectedStep.keyTechnique}
                      </div>
                    </div>
                  </div>

                  {/* Input / Output Specs */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#141822] border border-[#262E3E]">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">输入 (Input Payload)</span>
                      <p className="text-xs text-slate-200 mt-0.5">{selectedStep.input}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#141822] border border-[#262E3E]">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">输出 (Output Artifact)</span>
                      <p className="text-xs text-emerald-200 mt-0.5">{selectedStep.output}</p>
                    </div>
                  </div>

                  {/* Prompt Template Preview */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">典型 Agent Prompt 模板:</span>
                      <span className="text-[10px] text-indigo-400 font-mono">System Prompt</span>
                    </div>
                    <div className="p-3 bg-[#0A0C10] rounded-xl border border-[#222836] font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto">
                      {selectedStep.promptExample}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#202532] text-[11px] text-slate-500 font-mono text-center">
                  Multica Unified Goal Reasoning & Closed-Loop Memory
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 2: FOUR PIPELINES DETAILED WALKTHROUGH
             ---------------------------------------------------- */}
          {activeTab === 'pipeline' && (
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-6">
              
              {/* Branch 1 */}
              <div className="p-4 rounded-2xl bg-[#141722] border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-400" />
                    <h3 className="text-sm font-bold text-white">分支 1：New Idea · 不明确需求</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    4-Step Skill Chain
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  适用人类用户只有粗略灵感或模糊愿景的场景。系统首先通过 <code className="text-purple-300 font-mono">brainstorming</code> 发散可能的用户场景与价值主张，再通过 <code className="text-pink-300 font-mono">interview-me</code> 主动深度反问收敛模糊点，继而进入 <code className="text-blue-300 font-mono">spec-driven-development</code> 固化规约，最后执行 <code className="text-emerald-300 font-mono">planning-and-task-breakdown</code> 拆解为原子任务。
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 overflow-x-auto py-1">
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">brainstorming</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">interview-me</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">spec-driven-development</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">planning-and-task-breakdown</span>
                </div>
              </div>

              {/* Branch 2 */}
              <div className="p-4 rounded-2xl bg-[#141722] border border-blue-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-400" />
                    <h3 className="text-sm font-bold text-white">分支 2：明确需求 · 需要开发</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    3-Step Skill Chain
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  适用业务目标非常明确但需要技术落地落地的场景。跳过头脑风暴，直接由 <code className="text-pink-300 font-mono">interview-me</code> 核对技术边界、API约束与非功能性要求，输出严格的 <code className="text-blue-300 font-mono">spec-driven-development</code> 规约模型与 <code className="text-emerald-300 font-mono">planning-and-task-breakdown</code> 任务拆解。
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 overflow-x-auto py-1">
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">interview-me</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">spec-driven-development</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">planning-and-task-breakdown</span>
                </div>
              </div>

              {/* Branch 3 */}
              <div className="p-4 rounded-2xl bg-[#141722] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <h3 className="text-sm font-bold text-white">分支 3：已有方案 · 需要验证</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                    4-Step Hardened Chain
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  针对已有方案建议书或架构设计，<code className="text-cyan-300 font-mono">project-planner</code> 首先推演技术可行性与资源预算，随后触发 <code className="text-red-400 font-mono">skeptic (怀疑论者)</code> 进行全方位挑刺与破坏性推演，最终将修补后的方案沉淀为 <code className="text-blue-300 font-mono">spec-driven-development</code> 与拆解工单。
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 overflow-x-auto py-1">
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">project-planner</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-red-500/40 text-red-300">skeptic (挑刺)</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">spec-driven-development</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">planning-and-task-breakdown</span>
                </div>
              </div>

              {/* Branch 4 */}
              <div className="p-4 rounded-2xl bg-[#141722] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-bold text-white">分支 4：已有产品 · 持续迭代</h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    2-Step Lean Slice Chain
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  在已有成熟线上产品上新增模块时，利用 <code className="text-amber-300 font-mono">user-story-mapping</code> 用户故事地图梳理影响范围与功能切片，直接输出增量更新的 <code className="text-emerald-300 font-mono">planning-and-task-breakdown</code> 任务。
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 overflow-x-auto py-1">
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">user-story-mapping</span>
                  <span>➔</span>
                  <span className="px-2.5 py-1 bg-[#1C212E] rounded-lg border border-[#2E364A]">planning-and-task-breakdown</span>
                </div>
              </div>

              {/* Convergence & Memory Feedback */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/40 to-slate-900 border border-purple-500/40 space-y-2">
                <div className="text-xs font-bold text-purple-200 flex items-center gap-2">
                  <RefreshCw size={14} className="text-purple-400" />
                  <span>下游执行收敛与终态自学习闭环 (Closed-Loop Evolution)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  四大分支所生成的任务最终统一汇入 <strong className="text-indigo-300">Agent Execution</strong> 并发执行，由 <strong className="text-emerald-300">Evaluation</strong> 自动化测试验收，最后在 <strong className="text-purple-300">Knowledge Graph / Memory</strong> 中提炼架构资产，循环回流至 <strong className="text-white">START (User Request)</strong> 阶段，实现新任务的更优上下文注入。
                </p>
              </div>

            </div>
          )}

          {/* ----------------------------------------------------
              TAB 3: MERMAID CODE VIEW & COPY
             ---------------------------------------------------- */}
          {activeTab === 'mermaid' && (
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="bg-[#141822] p-4 rounded-xl border border-[#262E3E] flex items-center justify-between flex-wrap gap-3">
                <div className="text-xs text-slate-300 flex items-center gap-2">
                  <Code size={16} className="text-indigo-400" />
                  <span>Mermaid Flowchart 源码（可直接粘贴至 Mermaid Live Editor 或 Markdown 文档）：</span>
                </div>
                <button
                  onClick={handleCopyMermaid}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? '已复制到剪贴板' : '复制 Mermaid 代码'}</span>
                </button>
              </div>

              <div className="bg-[#0A0C10] p-4 rounded-xl border border-[#222836] font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
                <pre className="leading-relaxed">{MERMAID_SOURCE}</pre>
              </div>
            </div>
          )}

        </div>

        {/* ====================================================
            4. MODAL FOOTER
           ==================================================== */}
        <div className="px-5 py-3 bg-[#12151D] border-t border-[#202532] flex items-center justify-between text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>Phase 2: PM Agent Intent Understanding</span>
            <span>•</span>
            <span>Node 2.3: Refine Core Goal Model</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1F2432] hover:bg-[#2A3142] text-white font-bold transition-colors shadow-xs"
          >
            完成查看 (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
