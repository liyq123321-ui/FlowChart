export type AgentRole = 
  | 'orchestrator'
  | 'decomposer'
  | 'ui_ux_designer'
  | 'frontend_lead'
  | 'backend_architect'
  | 'dba_specialist'
  | 'qa_automation'
  | 'security_auditor'
  | 'devops_release'
  | 'human_lead';

export type DepartmentType = 
  | 'pm_office'
  | 'product_design'
  | 'engineering_core'
  | 'quality_assurance'
  | 'devops_infra'
  | 'human_governance';

export type WorkItemStatus = 
  | 'backlog'
  | 'in_triage'
  | 'decomposing'
  | 'assigned'
  | 'in_progress'
  | 'code_review'
  | 'qa_testing'
  | 'staging'
  | 'done';

export type WorkItemPriority = 'critical' | 'high' | 'medium' | 'low';
export type WorkItemType = 'epic' | 'feature' | 'task' | 'subtask' | 'bug' | 'qa_gate';

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  title: string;
  role: AgentRole;
  department: DepartmentType;
  model: string; // e.g. 'Gemini 2.5 Pro', 'Claude 3.7 Sonnet', 'GPT-4o', 'DeepSeek V3'
  status: 'idle' | 'active' | 'reviewing' | 'blocked' | 'completed';
  currentTaskId?: string;
  capacityScore: number; // 0 - 100
  totalTokensUsed: number;
  totalTasksCompleted: number;
  avgLatencyMs: number;
  isHuman: boolean;
  systemPrompt: string;
  skills: string[];
}

export interface WorkItemLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  agentAvatar: string;
  phase: string;
  message: string;
  detail?: string;
  artifact?: {
    type: 'code' | 'json' | 'markdown' | 'test_report' | 'diff' | 'diagram';
    title: string;
    content: string;
    language?: string;
  };
}

export interface WorkItem {
  id: string; // e.g., "WI-101", "EPIC-01"
  title: string;
  description: string;
  type: WorkItemType;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  storyPoints: number;
  departmentId: DepartmentType;
  assigneeId: string; // Agent ID or Human ID
  parentId?: string;
  childIds: string[];
  dependsOnIds: string[];
  humanReviewRequired: boolean;
  humanApproved?: boolean;
  progressPercent: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  metrics: {
    tokensUsed: number;
    estimatedCostUsd: number;
    executionTimeSeconds: number;
    codeLinesGenerated: number;
    testCasesPassed: number;
    testCasesTotal: number;
  };
  logs: WorkItemLog[];
  flowNodeId?: string;
  subWorkflowId?: string;
}

export interface SubWorkflowStep {
  id: string;
  stepNumber: number;
  title: string;
  agentRole: AgentRole;
  description: string;
  algorithmLogic: string;
  promptTemplate: string;
  inputParams: string[];
  outputArtifact: string;
  executionStatus: 'pending' | 'running' | 'success' | 'skipped' | 'failed';
  sampleOutput?: string;
  durationMs?: number;
}

export interface SubWorkflowSpec {
  id: string;
  nodeId: string;
  title: string;
  subtitle: string;
  category: string;
  overview: string;
  dispatchPolicy: {
    strategy: 'Skill-Weight Routing' | 'Load-Balanced DAG' | 'Consensus Voting' | 'Human-in-the-Loop Gate';
    criteria: string[];
    fallbackAgentId: string;
    timeoutSeconds: number;
  };
  steps: SubWorkflowStep[];
  nestedConnections: Array<{ from: string; to: string; condition?: string }>;
  qualityGates: Array<{ name: string; condition: string; autoPass: boolean }>;
}

export interface FlowNode {
  id: string;
  label: string;
  labelEn?: string;
  labelZh?: string;
  department: DepartmentType;
  category: 'input' | 'decomposer' | 'dept_hub' | 'agent_exec' | 'gate' | 'deploy' | 'monitor' | 'decision' | 'reference' | 'header' | 'output';
  shapeType?: 'rectangle' | 'rhombus' | 'reference_box' | 'header' | 'terminal' | 'diamond';
  fillColor?: string;
  strokeColor?: string;
  textColor?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  iconName: string;
  status: 'idle' | 'running' | 'completed' | 'paused' | 'error';
  progress: number;
  activeWorkItemId?: string;
  assignedAgentId?: string;
  summary: string;
  summaryEn?: string;
  summaryZh?: string;
  bulletItems?: string[];
  subWorkflowId?: string;
  hasSubDiagram?: boolean;
  subDiagramId?: string;
  inputs?: string[];
  outputs?: string[];
  tags?: string[];
  badge?: string;
  badgeZh?: string;
  badgeEn?: string;
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  labelEn?: string;
  labelZh?: string;
  condition?: string;
  active?: boolean;
  pulseSpeed?: number;
  type?: 'default' | 'branch' | 'approval' | 'feedback_loop' | 'reference';
  isDashed?: boolean;
  edgeStyle?: 'orthogonal' | 'bezier' | 'straight';
}

export interface DrawioDiagramSpec {
  id: string;
  title: string;
  titleEn: string;
  titleZh: string;
  subtitle: string;
  subtitleEn: string;
  subtitleZh: string;
  parentNodeId?: string;
  diagramCategory: 'root' | 'detail_subflow';
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export interface PageNode {
  id: string;
  title: string;
  icon: string;
  type: 'canvas' | 'kanban' | 'agents' | 'work_items' | 'logs' | 'analytics' | 'nested_flow';
  subflowNodeId?: string;
  parentId?: string;
  badge?: string;
  children?: PageNode[];
}

export interface DepartmentInfo {
  id: DepartmentType;
  name: string;
  chineseName: string;
  color: string;
  borderColor: string;
  bgLight: string;
  leadRole: string;
  description: string;
  iconName: string;
  activeAgentCount: number;
}

export interface WorkflowSimulationState {
  isPlaying: boolean;
  speed: 1 | 2 | 5;
  currentStepIndex: number;
  activeNodeId: string | null;
  activeWorkItemId: string | null;
  historyLogs: WorkItemLog[];
  completedNodeIds: string[];
  scenarioId: string;
  totalTokensSession: number;
  totalCostSession: number;
}
