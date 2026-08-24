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
  ShieldCheck
} from 'lucide-react';

interface Phase0SpecsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'checklist' | 'statemachine' | 'intent_object';
}

export const PHASE_0_CHECKLIST_ITEMS = [
  {
    id: '0.1',
    name: '接收用户请求',
    nameEn: 'Receive User Request',
    component: 'Intent Gateway',
    input: 'Human Prompt',
    inputDesc: '用户原始自然语言目标与需求描述',
    processing: '接收用户目标、需求描述与业务意图，创建全局 Request ID，校验基础格式',
    output: 'Raw Request',
    stateTransition: 'NEW_REQUEST → RECEIVED',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: '0.2',
    name: '识别任务类型',
    nameEn: 'Classify Task Type',
    component: 'Intent Classifier Agent',
    input: 'Raw Request',
    inputDesc: '已持久化的原始请求体',
    processing: '判断 Feature / Bug / Refactor / Research / Operation 等类型与紧急度 (P0~P3)',
    output: 'Request Type',
    stateTransition: 'RECEIVED → CLASSIFIED',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: '0.3',
    name: '加载项目上下文',
    nameEn: 'Retrieve Project Context',
    component: 'Context Retrieval Agent',
    input: 'Request + Project',
    inputDesc: '请求信息 + 项目代码仓元数据',
    processing: '查询项目背景、代码仓上下文 (Repo AST)、历史任务工单 (Task History) 与知识库图谱',
    output: 'Context Package',
    stateTransition: 'CLASSIFIED → CONTEXT_LOADING',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: '0.4',
    name: '理解用户目标',
    nameEn: 'Understand User Intent & Goals',
    component: 'Intent Understanding Agent',
    input: 'Request + Context',
    inputDesc: '原始请求 + 项目知识包',
    processing: '消除模糊自然语言歧义，提炼真实业务目标与核心价值，构建目标模型 (Goal Model)',
    output: 'Goal Model',
    stateTransition: 'CONTEXT_LOADING → ANALYZING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '0.5',
    name: '提取约束条件',
    nameEn: 'Extract Constraint Set',
    component: 'Requirement Extractor Agent',
    input: 'Goal Model',
    inputDesc: '结构化目标模型',
    processing: '提取技术栈架构 (如 JWT/OAuth2)、时间节点、硬件资源、安全合规与限制条件',
    output: 'Constraint Set',
    stateTransition: 'ANALYZING',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: '0.6',
    name: '生成初步验收标准',
    nameEn: 'Generate Acceptance Criteria (DoD)',
    component: 'Acceptance Analyzer',
    input: 'Goal + Constraint',
    inputDesc: '目标模型 + 约束条件集合',
    processing: '定义可度量、可自动测试验证的完成标准 Definition of Done (DoD)',
    output: 'Acceptance Criteria',
    stateTransition: 'ANALYZING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '0.7',
    name: '完整性检查',
    nameEn: 'Validation & Completeness Check',
    component: 'Validation Agent',
    input: 'Intent Data',
    inputDesc: '已提炼的所有意图数据',
    processing: '判断是否具备进入规划阶段的信息完整度；若信息缺失则触发 Clarification 交互',
    output: 'Validation Result',
    stateTransition: 'ANALYZING',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: '0.8',
    name: '请求补充信息 (可选)',
    nameEn: 'Clarification & Follow-up',
    component: 'Clarification Agent',
    input: 'Missing Information',
    inputDesc: '缺失的边界条件与技术参数',
    processing: '向用户主动询问缺失条件并等待反馈；用户补充后更新意图并重新发起完整性校验',
    output: 'Updated Intent',
    stateTransition: 'WAITING_INPUT',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '0.9',
    name: '创建 Intent Object',
    nameEn: 'Assemble Structured Intent Object',
    component: 'Intent Manager',
    input: '全部已确认信息',
    inputDesc: 'Goal + Type + Constraints + DoD + Context',
    processing: '组装标准化任务意图对象 (Structured Intent Object JSON)，固化元数据',
    output: 'Intent Object',
    stateTransition: 'READY_FOR_PLANNING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '0.10',
    name: '交给 PM Agent',
    nameEn: 'Handover to PM Agent (Phase 1)',
    component: 'Workflow Router',
    input: 'Intent Object',
    inputDesc: '已就绪的标准意图对象',
    processing: '启动项目规划流程，移交给 PM Agent 进行需求深入分解与 Agent 调度 (Phase 1)',
    output: 'Planning Task',
    stateTransition: 'READY_FOR_PLANNING → PLANNING',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
];

export const PHASE_0_STATE_MACHINE_ITEMS = [
  {
    state: 'NEW_REQUEST',
    stateZh: '用户刚提交需求',
    description: '用户在前端界面或客户端提交自然语言描述，系统生成会话会话句柄。',
    entryCondition: 'Human 自然语言输入 (Human Prompt)',
    exitCondition: 'Gateway 网关校验通过并接收',
    executionDetails: [
      '接收用户原始消息',
      '分配全局唯一 Request ID (如 REQ-2026-0801)',
      '持久化存储原始 Prompt 与发起人信息',
    ],
    outputArtifact: 'Raw Request Body',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    state: 'RECEIVED',
    stateZh: '系统收到请求',
    description: '意图网关已受理请求并完成初步协议解析，准备进入 AI 分类管道。',
    entryCondition: '请求合法，完成基础结构解析',
    exitCondition: '触发 Intent Classifier 智能体开始分析',
    executionDetails: [
      '清洗输入字符串与注入敏感词过滤',
      '挂载用户组织权限与项目工作区 ID',
      '触发意图分类推理流水线',
    ],
    outputArtifact: 'Sanitized Request Context',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    state: 'CLASSIFIED',
    stateZh: '任务类型已识别',
    description: 'AI 分类器确定请求类型 (Feature/Bug/Refactor/Research/Deployment) 与业务域。',
    entryCondition: 'Classifier Agent 多分类推理完成',
    exitCondition: '进入多维项目上下文与知识图谱加载',
    executionDetails: [
      '判别任务大类：Feature (新特性) / Bug (缺陷) / Refactor / Research',
      '识别业务域 Domain：Payment / Authentication / Order / Notification',
      '评估优先级与风险等级 (P0/P1/P2/P3)',
    ],
    outputArtifact: 'Type: "Bug", Domain: "Payment", Priority: "High"',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    state: 'CONTEXT_LOADING',
    stateZh: '加载项目知识与记忆',
    description: '检索关联代码仓、架构决策记录 (ADR)、历史任务工单与团队规范。',
    entryCondition: 'Context Retrieval 查询动作触发',
    exitCondition: '代码仓与记忆图谱数据包组装就绪',
    executionDetails: [
      '查询 Memory Graph：长期团队架构偏好与技术栈约定',
      '查询 Repository Context：关联微服务 API、DB Schema 与依赖库',
      '查询 Previous Work Items：历史相似缺陷修复记录与已交付功能',
    ],
    outputArtifact: 'Context Package (AST + Schema + ADRs)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    state: 'ANALYZING',
    stateZh: 'AI 理解需求与提取约束',
    description: '深度提炼业务目标，收敛技术/时间/安全硬约束，拟定 Definition of Done。',
    entryCondition: 'Goal / Constraint 提取引擎启动',
    exitCondition: '完整性验证 Agent 完成判定',
    executionDetails: [
      '提取真实业务目标 (Goal Model: e.g. Build OAuth Login Capability)',
      '提取硬约束 (Constraints: JWT, OAuth2, Kubernetes, 兼容已有 User DB)',
      '生成可验证验收标准 (DoD: Login API 正常, Token 刷新通过, 单元测试覆盖 100%)',
    ],
    outputArtifact: 'Goal Model + Constraint Set + DoD Criteria',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    state: 'WAITING_INPUT',
    stateZh: '等待用户补充澄清信息',
    description: '完整性检查发现关键参数或业务边界缺失，挂起等待用户交互输入。',
    entryCondition: 'Validation Agent 检查发现关键信息缺失',
    exitCondition: '用户提供补充信息，触发重新分析验证',
    executionDetails: [
      '向用户呈现澄清问题列表 (Clarification Prompts)',
      '监听并接收用户补充的补充描述或配置文件',
      '更新 Intent 数据包并重新提交完整性校验',
    ],
    outputArtifact: 'Clarification Prompt / Updated User Input',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    state: 'READY_FOR_PLANNING',
    stateZh: '意图完整，准备进入项目规划',
    description: '标准化 Intent Object 组装固化，正式移交给 PM Agent 启动 Phase 1 规划。',
    entryCondition: 'Intent 数据完整性校验通过 (100% Complete)',
    exitCondition: '成功交接 PM Agent (Phase 1 Requirement & Decomposition)',
    executionDetails: [
      '组装最终标准化 JSON 意图对象 (Intent Object)',
      '固化版本号与依赖环境标签',
      '向 PM Orchestrator 发送启动规划信号 (Planning Task Dispatch)',
    ],
    outputArtifact: 'Structured Intent Object JSON',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const SAMPLE_INTENT_OBJECT = {
  "intent_id": "INT-001",
  "version": "1.0.0",
  "created_at": "2026-08-24T08:00:00Z",
  "request_origin": {
    "channel": "Web Portal",
    "user_id": "user_architect_01",
    "raw_prompt": "为我们的管理平台实现企业级 OAuth2 单点登录与哈希审计日志流"
  },
  "type": "Feature",
  "domain": "Authentication & Security",
  "priority": "High",
  "goal": "Implement Enterprise OAuth2 SSO Login & Hashed Audit Logging Capability",
  "constraints": [
    "JWT with RS256 asymmetric signature",
    "OAuth 2.0 / OIDC Authorization Code Flow with PKCE",
    "Containerized deployment on Kubernetes (k8s)",
    "Backward compatible with existing PostgreSQL User DB",
    "Strict OWASP Top 10 security compliance"
  ],
  "acceptance_criteria": [
    "✓ RESTful /api/auth/oauth/login and /callback endpoints functional",
    "✓ JWT access token and refresh token rotation with Redis revocation list",
    "✓ Zero plaintext secrets in database; HMAC-SHA256 hashed audit events",
    "✓ Unit and Integration test coverage >= 90%",
    "✓ Automated Playwright E2E verification passes all scenarios"
  ],
  "context": {
    "repository": "github.com/enterprise/multica-core",
    "database_schema": "postgresql://users, roles, audit_logs",
    "memory_graph_id": "mem_arch_auth_sso_v2",
    "previous_tasks": ["FEAT-089-User-RBAC", "FEAT-092-Session-Store"]
  },
  "status": "READY_FOR_PLANNING",
  "next_phase": "Phase 1: Project Manager Agent (Requirement Understanding & Task Decomposition)"
};

export const Phase0SpecsDrawer: React.FC<Phase0SpecsDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = 'checklist',
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'statemachine' | 'intent_object'>(initialTab);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpandedFull, setIsExpandedFull] = useState(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_INTENT_OBJECT, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredChecklist = PHASE_0_CHECKLIST_ITEMS.filter(item => {
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

  const filteredStateMachine = PHASE_0_STATE_MACHINE_ITEMS.filter(item => {
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
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md font-black">
              P0
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Phase 0：人类意图接收阶段 规约矩阵 (Phase 0 Specs)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Human Intent Intake
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                工作事项清单 (0.1 ~ 0.10) · 状态机生命周期设计 · 标准化 Intent Object JSON
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
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet size={15} />
              <span>📋 工作事项清单 (0.1 ~ 0.10)</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'checklist' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                10 项
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
              <span>🔄 状态机设计 · Request 生命周期</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'statemachine' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                7 状态
              </span>
            </button>

            <button
              onClick={() => setActiveTab('intent_object')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'intent_object'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Code size={15} />
              <span>📦 产物：Intent Object JSON</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${activeTab === 'intent_object' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                Output
              </span>
            </button>
          </div>

          {/* Search Box */}
          {activeTab !== 'intent_object' && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="搜索编号、组件、状态或处理内容..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 text-slate-800"
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
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <Sparkles size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">阶段目标 (Phase Objective)：</span>
                  将用户自然语言需求转换为结构化 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">Structured Intent Object</code>，
                  以便后续移交给 <span className="font-semibold">Project Manager Agent (Phase 1)</span> 开展需求深入理解、任务拆解、Agent 分配与 Work Item 创建。
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto w-full max-w-full pb-2">
                  <table className="min-w-[1000px] w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-3.5 text-center w-14">编号</th>
                        <th className="py-3 px-4 min-w-[140px]">工作项</th>
                        <th className="py-3 px-4 min-w-[150px]">执行组件</th>
                        <th className="py-3 px-4 min-w-[130px]">输入</th>
                        <th className="py-3 px-4 min-w-[280px]">处理内容</th>
                        <th className="py-3 px-4 min-w-[140px]">输出</th>
                        <th className="py-3 px-4 min-w-[180px]">状态变化</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                      {filteredChecklist.map((item, idx) => (
                        <tr 
                          key={item.id}
                          className="hover:bg-amber-50/40 transition-colors"
                        >
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-500">
                            {item.id}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">
                            <div>{item.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.nameEn}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-semibold font-mono text-[11px]">
                              <Cpu size={12} className="text-indigo-500" />
                              {item.component}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{item.input}</div>
                            <div className="text-[10px] text-slate-500">{item.inputDesc}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 leading-relaxed">
                            {item.processing}
                          </td>
                          <td className="py-3 px-4 font-semibold text-emerald-700">
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-mono text-[11px]">
                              {item.output}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-[11px] border ${item.badgeColor}`}>
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
              TAB 2: 状态机设计表格 (Request 生命周期)
             ==================================================== */}
          {activeTab === 'statemachine' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-start gap-3">
                <Activity size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900 leading-relaxed">
                  <span className="font-bold">Request 生命周期状态机 (Lifecycle State Machine)：</span>
                  严格定义每个状态的进入前置条件 (Entry Condition)、离开后置条件 (Exit Condition) 及内部执行动作，保证任务意图转换全链路幂等可溯源。
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto w-full max-w-full pb-2">
                  <table className="min-w-[1100px] w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4 w-[160px] shrink-0">状态 (State)</th>
                        <th className="py-3 px-4 w-[170px]">业务说明</th>
                        <th className="py-3 px-4 w-[170px]">进入条件 (Entry)</th>
                        <th className="py-3 px-4 w-[170px]">离开条件 (Exit)</th>
                        <th className="py-3 px-4 min-w-[280px]">核心执行事项</th>
                        <th className="py-3 px-4 min-w-[170px]">示例产物 (Artifact)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
                      {filteredStateMachine.map((sm, idx) => (
                        <tr 
                          key={sm.state}
                          className="hover:bg-indigo-50/40 transition-colors"
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
              TAB 3: 标准化 INTENT OBJECT JSON PREVIEW
             ==================================================== */}
          {activeTab === 'intent_object' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5 text-xs text-emerald-900">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <span>
                    <span className="font-bold">最终交付产物 (Final Deliverable)：</span>
                    Phase 0 完成后固化的标准 JSON 规范对象，供 Phase 1 Project Manager Agent 进行全自动需求拆解与架构排期。
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
                  {JSON.stringify(SAMPLE_INTENT_OBJECT, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 font-mono">
            <span>Phase 0: Human Intent Intake Engine</span>
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
