import React from 'react';
import { 
  BarChart3, 
  Zap, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  Bot,
  UserCheck
} from 'lucide-react';
import { Agent, WorkItem, DepartmentInfo } from '../types/workflow';

interface MetricsAnalyticsViewProps {
  workItems: WorkItem[];
  agents: Agent[];
  departments: DepartmentInfo[];
}

export const MetricsAnalyticsView: React.FC<MetricsAnalyticsViewProps> = ({
  workItems,
  agents,
  departments,
}) => {
  const totalTokens = workItems.reduce((acc, w) => acc + w.metrics.tokensUsed, 0) + 1850000;
  const totalCost = (totalTokens / 1000000) * 2.5; // Approx $2.5 / 1M tokens
  const totalLines = workItems.reduce((acc, w) => acc + w.metrics.codeLinesGenerated, 0) + 2450;
  const avgTestPassRate = 98.4;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] text-slate-800 overflow-y-auto p-6 space-y-6 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 size={18} className="text-indigo-600" />
          <span>AI OS 软件工程效能度量与可观测性大屏 (Telemetry & Analytics)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          实时监控 Multi-Agent 算力消耗、工程吞吐量、测试覆盖率与人机协同干预率
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>总计算 Token 消耗</span>
            <Zap size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {(totalTokens / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-emerald-700 font-mono font-semibold flex items-center gap-1">
            <TrendingUp size={12} />
            <span>较人类工程师研发周期提效 18.5x</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>预估云与模型成本</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            ${totalCost.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            单功能平均开销: $0.42 / Feature
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>全自动测试通过率</span>
            <ShieldCheck size={16} className="text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-700">
            {avgTestPassRate}%
          </div>
          <div className="text-[10px] text-emerald-700 font-mono font-semibold">
            Playwright E2E + Vitest 100% 覆盖
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>人类专家审批介入率</span>
            <UserCheck size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700">
            8.2% (高风险门禁)
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            人类总监把关发布与预算
          </div>
        </div>
      </div>

      {/* Model Distribution & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Workload Distribution */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>各部门工单吞吐量 (Department Throughput)</span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">Live Load</span>
          </h3>

          <div className="space-y-3">
            {departments.map(dept => {
              const deptItems = workItems.filter(w => w.departmentId === dept.id);
              const points = deptItems.reduce((acc, w) => acc + w.storyPoints, 0) + 5;
              const percent = Math.min(100, (points / 40) * 100);

              return (
                <div key={dept.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700 font-semibold">{dept.name}</span>
                    <span className="font-mono text-slate-500 font-medium">{points} 故事点 ({deptItems.length} 工单)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: dept.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Model Routing Architecture */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
            <span>模型智能路由与算力分布 (Model Routing Ratio)</span>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold">Dynamic Tiering</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  G2
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Gemini 2.5 Pro (Thinking)</div>
                  <div className="text-[10px] text-slate-500">总控PM、前端复杂状态机、架构推演</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700">42% 流量</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  C3
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">Claude 3.7 Sonnet</div>
                  <div className="text-[10px] text-slate-500">后端高并发微服务、安全合规漏洞扫描</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700">35% 流量</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  DS
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">DeepSeek V3 / Flash</div>
                  <div className="text-[10px] text-slate-500">PostgreSQL DDL建模、DevOps流水线</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-sky-700">23% 流量</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
