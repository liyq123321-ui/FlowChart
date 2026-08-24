import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Code2, 
  Terminal, 
  ShieldCheck, 
  UserCheck, 
  Zap, 
  DollarSign, 
  GitBranch, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { WorkItem, Agent, DepartmentInfo, WorkItemStatus } from '../types/workflow';

interface WorkItemDetailModalProps {
  item: WorkItem;
  agents: Agent[];
  departments: DepartmentInfo[];
  allWorkItems: WorkItem[];
  onClose: () => void;
  onUpdateStatus: (itemId: string, newStatus: WorkItemStatus) => void;
  onToggleHumanApproval: (itemId: string) => void;
  onSelectRelatedItem: (item: WorkItem) => void;
}

export const WorkItemDetailModal: React.FC<WorkItemDetailModalProps> = ({
  item,
  agents,
  departments,
  allWorkItems,
  onClose,
  onUpdateStatus,
  onToggleHumanApproval,
  onSelectRelatedItem,
}) => {
  const [activeTab, setActiveTab] = useState<'spec' | 'artifacts' | 'logs' | 'qa'>('spec');
  const [copied, setCopied] = useState(false);

  const assignee = agents.find(a => a.id === item.assigneeId);
  const department = departments.find(d => d.id === item.departmentId);
  const parentItem = allWorkItems.find(w => w.id === item.parentId);
  const childItems = allWorkItems.filter(w => item.childIds.includes(w.id));

  const statusOptions: Array<{ value: WorkItemStatus; label: string; color: string }> = [
    { value: 'backlog', label: 'Backlog 待办', color: 'bg-slate-700' },
    { value: 'in_triage', label: 'Triage 需求分拣', color: 'bg-indigo-600' },
    { value: 'assigned', label: 'Assigned 已指派', color: 'bg-blue-600' },
    { value: 'in_progress', label: 'In Progress 智能编写', color: 'bg-amber-500' },
    { value: 'code_review', label: 'Code Review 代码评审', color: 'bg-purple-600' },
    { value: 'qa_testing', label: 'QA Testing 自动化测试', color: 'bg-emerald-600' },
    { value: 'staging', label: 'Staging 灰度预发', color: 'bg-cyan-600' },
    { value: 'done', label: 'Done 交付完成', color: 'bg-emerald-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        
        {/* Top Header Bar */}
        <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${
              item.type === 'epic' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
              item.type === 'feature' ? 'bg-sky-100 text-sky-700 border border-sky-200' :
              item.type === 'qa_gate' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
              'bg-slate-100 text-slate-700 border border-slate-200'
            }`}>
              {item.id}
            </span>

            <div className="truncate">
              <h2 className="text-sm font-bold text-slate-900 truncate">
                {item.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 font-medium">
                <span>类型: <strong className="text-slate-800 uppercase">{item.type}</strong></span>
                <span>•</span>
                <span>故事点: <strong className="text-indigo-700 font-bold">{item.storyPoints} pts</strong></span>
                <span>•</span>
                <span>所属部门: <strong className="text-slate-800">{department?.name}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Status Dropdown */}
            <select
              value={item.status}
              onChange={e => onUpdateStatus(item.id, e.target.value as WorkItemStatus)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-500 shadow-2xs"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Telemetry Metric Strip */}
        <div className="px-6 py-2.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 overflow-x-auto gap-4">
          <div className="flex items-center gap-1.5">
            <Zap size={14} className="text-amber-500" />
            <span className="font-medium">Token 开销:</span>
            <strong className="text-slate-900 font-mono">
              {item.metrics.tokensUsed > 0 ? `${(item.metrics.tokensUsed / 1000).toFixed(1)}k` : '0'}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-emerald-600" />
            <span className="font-medium">预估成本:</span>
            <strong className="text-emerald-700 font-mono font-bold">
              ${item.metrics.estimatedCostUsd.toFixed(2)}
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 size={14} className="text-indigo-600" />
            <span className="font-medium">产出代码量:</span>
            <strong className="text-slate-900 font-mono">
              {item.metrics.codeLinesGenerated} lines
            </strong>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-purple-600" />
            <span className="font-medium">测试通过率:</span>
            <strong className="text-purple-700 font-mono font-bold">
              {item.metrics.testCasesPassed} / {item.metrics.testCasesTotal}
            </strong>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-6 text-xs font-semibold bg-white">
          <button
            onClick={() => setActiveTab('spec')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'spec'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={14} />
            <span>需求规格与验收准则 (Spec)</span>
          </button>
          <button
            onClick={() => setActiveTab('artifacts')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'artifacts'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 size={14} />
            <span>生成代码与产物 (Artifacts)</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal size={14} />
            <span>Agent 思考与执行追踪 (Logs)</span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-all ${
              activeTab === 'qa'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck size={14} />
            <span>人类治理与放行 (Sign-Off)</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* TAB 1: SPECIFICATION */}
          {activeTab === 'spec' && (
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  任务详细描述 (Mission Description)
                </h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed shadow-2xs">
                  {item.description}
                </p>
              </div>

              {/* Assignee & Department Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                  <div className="text-[11px] text-slate-500 font-medium">当前认领 Agent</div>
                  {assignee ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800">{assignee.name}</div>
                        <div className="text-[10px] text-indigo-700 font-mono font-semibold">{assignee.model}</div>
                        <div className="text-[10px] text-slate-500">{assignee.title}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400">未指派</div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
                  <div className="text-[11px] text-slate-500 font-medium">所属职能部门</div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs"
                      style={{ backgroundColor: `${department?.color}18`, color: department?.color, border: `1px solid ${department?.color}30` }}
                    >
                      {department?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{department?.name}</div>
                      <div className="text-[10px] text-slate-500">{department?.chineseName}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Parent & Child Hierarchy */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GitBranch size={14} className="text-indigo-600" />
                  <span>Jira 敏捷层级关系 (Hierarchy)</span>
                </h4>

                {parentItem && (
                  <div className="text-xs space-y-1">
                    <span className="text-[11px] text-slate-500 font-medium">父级需求 (Parent Epic/Feature):</span>
                    <div
                      onClick={() => onSelectRelatedItem(parentItem)}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{parentItem.id}</span>
                        <span className="text-slate-800 font-medium">{parentItem.title}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  </div>
                )}

                {childItems.length > 0 && (
                  <div className="text-xs space-y-1.5 pt-2">
                    <span className="text-[11px] text-slate-500 font-medium">子任务清单 (Sub-Tasks - {childItems.length}):</span>
                    <div className="space-y-1">
                      {childItems.map(c => (
                        <div
                          key={c.id}
                          onClick={() => onSelectRelatedItem(c)}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">{c.id}</span>
                            <span className="text-slate-800 font-medium">{c.title}</span>
                          </div>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            c.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ARTIFACTS & CODE */}
          {activeTab === 'artifacts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  Agent 自动合成的软件工程产物 (Code & Specs)
                </h4>
                <button
                  onClick={() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded font-medium transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? '已复制' : '复制代码'}</span>
                </button>
              </div>

              {item.logs.some(l => l.artifact) ? (
                item.logs
                  .filter(l => l.artifact)
                  .map((log, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                      <div className="p-2.5 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 font-bold">
                          <Code2 size={14} />
                          <span>{log.artifact?.title}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                          {log.artifact?.type}
                        </span>
                      </div>
                      <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                        {log.artifact?.content}
                      </pre>
                    </div>
                  ))
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
                  暂无独立产物代码，当前工单处于前置就绪阶段。
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AGENT LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-800">
                实时执行追踪与思维流 (Live Execution Traces)
              </h4>

              {item.logs.length > 0 ? (
                <div className="space-y-3">
                  {item.logs.map(log => (
                    <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={log.agentAvatar}
                            alt={log.agentName}
                            className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <span className="text-xs font-bold text-slate-800">{log.agentName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-100">
                            {log.phase}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {log.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                  暂无日志记录
                </div>
              )}
            </div>
          )}

          {/* TAB 4: HUMAN GOVERNANCE & SIGN OFF */}
          {activeTab === 'qa' && (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={16} className="text-purple-600" />
                    <span>人类主管治理与发布放行 (Human Gate)</span>
                  </h4>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded font-mono font-bold ${
                    item.humanApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {item.humanApproved ? '✓ 已签名放行' : '⏳ 等待总监审批'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  作为企业级软件工程治理兜底节点，人类技术总监拥有最终的架构合规、安全风险评估及生产发布一票否决权。
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => onToggleHumanApproval(item.id)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                      item.humanApproved
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-[0.99]'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>
                      {item.humanApproved ? '撤销人类总监放行签名 (Revoke Approval)' : '一键核准并放行至生产部署 (Approve Release)'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <span className="font-mono text-[11px] font-medium">Jira Work Item Key: {item.id}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            完成并关闭
          </button>
        </div>

      </div>
    </div>
  );
};
