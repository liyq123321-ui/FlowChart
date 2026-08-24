// ==========================================
// PHASE 1 ~ 4 CHECKLISTS, STATE MACHINES & JSON ARTIFACTS
// ==========================================

export interface PhaseSpecItem {
  id: string;
  name: string;
  nameEn: string;
  component: string;
  input: string;
  inputDesc: string;
  processing: string;
  output: string;
  stateTransition: string;
  badgeColor: string;
}

export interface PhaseStateMachineItem {
  state: string;
  stateZh: string;
  description: string;
  entryCondition: string;
  exitCondition: string;
  executionDetails: string[];
  outputArtifact: string;
  badgeColor: string;
}

// ----------------------------------------------------------------------
// PHASE 1 SPECS
// ----------------------------------------------------------------------
export const PHASE_1_CHECKLIST_ITEMS: PhaseSpecItem[] = [
  {
    id: '1.1',
    name: '接收 Intent Object',
    nameEn: 'Receive Intent Object',
    component: 'Task Intake Gateway',
    input: 'Intent Object',
    inputDesc: 'Phase 0 输出的标准化意图对象',
    processing: '校验消息来源并创建 Intake Record 登记单',
    output: 'Intake Record',
    stateTransition: 'READY_FOR_PLANNING → INTAKE_RECEIVED',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '1.2',
    name: '生成任务标识',
    nameEn: 'Generate Task Identity',
    component: 'Task Registry',
    input: 'Intake Record',
    inputDesc: '初始登记记录',
    processing: '生成全局 Task ID、关联 Intent ID 和 Request ID，建立幂等索引',
    output: 'Task Identity',
    stateTransition: 'INTAKE_RECEIVED → VALIDATING',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: '1.3',
    name: '校验基础字段',
    nameEn: 'Validate Schema Fields',
    component: 'Schema Validator',
    input: 'Intent Object',
    inputDesc: '意图数据载荷',
    processing: '检查 goal、type、constraint、acceptance、context 等必填字段与类型合法性',
    output: 'Validation Report',
    stateTransition: 'VALIDATING',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: '1.4',
    name: '绑定任务归属',
    nameEn: 'Bind Workspace Scope',
    component: 'Workspace Resolver',
    input: 'Request + Context',
    inputDesc: '请求信息与组织上下文',
    processing: '识别项目、工作空间、发起人和默认负责人，绑定多租户权限边界',
    output: 'Task Scope Binding',
    stateTransition: 'VALIDATING',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    id: '1.5',
    name: '重复任务检测',
    nameEn: 'Duplicate Task Detection',
    component: 'Deduplication Agent',
    input: 'Goal + Active Tasks',
    inputDesc: '目标描述 + 当前活跃任务池',
    processing: '基于语义向量与代码仓范围判断重复、延续、关联或全新独立任务',
    output: 'Deduplication Result',
    stateTransition: 'VALIDATING',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: '1.6',
    name: '规范任务字段',
    nameEn: 'Normalize Task Fields',
    component: 'Task Normalizer',
    input: 'Validated Intent',
    inputDesc: '校验通过的意图载荷',
    processing: '统一类型 (Feature/Bug/Research)、优先级 (P0~P3)、时间与术语格式',
    output: 'Normalized Fields',
    stateTransition: 'VALIDATING → NORMALIZING',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: '1.7',
    name: '初步风险分级',
    nameEn: 'Preliminary Risk Triage',
    component: 'Risk Triage Agent',
    input: 'Request + Constraint',
    inputDesc: '任务要素与技术约束',
    processing: '标记权限、生产、隐私、资金、外部动作等敏感风险标签',
    output: 'Risk Labels',
    stateTransition: 'NORMALIZING',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '1.8',
    name: '生成 Context Message',
    nameEn: 'Build Context Message',
    component: 'Context Message Builder',
    input: '全部 Intake 数据',
    inputDesc: '所有已规范化元数据',
    processing: '生成给 PM Agent 的标准上下文消息 (Task Intake Context)',
    output: 'Intake Context Message',
    stateTransition: 'NORMALIZING',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: '1.9',
    name: '请求补充信息 (可选)',
    nameEn: 'Clarification for Intake',
    component: 'Intake Clarification Agent',
    input: 'Missing Fields',
    inputDesc: '登记所必需但缺失的信息',
    processing: '向用户请求任务登记所必需的关键参数或所属项目',
    output: 'Updated Intake Record',
    stateTransition: 'VALIDATING → WAITING_INPUT',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '1.10',
    name: '写入 PM 队列',
    nameEn: 'Route to PM Queue',
    component: 'Task Router',
    input: 'Normalized Task Request',
    inputDesc: '标准任务请求载荷',
    processing: '按任务类型、项目和优先级路由写入 PM Agent 待办队列',
    output: 'PM Queue Message',
    stateTransition: 'NORMALIZED → READY_FOR_UNDERSTANDING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const PHASE_1_STATE_MACHINE_ITEMS: PhaseStateMachineItem[] = [
  {
    state: 'INTAKE_RECEIVED',
    stateZh: '已接收 Phase 0 意图',
    description: '系统成功接收合法 Intent Object，分配 Task ID，创建初始接入记录。',
    entryCondition: '收到合法 Intent Object',
    exitCondition: 'Task ID 创建并持久化完成',
    executionDetails: [
      '保存 Intent Object 原始快照',
      '生成全局唯一 task_id (如 TASK-001)',
      '关联 intent_id、request_id 和发起人',
      '记录接收时间、渠道和幂等键',
    ],
    outputArtifact: 'Intake Record',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    state: 'VALIDATING',
    stateZh: '校验字段与归属',
    description: '校验必填结构字段、工作区权限，并执行语义去重与关联检测。',
    entryCondition: 'Intake Record 已创建',
    exitCondition: '必填字段完整且归属明确',
    executionDetails: [
      '校验必填字段及字段类型合法性',
      '校验项目和工作空间是否存在及创建者权限',
      '检索相似活跃工单：区分 Duplicate、Related、Continuation 和 New',
    ],
    outputArtifact: 'Validation Report + Scope Binding',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    state: 'WAITING_INPUT',
    stateZh: '等待用户补充登记信息',
    description: '发现必要登记字段缺失（如目标项目、截止时间），挂起等待用户补充。',
    entryCondition: '存在必要登记字段缺失',
    exitCondition: '用户补充信息或超时自动废弃',
    executionDetails: [
      '生成最小且明确的补充问题列表',
      '挂起进入 PM Agent Queue',
      '收到用户补充后合并回 Intake Record',
    ],
    outputArtifact: 'Clarification Prompt / Updated Intake Record',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    state: 'NORMALIZING',
    stateZh: '统一字段与风险分级',
    description: '对类型、优先级、时间与术语格式进行标准化，打上敏感风险标签。',
    entryCondition: '基础校验通过',
    exitCondition: '标准字段和 Context Message 生成完成',
    executionDetails: [
      '统一任务类型 (Feature/Bug/Research) 与优先级 (Critical/High/Med/Low)',
      '时间字段转为 ISO 8601 标准时间',
      '打上风险标签 (如 SECURITY_SENSITIVE, PROD_IMPACT)',
      '构建给 PM Agent 的 Context Message',
    ],
    outputArtifact: 'Normalized Fields + Risk Labels',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    state: 'NORMALIZED',
    stateZh: '已形成标准任务请求',
    description: '固化 Normalized Task Request 实体，生成队列路由消息与幂等分发包。',
    entryCondition: '规范化与风险打标完成',
    exitCondition: '成功写入 PM Agent Queue',
    executionDetails: [
      '固化 Normalized Task Request',
      '保存原始输入与规范化字段之间的映射',
      '根据项目、任务类型和优先级选择 PM Agent Queue',
    ],
    outputArtifact: 'Normalized Task Request JSON',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    state: 'READY_FOR_UNDERSTANDING',
    stateZh: '已就绪进入 Phase 2',
    description: '消息成功进入 PM Agent 待办队列，等待 PM Agent 领取进行深度需求分析。',
    entryCondition: '队列写入成功',
    exitCondition: 'PM Agent 成功领取请求',
    executionDetails: [
      '将任务暴露给 Project Manager Agent',
      '记录 Queue Position 和等待时间',
      '生成 task.claimed_for_understanding 领取事件',
    ],
    outputArtifact: 'PM Queue Dispatch Package',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const SAMPLE_PHASE_1_ARTIFACT = {
  "task_id": "TASK-001",
  "intent_id": "INT-001",
  "request_id": "REQ-001",
  "workspace_id": "WS-001",
  "project_id": "PRJ-IDENTITY",
  "requester_id": "USER-001",
  "type": "Feature",
  "priority": "High",
  "goal": "Implement OAuth Login",
  "constraints": [
    "OAuth2",
    "JWT",
    "Existing User DB"
  ],
  "acceptance": [
    "Login API works",
    "Token refresh works",
    "Automated tests pass"
  ],
  "risk_labels": [
    "SECURITY_SENSITIVE"
  ],
  "related_tasks": [
    "TASK-087"
  ],
  "deduplication_result": "RELATED",
  "intake_status": "READY_FOR_UNDERSTANDING",
  "context_message": {
    "message_type": "TASK_INTAKE_CONTEXT",
    "from_phase": 1,
    "to_phase": 2,
    "summary": "OAuth Login feature request normalized and ready for PM analysis"
  }
};

// ----------------------------------------------------------------------
// PHASE 2 SPECS
// ----------------------------------------------------------------------
export const PHASE_2_CHECKLIST_ITEMS: PhaseSpecItem[] = [
  {
    id: '2.1',
    name: '领取规范化任务',
    nameEn: 'Claim Normalized Task',
    component: 'Project Manager Agent',
    input: 'Normalized Task Request',
    inputDesc: 'Phase 1 产出的规范化请求',
    processing: '锁定理解任务并加载 Intake Context，启动 PM 分析 Session',
    output: 'PM Analysis Session',
    stateTransition: 'READY_FOR_UNDERSTANDING → ANALYZING_INTENT',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '2.2',
    name: '重建问题背景',
    nameEn: 'Reconstruct Problem Context',
    component: 'Context Analysis Agent',
    input: 'Request + Context',
    inputDesc: '请求字段与历史上下文',
    processing: '理解系统现状、问题来源、业务痛点和真实业务背景',
    output: 'Problem Statement',
    stateTransition: 'ANALYZING_INTENT',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: '2.3',
    name: '提炼核心目标',
    nameEn: 'Refine Core Goal',
    component: 'Goal Reasoning Agent',
    input: 'Goal + Acceptance',
    inputDesc: '请求目标与期望结果',
    processing: '消除模糊表象，区分表面请求与最终业务目标，构建 Goal Model',
    output: 'Goal Model',
    stateTransition: 'ANALYZING_INTENT',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: '2.4',
    name: '定义任务范围',
    nameEn: 'Define Task Scope',
    component: 'Scope Analyzer',
    input: 'Goal + Project Context',
    inputDesc: '目标模型 + 项目工程上下文',
    processing: '清晰划定 In Scope、Out of Scope 以及与其他模块的系统边界',
    output: 'Scope Model',
    stateTransition: 'ANALYZING_INTENT',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    id: '2.5',
    name: '识别约束与假设',
    nameEn: 'Extract Constraints & Assumptions',
    component: 'Constraint Analyst',
    input: 'Request + Context',
    inputDesc: '工程规范与环境约束',
    processing: '区分技术硬约束、业务软约束、既成事实与待验证技术假设',
    output: 'Constraint & Assumption Set',
    stateTransition: 'ANALYZING_INTENT',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: '2.6',
    name: '解析验收标准',
    nameEn: 'Interpret Acceptance Criteria',
    component: 'Acceptance Interpreter',
    input: 'Acceptance Criteria',
    inputDesc: '原始完成描述',
    processing: '把模糊的完成描述转换为具象化、可自动化断言与验证的结果模型',
    output: 'Acceptance Model',
    stateTransition: 'ANALYZING_INTENT',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '2.7',
    name: '识别风险与依赖线索',
    nameEn: 'Identify Risks & Dependency Hints',
    component: 'Risk Analysis Agent',
    input: '全部理解数据',
    inputDesc: '全量理解模型字段',
    processing: '标记权限变更、外部依赖系统、未知风险与需人工确认的安全门禁',
    output: 'Risk Register',
    stateTransition: 'ANALYZING_INTENT',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '2.8',
    name: '检测歧义和冲突',
    nameEn: 'Detect Ambiguity & Conflict',
    component: 'Understanding Validator',
    input: 'Goal + Scope + Constraints',
    inputDesc: '目标、范围与约束集',
    processing: '检测目标冲突、范围遗漏、循环矛盾和不可验证的标准',
    output: 'Ambiguity Report',
    stateTransition: 'ANALYZING_INTENT → RESOLVING_AMBIGUITY',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: '2.9',
    name: '请求澄清（可选）',
    nameEn: 'Clarify with Stakeholder',
    component: 'PM Clarification Agent',
    input: 'Ambiguity Report',
    inputDesc: '关键歧义与冲突报告',
    processing: '向业务方或负责人提出会根本影响架构方案的关键问答',
    output: 'Clarified Understanding',
    stateTransition: 'RESOLVING_AMBIGUITY',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '2.10',
    name: '生成理解模型',
    nameEn: 'Generate Understanding Package',
    component: 'Project Manager Agent',
    input: 'Validated Understanding',
    inputDesc: '全量校验通过的理解数据',
    processing: '固化 Task Understanding Model 并生成 Phase 3 专用的 Context Message',
    output: 'Understanding Package',
    stateTransition: 'UNDERSTOOD → READY_FOR_DECOMPOSITION',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const PHASE_2_STATE_MACHINE_ITEMS: PhaseStateMachineItem[] = [
  {
    state: 'UNDERSTANDING_PENDING',
    stateZh: '等待 PM Agent 领取',
    description: '任务处于 PM 待办队列，按优先级排序，锁定防止并发修改。',
    entryCondition: 'Phase 1 路由成功并入队',
    exitCondition: 'PM Agent 成功认领 Session',
    executionDetails: [
      '将任务放入 PM Agent 待分析队列',
      '按优先级和 SLA 排序',
      '锁定模型版本防止并发冲突',
    ],
    outputArtifact: 'Queued Understanding Session',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    state: 'ANALYZING_INTENT',
    stateZh: '深度理解意图与约束',
    description: 'PM Agent 综合分析问题背景、提取真实目标、定义 In/Out Scope 与 DoD。',
    entryCondition: '任务领取成功',
    exitCondition: '初步理解模型各要素推导完成',
    executionDetails: [
      '阅读 Phase 1 Intake Context Message 与原始 Prompt',
      '提取用户真正目标与业务价值',
      '划定 In Scope 与 Out of Scope 边界',
      '梳理硬约束、软约束与待验证假设',
    ],
    outputArtifact: 'Draft Understanding Model',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    state: 'RESOLVING_AMBIGUITY',
    stateZh: '处理关键歧义与冲突',
    description: '分析器发现目标冲突或关键参数缺失，评估影响并决定是否需要人工澄清。',
    entryCondition: '校验器检测到歧义或矛盾',
    exitCondition: '形成显式安全假设或触发澄清交互',
    executionDetails: [
      '评估冲突影响：低影响项记录显式 Assumption',
      '高影响项（涉及权限、成本、核心范围）触发问询',
    ],
    outputArtifact: 'Ambiguity Resolution Decision',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    state: 'NEEDS_CLARIFICATION',
    stateZh: '等待负责人补充澄清',
    description: '挂起任务并向负责人发出关键决策提问，合并答案后重新进入分析。',
    entryCondition: '存在阻断方案制定的高风险歧义',
    exitCondition: '收到负责人有效补充回答',
    executionDetails: [
      '生成精简且直击核心的提问列表',
      '暂停向 Phase 3 流转',
      '合并用户反馈并更新模型',
    ],
    outputArtifact: 'Clarification Dialog / Updated Model',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    state: 'VALIDATING_UNDERSTANDING',
    stateZh: '校验理解模型完整性',
    description: '检查 Goal 是否精炼、Scope 是否明确、约束与标准是否可验证。',
    entryCondition: '各要素提炼完毕',
    exitCondition: '完整性与一致性检验 100% 通过',
    executionDetails: [
      'Goal 是否可以用一句话完整表达',
      'In Scope 与 Out of Scope 边界是否无重叠',
      '验收标准是否具备可验证性 (Testability)',
    ],
    outputArtifact: 'Validation Sign-off',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    state: 'UNDERSTOOD',
    stateZh: '任务理解模型已确认',
    description: '固化当前 Understanding Version，生成给 Phase 3 拆解使用的上下文包。',
    entryCondition: '模型校验全面通过',
    exitCondition: '生成标准 Context Message',
    executionDetails: [
      '固化 Understanding Version 快照',
      '构建 Task Understanding Context Message',
      '标记需在执行期验证的假设列表',
    ],
    outputArtifact: 'Task Understanding Model JSON',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    state: 'READY_FOR_DECOMPOSITION',
    stateZh: '已就绪进入 Phase 3 拆解',
    description: '理解包写入 Phase 3 待办队列，等待 Task Decomposition Agent 领取。',
    entryCondition: 'Understanding Package 保存成功',
    exitCondition: 'Phase 3 Decomposition Agent 领取',
    executionDetails: [
      '写入 Phase 3 队列并通知 Decomposer',
      '保持模型只读锁定',
      '记录完成时间戳与审计信息',
    ],
    outputArtifact: 'Decomposition Dispatch Envelope',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const SAMPLE_PHASE_2_ARTIFACT = {
  "understanding_id": "UND-001",
  "task_id": "TASK-001",
  "version": 1,
  "problem_statement": "The product lacks a secure OAuth login flow integrated with the existing user database.",
  "goal": "Provide secure OAuth login and token refresh without replacing the existing user database.",
  "scope": {
    "in_scope": [
      "OAuth authorization flow",
      "JWT issuance",
      "Token refresh",
      "Automated login tests"
    ],
    "out_of_scope": [
      "User registration redesign",
      "Full authorization model redesign"
    ]
  },
  "constraints": [
    { "type": "HARD", "description": "Use the existing user database" },
    { "type": "HARD", "description": "Support OAuth2" }
  ],
  "assumptions": [
    { "description": "Existing user IDs can map to OAuth identities", "validation_required": true }
  ],
  "acceptance_model": [
    "Authorization success and failure paths are testable",
    "JWT can be issued and validated",
    "Expired token can be refreshed",
    "Regression tests pass"
  ],
  "risks": [
    { "type": "SECURITY", "description": "Token leakage or invalid identity mapping", "human_gate_required": true }
  ],
  "status": "READY_FOR_DECOMPOSITION",
  "context_message": {
    "message_type": "TASK_UNDERSTANDING_CONTEXT",
    "from_phase": 2,
    "to_phase": 3,
    "must_preserve": [
      "goal",
      "hard_constraints",
      "acceptance_model",
      "unverified_assumptions"
    ]
  }
};

// ----------------------------------------------------------------------
// PHASE 3 SPECS
// ----------------------------------------------------------------------
export const PHASE_3_CHECKLIST_ITEMS: PhaseSpecItem[] = [
  {
    id: '3.1',
    name: '读取理解模型',
    nameEn: 'Load Understanding Model',
    component: 'Task Decomposition Agent',
    input: 'Task Understanding Model',
    inputDesc: 'Phase 2 产出的完整理解模型',
    processing: '加载目标、范围、约束和验收标准，初始化 Decomposition Session',
    output: 'Decomposition Session',
    stateTransition: 'READY_FOR_DECOMPOSITION → DECOMPOSING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '3.2',
    name: '选择拆解策略',
    nameEn: 'Select Decomposition Strategy',
    component: 'Decomposition Planner',
    input: 'Goal + Task Type',
    inputDesc: '业务目标与任务大类',
    processing: '选择按阶段 (Stage)、模块 (Module)、交付物 (Deliverable) 或能力角色拆解',
    output: 'Decomposition Strategy',
    stateTransition: 'DECOMPOSING',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: '3.3',
    name: '识别主要交付物',
    nameEn: 'Identify Final Deliverables',
    component: 'Deliverable Analyzer',
    input: 'Goal + Acceptance Model',
    inputDesc: '目标与可验证验收模型',
    processing: '从最终结果和 DoD 反推工程实施必须产出的关键交付物集合',
    output: 'Deliverable Set',
    stateTransition: 'DECOMPOSING',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    id: '3.4',
    name: '生成候选子任务',
    nameEn: 'Generate Candidate Subtasks',
    component: 'Task Decomposition Agent',
    input: 'Deliverables + Scope',
    inputDesc: '交付物集与 In-Scope 范围',
    processing: '将庞大工作划分为可由单一 Agent 独立执行的候选任务单元',
    output: 'Candidate Task Set',
    stateTransition: 'DECOMPOSING',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: '3.5',
    name: '定义任务契约',
    nameEn: 'Define Task Contract',
    component: 'Task Contract Builder',
    input: 'Candidate Tasks',
    inputDesc: '候选任务单元',
    processing: '为每项子任务定义明确的输入、执行动作、输出产物和独立 DoD',
    output: 'Task Contract Set',
    stateTransition: 'DECOMPOSING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '3.6',
    name: '继承约束和验收',
    nameEn: 'Propagate Constraints & AC',
    component: 'Constraint Propagator',
    input: 'Parent Constraints',
    inputDesc: '父级硬约束与验收条目',
    processing: '将相关约束与父级验收标准精准分摊与继承到具体子任务中',
    output: 'Scoped Constraints',
    stateTransition: 'DECOMPOSING',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: '3.7',
    name: '标记能力需求',
    nameEn: 'Tag Capability Requirements',
    component: 'Capability Requirement Agent',
    input: 'Task Contracts',
    inputDesc: '任务契约定义',
    processing: '标记子任务所需的专业技能 (如 OAuth2/Backend)、工具权限与上下文要求',
    output: 'Capability Requirements',
    stateTransition: 'DECOMPOSING',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: '3.8',
    name: '检查覆盖度',
    nameEn: 'Validate Goal Coverage',
    component: 'Coverage Validator',
    input: 'Goal + Candidate Tasks',
    inputDesc: '父级目标、范围与子任务清单',
    processing: '检查父级目标、范围和验收标准是否被所有子任务 100% 完整覆盖',
    output: 'Coverage Report',
    stateTransition: 'DECOMPOSING → VALIDATING_BREAKDOWN',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    id: '3.9',
    name: '检查拆解粒度',
    nameEn: 'Validate Task Granularity',
    component: 'Granularity Validator',
    input: 'Candidate Tasks',
    inputDesc: '子任务集合',
    processing: '检查是否存在过大（需二次拆分）、过小（无独立价值）、重复或不可验收的任务',
    output: 'Granularity Report',
    stateTransition: 'VALIDATING_BREAKDOWN',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '3.10',
    name: '生成拆解结果',
    nameEn: 'Generate Task Breakdown',
    component: 'Task Decomposition Agent',
    input: 'Validated Tasks',
    inputDesc: '全量校验合规的子任务',
    processing: '固化 Task Breakdown 集合并生成每个子任务的 Context Message 模板',
    output: 'Task Breakdown',
    stateTransition: 'BREAKDOWN_READY → READY_FOR_DEPENDENCY_PLANNING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const PHASE_3_STATE_MACHINE_ITEMS: PhaseStateMachineItem[] = [
  {
    state: 'DECOMPOSITION_PENDING',
    stateZh: '等待拆解 Agent 领取',
    description: 'Phase 2 理解模型已固化，初始化拆解会话，锁定目标与范围版本。',
    entryCondition: 'Phase 2 输出已就绪',
    exitCondition: 'Decomposition Agent 成功领取',
    executionDetails: [
      '保存 Phase 2 Understanding Version',
      '为拆解任务分配 Decomposition Session',
      '锁定目标、范围和硬约束版本',
    ],
    outputArtifact: 'Locked Decomposition Session',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    state: 'DECOMPOSING',
    stateZh: '正在生成任务结构与契约',
    description: '反推交付物，按策略划分子任务，为每个任务编写 Task Contract 与 DoD。',
    entryCondition: 'Agent 领取成功',
    exitCondition: '候选子任务及 Task Contracts 完成',
    executionDetails: [
      '从最终交付物向前反推所需工作',
      '为每个任务编写 Task Contract (Input/Action/Output/DoD)',
      '提取能力、工具、权限和上下文需求',
    ],
    outputArtifact: 'Draft Candidate Subtasks',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    state: 'VALIDATING_BREAKDOWN',
    stateZh: '正在检查覆盖度与粒度',
    description: '校验子任务是否覆盖所有验收标准，检查粒度是否适中，排除冗余与遗漏。',
    entryCondition: '候选任务契约形成',
    exitCondition: '校验通过或触发重拆 / PM 决策',
    executionDetails: [
      '每项父级目标是否至少被一个子任务覆盖',
      '每条验收标准是否有明确的实现或验证任务',
      '是否存在过大或琐碎的无价值子任务',
    ],
    outputArtifact: 'Breakdown Validation Report',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    state: 'REPLAN_REQUIRED',
    stateZh: '需调整拆解结构 (Split/Merge)',
    description: '存在过大、过小、重复或遗漏项，执行自动 Split/Merge 重新校验。',
    entryCondition: '校验不通过但可自动重构',
    exitCondition: '重构完成重新提交校验',
    executionDetails: [
      '对过大任务执行 Split 拆解',
      '对过小琐碎步骤执行 Merge 合并',
      '补充未覆盖的验收标准测试任务',
    ],
    outputArtifact: 'Re-split Candidate Tasks',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    state: 'NEEDS_PM_INPUT',
    stateZh: '需 PM Agent 决策范围或粒度',
    description: '遇到重大边界冲突或成本周期影响，需 PM 智能体做出裁决。',
    entryCondition: '无法自动消除拆解冲突',
    exitCondition: 'PM Agent 给出裁决指示',
    executionDetails: [
      '提交 Decomposition Decision Request',
      '裁定交付物是否属于当前范围',
      '决策是否增加探索性 Research Task',
    ],
    outputArtifact: 'PM Escalation Request',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    state: 'BREAKDOWN_READY',
    stateZh: '任务拆解完成',
    description: '子任务清单与契约全部合法，生成 Context 模板与 Goal-to-Subtask 覆盖矩阵。',
    entryCondition: '覆盖度与粒度校验全面通过',
    exitCondition: '输出 Task Breakdown 集合',
    executionDetails: [
      '固化任务编号与 Task Contract (SUB-001, SUB-002...)',
      '生成每个任务的 Context Message 模板',
      '生成 Goal / Acceptance → Subtask 映射矩阵',
    ],
    outputArtifact: 'Task Breakdown JSON',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    state: 'READY_FOR_DEPENDENCY_PLANNING',
    stateZh: '已就绪进入 Phase 4 构图',
    description: 'Task Breakdown 写入 Phase 4 队列，准备进行任务依赖分析与 DAG 图谱构建。',
    entryCondition: 'Task Breakdown 保存成功',
    exitCondition: 'Phase 4 Dependency Planning Agent 领取',
    executionDetails: [
      '将 Task Breakdown 写入 Phase 4 队列',
      '传递所有 Task Contracts 与依赖线索',
      '等待构建有向无环图 (Task Graph)',
    ],
    outputArtifact: 'Task Breakdown Envelope',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const SAMPLE_PHASE_3_ARTIFACT = {
  "breakdown_id": "BRK-001",
  "task_id": "TASK-001",
  "strategy": "DELIVERABLE_AND_CAPABILITY_BASED",
  "tasks": [
    {
      "task_key": "SUB-001",
      "title": "Design OAuth login flow",
      "outputs": ["OAuth flow specification", "Threat considerations"],
      "required_capabilities": ["Architecture", "OAuth2", "Security"],
      "definition_of_done": ["Flow covers success, failure and callback validation"]
    },
    {
      "task_key": "SUB-002",
      "title": "Implement token refresh endpoint",
      "outputs": ["Refresh endpoint", "Unit tests"],
      "required_capabilities": ["Backend", "JWT", "Security Testing"],
      "definition_of_done": ["Refresh success and failure tests pass"]
    },
    {
      "task_key": "SUB-003",
      "title": "Run end-to-end OAuth acceptance tests",
      "outputs": ["Acceptance test report"],
      "required_capabilities": ["QA", "OAuth2"],
      "definition_of_done": ["All acceptance scenarios are evaluated"]
    }
  ],
  "coverage": {
    "goal_coverage": "COMPLETE",
    "acceptance_coverage": "COMPLETE"
  },
  "status": "READY_FOR_DEPENDENCY_PLANNING",
  "context_message": {
    "message_type": "TASK_BREAKDOWN_CONTEXT",
    "from_phase": 3,
    "to_phase": 4,
    "includes": ["task_contracts", "constraint_mapping", "dependency_hints"]
  }
};

// ----------------------------------------------------------------------
// PHASE 4 SPECS
// ----------------------------------------------------------------------
export const PHASE_4_CHECKLIST_ITEMS: PhaseSpecItem[] = [
  {
    id: '4.1',
    name: '导入任务节点',
    nameEn: 'Import Task Nodes',
    component: 'Dependency Planning Agent',
    input: 'Task Breakdown',
    inputDesc: 'Phase 3 产出的子任务集合',
    processing: '将每个 Task Contract 转换为 DAG 图节点并校验唯一性',
    output: 'Task Node Set',
    stateTransition: 'READY_FOR_DEPENDENCY_PLANNING → BUILDING_GRAPH',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '4.2',
    name: '推断数据依赖',
    nameEn: 'Infer Data Dependencies',
    component: 'Dependency Analyzer',
    input: 'Task Inputs / Outputs',
    inputDesc: '任务输入需求与输出产物',
    processing: '根据产物供给与消费关系建立 DATA 依赖边 (Input-Output Binding)',
    output: 'Data Dependency Edges',
    stateTransition: 'BUILDING_GRAPH',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: '4.3',
    name: '识别控制依赖',
    nameEn: 'Identify Control Dependencies',
    component: 'Workflow Planner',
    input: 'Constraints + Gates',
    inputDesc: '安全门禁与评审规则',
    processing: '建立审批、代码评审、集成测试和人工确认等 CONTROL 依赖边',
    output: 'Control Dependency Edges',
    stateTransition: 'BUILDING_GRAPH',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: '4.4',
    name: '识别并行任务',
    nameEn: 'Identify Parallel Groups',
    component: 'Parallelism Analyzer',
    input: 'Task Contracts',
    inputDesc: '依赖拓扑结构',
    processing: '查找无共享前置条件、可同时并行的任务组 (Parallel Groups)',
    output: 'Parallel Groups',
    stateTransition: 'BUILDING_GRAPH',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    id: '4.5',
    name: '创建汇合节点',
    nameEn: 'Create Join Gates',
    component: 'Join Planner',
    input: 'Parallel Groups',
    inputDesc: '并行分支拓扑',
    processing: '定义多分支完成后的汇合条件 (ALL / ANY / QUORUM / MANUAL)',
    output: 'Join Gates',
    stateTransition: 'BUILDING_GRAPH',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    id: '4.6',
    name: '检测循环依赖',
    nameEn: 'Detect Cyclic Dependencies',
    component: 'Cycle Detection Engine',
    input: 'Nodes + Edges',
    inputDesc: '全量图节点与有向边',
    processing: '基于 Tarjan / DFS 算法检测直接或间接环路 (A → B → A)',
    output: 'Cycle Report',
    stateTransition: 'BUILDING_GRAPH → VALIDATING_GRAPH',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '4.7',
    name: '检测不可达节点',
    nameEn: 'Validate Reachability',
    component: 'Reachability Validator',
    input: 'Task Graph',
    inputDesc: '图结构',
    processing: '检查孤立节点、无入口或无出口任务，确保所有任务可达',
    output: 'Reachability Report',
    stateTransition: 'VALIDATING_GRAPH',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: '4.8',
    name: '计算关键路径',
    nameEn: 'Calculate Critical Path',
    component: 'Critical Path Analyzer',
    input: 'Validated DAG',
    inputDesc: '合法 DAG 图谱',
    processing: '估算最长执行耗时路径、高风险瓶颈节点与调度优先级',
    output: 'Critical Path',
    stateTransition: 'VALIDATING_GRAPH',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: '4.9',
    name: '处理图冲突',
    nameEn: 'Handle Graph Conflicts',
    component: 'Graph Repair Agent',
    input: 'Validation Reports',
    inputDesc: '环路与不可达报错报告',
    processing: '删除冗余错误边、反转错误依赖或退回 Phase 3 重新拆解',
    output: 'Repaired Graph',
    stateTransition: 'GRAPH_CONFLICT → BUILDING_GRAPH',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: '4.10',
    name: '固化图版本',
    nameEn: 'Solidify Task Graph Version',
    component: 'Task Graph Manager',
    input: 'Validated Graph',
    inputDesc: '全量合法 DAG 图谱',
    processing: '生成图版本、调度元数据、Context 路由表并发布就绪',
    output: 'Task Graph',
    stateTransition: 'GRAPH_READY → READY_FOR_AGENT_MATCHING',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const PHASE_4_STATE_MACHINE_ITEMS: PhaseStateMachineItem[] = [
  {
    state: 'GRAPH_PENDING',
    stateZh: '等待构图 Agent 领取',
    description: 'Phase 3 Task Breakdown 导入完成，校验任务键唯一性并初始化图版本。',
    entryCondition: 'Phase 3 输出就绪',
    exitCondition: 'Planner Agent 成功认领',
    executionDetails: [
      '读取 Task Breakdown 实体',
      '校验任务键唯一性',
      '创建新的 graph_version',
      '保存 Phase 3 Context Message',
    ],
    outputArtifact: 'Graph Session Initialized',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    state: 'BUILDING_GRAPH',
    stateZh: '正在构建节点、依赖与汇合点',
    description: '推断 DATA、CONTROL、CONTEXT 依赖边，定义并行组与 Join 汇合门禁。',
    entryCondition: '任务集合导入成功',
    exitCondition: '初始图拓扑建立完成',
    executionDetails: [
      '根据输入输出匹配建立 Data Dependency',
      '根据审批要求建立 Control Dependency',
      '识别并行组并配置 Join Gate (ALL/ANY)',
    ],
    outputArtifact: 'Draft Graph Topology',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  },
  {
    state: 'VALIDATING_GRAPH',
    stateZh: '正在验证图合法性 (DAG)',
    description: '执行环路检测与全节点可达性检查，计算关键路径 (Critical Path)。',
    entryCondition: '初始图形成',
    exitCondition: '校验通过或发现拓扑冲突',
    executionDetails: [
      '检测是否存在 A → B → A 循环依赖',
      '检查是否存在无法到达的孤立节点',
      '计算关键路径与高风险节点',
    ],
    outputArtifact: 'Graph Validation Report',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  },
  {
    state: 'GRAPH_CONFLICT',
    stateZh: '存在循环依赖或孤立节点',
    description: '检测到环路或不可满足输入，尝试自动修复或退回 Phase 3 重新拆分。',
    entryCondition: '图校验失败',
    exitCondition: '修复完成或退回 Phase 3',
    executionDetails: [
      '检查错误依赖方向并删除反转错误边',
      '抽取共享前置任务解决间接循环',
      '无法修复时退回 Phase 3 REDECOMPOSITION',
    ],
    outputArtifact: 'Conflict Diagnosis Report',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    state: 'GRAPH_READY',
    stateZh: '图结构合法且已固化',
    description: 'DAG 图谱验证合规，计算各节点依赖计数并生成 Context 路由表。',
    entryCondition: '环路和可达性检查 100% 通过',
    exitCondition: '图版本持久化成功',
    executionDetails: [
      '固化节点、边、门禁和并行组',
      '计算 Root Nodes、Leaf Nodes 和 Critical Path',
      '为每个节点计算 unmet_dependency_count',
      '生成后继任务 Context 路由表',
    ],
    outputArtifact: 'Task Graph DAG JSON',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    state: 'READY_FOR_AGENT_MATCHING',
    stateZh: '已就绪进入 Phase 5 能力匹配',
    description: '图谱发布至 Phase 5，关键路径节点打上高优先级标记，准备匹配智能体。',
    entryCondition: 'Task Graph 发布成功',
    exitCondition: 'Phase 5 Agent Capability Matching 领取',
    executionDetails: [
      '将图节点及能力需求发送至 Phase 5',
      '关键路径节点标记为高匹配优先级',
      '保留未分配的 Agent Slot 等待调度',
    ],
    outputArtifact: 'Agent Matching Dispatch Package',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
];

export const SAMPLE_PHASE_4_ARTIFACT = {
  "graph_id": "GRAPH-001",
  "task_id": "TASK-001",
  "version": 1,
  "nodes": [
    { "task_key": "SUB-001", "type": "TASK", "dependency_count": 0 },
    { "task_key": "SUB-002", "type": "TASK", "dependency_count": 1 },
    { "task_key": "SUB-004", "type": "TASK", "dependency_count": 1 },
    { "task_key": "JOIN-001", "type": "JOIN", "policy": "ALL" },
    { "task_key": "SUB-003", "type": "TASK", "dependency_count": 1 }
  ],
  "edges": [
    { "from": "SUB-001", "to": "SUB-002", "type": "DATA" },
    { "from": "SUB-001", "to": "SUB-004", "type": "DATA" },
    { "from": "SUB-002", "to": "JOIN-001", "type": "CONTROL" },
    { "from": "SUB-004", "to": "JOIN-001", "type": "CONTROL" },
    { "from": "JOIN-001", "to": "SUB-003", "type": "CONTROL" }
  ],
  "root_nodes": ["SUB-001"],
  "leaf_nodes": ["SUB-003"],
  "parallel_groups": [["SUB-002", "SUB-004"]],
  "critical_path": ["SUB-001", "SUB-002", "JOIN-001", "SUB-003"],
  "validation": {
    "acyclic": true,
    "all_nodes_reachable": true
  },
  "status": "READY_FOR_AGENT_MATCHING",
  "context_message": {
    "message_type": "TASK_GRAPH_CONTEXT",
    "from_phase": 4,
    "to_phase": 5,
    "includes": ["nodes", "capability_requirements", "critical_path"]
  }
};
