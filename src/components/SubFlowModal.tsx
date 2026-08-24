import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  GitCommit, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  FileCode, 
  Terminal, 
  ShieldCheck, 
  Cpu, 
  Sliders, 
  Copy, 
  Check, 
  ExternalLink,
  Layers,
  Clock
} from 'lucide-react';
import { SubWorkflowSpec, Agent, WorkItem, DepartmentInfo } from '../types/workflow';
import { DynamicIcon } from './DynamicIcon';

interface SubFlowModalProps {
  spec: SubWorkflowSpec;
  agents: Agent[];
  departments: DepartmentInfo[];
  workItems: WorkItem[];
  onClose: () => void;
  onOpenWorkItem: (item: WorkItem) => void;
}

export const SubFlowModal: React.FC<SubFlowModalProps> = ({
  spec,
  agents,
  departments,
  workItems,
  onClose,
  onOpenWorkItem,
}) => {
  const [activeStepId, setActiveStepId] = useState<string>(spec.steps[0]?.id || '');
  const [isSimulatingStep, setIsSimulatingStep] = useState(false);
  const [simulatedStepId, setSimulatedStepId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeStep = spec.steps.find(s => s.id === activeStepId) || spec.steps[0];
  const stepAgent = agents.find(a => a.role === activeStep?.agentRole);
  const relevantWorkItems = workItems.filter(w => w.subWorkflowId === spec.id || w.flowNodeId === spec.nodeId);

  const handleCopyPrompt = () => {
    if (!activeStep) return;
    navigator.clipboard.writeText(activeStep.promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateStep = (stepId: string) => {
    setIsSimulatingStep(true);
    setSimulatedStepId(stepId);
    setTimeout(() => {
      setIsSimulatingStep(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        
        {/* Modal Top Header */}
        <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-200">
                  {spec.category}
                </span>
                <span className="text-xs text-slate-400 font-mono font-medium">NODE-ID: {spec.nodeId}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                {spec.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns (Left: Interactive Step Flow, Right: Step Detail & Artifacts) */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          
          {/* Left Column: Sub-workflow Graph & Dispatch Policies */}
          <div className="w-full md:w-5/12 border-r border-slate-200 p-5 space-y-5 bg-slate-50/70 overflow-y-auto">
            {/* Overview Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-600" />
                <span>执行总览与调度语义 (Overview)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {spec.overview}
              </p>
            </div>

            {/* Dispatch Policy & Routing Spec */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sliders size={14} className="text-emerald-600" />
                  <span>任务分派与路由策略 (Dispatch Policy)</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold border border-emerald-200">
                  {spec.dispatchPolicy.strategy}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="text-[11px] font-semibold text-slate-700">技能匹配规则：</div>
                <div className="flex flex-wrap gap-1">
                  {spec.dispatchPolicy.criteria.map((c, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                      ✓ {c}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-100">
                  <span>兜底治理节点:</span>
                  <span className="font-mono font-bold text-purple-700">
                    {agents.find(a => a.id === spec.dispatchPolicy.fallbackAgentId)?.name || 'Human Lead'}
                  </span>
                </div>
              </div>
            </div>

            {/* Step Pipeline List (Vertical DAG) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 px-1">
                <span>流水线执行步骤 ({spec.steps.length} 阶)</span>
                <span className="text-[10px] text-slate-400 font-medium">点击切换查看详情</span>
              </div>

              <div className="space-y-2">
                {spec.steps.map((step, idx) => {
                  const isSelected = activeStepId === step.id;
                  const isSim = isSimulatingStep && simulatedStepId === step.id;
                  const agentObj = agents.find(a => a.role === step.agentRole);

                  return (
                    <div
                      key={step.id}
                      onClick={() => setActiveStepId(step.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all shadow-2xs ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-100 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {step.stepNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {step.title}
                          </span>
                        </div>
                        {step.executionStatus === 'success' && (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-500">
                        <span className="font-mono font-bold text-indigo-700">
                          {agentObj?.name || step.agentRole}
                        </span>
                        <span className="font-mono text-slate-400">
                          {step.durationMs}ms
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quality Gates Section */}
            {spec.qualityGates && (
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>自动化质量门禁 (Quality Gates)</span>
                </h4>
                <div className="space-y-1.5">
                  {spec.qualityGates.map((gate, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="text-slate-700 font-medium">{gate.name}</span>
                      <span className="font-mono text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                        {gate.condition}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Step Deep Dive, LLM Prompt & Output Artifact */}
          <div className="w-full md:w-7/12 p-5 space-y-5 overflow-y-auto bg-white">
            {activeStep ? (
              <>
                {/* Step Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 font-mono">
                        STEP {activeStep.stepNumber} / {spec.steps.length}
                      </span>
                      <span className="text-xs text-slate-300">•</span>
                      <span className="text-xs text-slate-800 font-bold">
                        {activeStep.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {activeStep.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSimulateStep(activeStep.id)}
                    disabled={isSimulatingStep}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                  >
                    {isSimulatingStep && simulatedStepId === activeStep.id ? (
                      <>
                        <Clock size={13} className="animate-spin" />
                        <span>演练执行中...</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>单步演练 (Simulate)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Assigned Agent Profile Card */}
                {stepAgent && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={stepAgent.avatar}
                        alt={stepAgent.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {stepAgent.name}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-mono font-bold">
                            {stepAgent.model}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {stepAgent.title}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-medium">历史完成</div>
                      <div className="text-xs font-mono font-bold text-emerald-700">
                        {stepAgent.totalTasksCompleted} 任务
                      </div>
                    </div>
                  </div>
                )}

                {/* Algorithm Logic Spec */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Cpu size={14} className="text-indigo-600" />
                    <span>底层算法与决策逻辑 (Algorithm Spec)</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-300 shadow-inner">
                    {activeStep.algorithmLogic}
                  </div>
                </div>

                {/* System Prompt Template */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Terminal size={14} className="text-amber-600" />
                      <span>LLM 系统提示词与指令模板 (System Prompt Chaining)</span>
                    </div>
                    <button
                      onClick={handleCopyPrompt}
                      className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1 rounded hover:bg-slate-100 font-medium"
                    >
                      {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copied ? '已复制' : '复制Prompt'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                    {activeStep.promptTemplate}
                  </pre>
                </div>

                {/* Sample Output Artifact */}
                {activeStep.sampleOutput && (
                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCode size={14} className="text-emerald-600" />
                      <span>实时产出物结构体 (Output Artifact: {activeStep.outputArtifact})</span>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap shadow-inner">
                      {activeStep.sampleOutput}
                    </pre>
                  </div>
                )}

                {/* Associated Work Items */}
                {relevantWorkItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold text-slate-800">
                      当前流转关联的 Work Items ({relevantWorkItems.length})
                    </div>
                    <div className="space-y-1.5">
                      {relevantWorkItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            onClose();
                            onOpenWorkItem(item);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                              {item.id}
                            </span>
                            <span className="text-xs text-slate-800 font-medium truncate">{item.title}</span>
                          </div>
                          <ExternalLink size={13} className="text-slate-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                暂无步骤详情
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Multi-Agent Swarm Orchestrator Engine Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            关闭窗口
          </button>
        </div>

      </div>
    </div>
  );
};
