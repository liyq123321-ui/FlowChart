import React, { useState } from 'react';
import { 
  Agent, 
  DepartmentInfo 
} from '../types/workflow';
import { 
  Bot, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Terminal, 
  Sparkles, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DynamicIcon } from './DynamicIcon';

interface AgentSwarmViewProps {
  agents: Agent[];
  departments: DepartmentInfo[];
}

export const AgentSwarmView: React.FC<AgentSwarmViewProps> = ({
  agents,
  departments,
}) => {
  const [expandedAgentId, setExpandedAgentId] = useState<string | null>(null);

  const toggleExpand = (agentId: string) => {
    setExpandedAgentId(prev => (prev === agentId ? null : agentId));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] text-slate-800 overflow-y-auto p-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Bot size={28} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Agent 组织架构与算力调度矩阵 (Swarm Matrix)</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200">
                10 Active Nodes
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              模拟成熟软件工程团队的职能分工：各专职 Agent 拥有独特的领域提示词工程 (Prompt Chaining)、模型路由算法与权限边界，无缝协同交付企业级软件。
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 px-4 rounded-xl text-xs font-mono">
          <div>
            <div className="text-slate-400 text-[10px] font-bold">TOTAL TOKENS</div>
            <div className="text-emerald-700 font-bold">8.65M Tokens</div>
          </div>
          <div className="w-[1px] h-8 bg-slate-200" />
          <div>
            <div className="text-slate-400 text-[10px] font-bold">AVG LATENCY</div>
            <div className="text-indigo-600 font-bold">840ms</div>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="space-y-6">
        {departments.map(dept => {
          const deptAgents = agents.filter(a => a.department === dept.id);

          return (
            <div key={dept.id} className="space-y-3">
              {/* Department Title */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: dept.color }}
                  />
                  <h3 className="text-sm font-bold text-slate-800">
                    {dept.name} ({dept.chineseName})
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {deptAgents.length} Agents Assigned
                </span>
              </div>

              {/* Department Agent Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deptAgents.map(agent => {
                  const isExpanded = expandedAgentId === agent.id;

                  return (
                    <div
                      key={agent.id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-indigo-400 hover:shadow-md transition-all shadow-xs flex flex-col justify-between"
                    >
                      {/* Top Info */}
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={agent.avatar}
                              alt={agent.name}
                              className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                {agent.name}
                                {agent.isHuman && (
                                  <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">
                                    HUMAN
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-500">{agent.title}</p>
                              <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 inline-block mt-0.5 font-semibold">
                                {agent.model}
                              </span>
                            </div>
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                            agent.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {agent.status}
                          </span>
                        </div>

                        {/* Capacity & Performance Bars */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                            <span>算力并发负载</span>
                            <span className="font-mono text-emerald-700 font-bold">{agent.capacityScore}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 rounded-full"
                              style={{ width: `${agent.capacityScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Telemetry Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono">
                          <div>
                            <span className="text-slate-400 font-medium">TOKENS: </span>
                            <span className="text-slate-800 font-bold">{(agent.totalTokensUsed / 1000).toFixed(0)}k</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">TASKS: </span>
                            <span className="text-slate-800 font-bold">{agent.totalTasksCompleted} 完成</span>
                          </div>
                        </div>

                        {/* Skills Badges */}
                        <div className="flex flex-wrap gap-1">
                          {agent.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Expand System Prompt Accordion */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          onClick={() => toggleExpand(agent.id)}
                          className="w-full py-1 text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 font-semibold transition-colors"
                        >
                          <span>{isExpanded ? '收起系统提示词' : '查看 System Prompt & 思考协议'}</span>
                          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 leading-relaxed max-h-40 overflow-y-auto shadow-inner">
                            {agent.systemPrompt}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
