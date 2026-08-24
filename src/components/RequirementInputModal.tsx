import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Rocket, 
  Sliders, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Check, 
  Zap, 
  Layers 
} from 'lucide-react';
import { PRESET_SCENARIOS } from '../data/initialData';

interface RequirementInputModalProps {
  onClose: () => void;
  onSubmitMission: (title: string, description: string, scenarioId: string) => void;
}

export const RequirementInputModal: React.FC<RequirementInputModalProps> = ({
  onClose,
  onSubmitMission,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(PRESET_SCENARIOS[0].id);
  const [missionTitle, setMissionTitle] = useState<string>('企业级微服务高并发与权限审计模块重构');
  const [missionPrompt, setMissionPrompt] = useState<string>(
    '构建符合金融等保三级的高可用身份鉴权与操作审计系统。需具备OAuth2/OIDC标准授权码模式，PostgreSQL哈希链表防篡改日志，React 19虚拟滚动可视化大屏，并通过Playwright E2E与OWASP渗透测试。'
  );
  const [slaTarget, setSlaTarget] = useState<string>('99.99%');
  const [budgetQuota, setBudgetQuota] = useState<number>(5.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectScenario = (sc: typeof PRESET_SCENARIOS[0]) => {
    setSelectedScenarioId(sc.id);
    if (sc.id === 'scenario_sso_audit') {
      setMissionTitle('企业级微服务高并发与权限审计模块重构');
      setMissionPrompt('构建符合金融等保三级的高可用身份鉴权与操作审计系统。需具备OAuth2/OIDC标准授权码模式，PostgreSQL哈希链表防篡改日志，React 19虚拟滚动可视化大屏，并通过Playwright E2E与OWASP渗透测试。');
    } else if (sc.id === 'scenario_db_migration') {
      setMissionTitle('零宕机 PostgreSQL 数据库水平分表与历史数据双写迁移');
      setMissionPrompt('针对用户量突增至千万级场景，对核心账单表进行水平Hash分表。设计双写Proxy中间件，生成Drizzle ORM分库分表迁移DDL，实施数据回放与一致性校验，确保业务无感迁移。');
    } else if (sc.id === 'scenario_hotfix_security') {
      setMissionTitle('CVE-2026-8821 认证绕过紧急安全漏洞应急热修复');
      setMissionPrompt('安全巡检发现JWT签名验证存在算法混淆攻击漏洞(None Algorithm Confusion)。立即生成紧急热修复补丁，更新验签中间件，自动化运行回归测试，经人类总监放行后直接金丝雀热更上线。');
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitMission(missionTitle, missionPrompt, selectedScenarioId);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="p-4 px-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                发布新工程任务 (Human PM Mission Hub)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                向 AI OS 发起软件工程需求，触发总控 Agent 意图解析与多部门协同流转
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
          
          {/* Preset Scenario Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers size={14} className="text-indigo-600" />
              <span>选择预设企业级工程场景 (Preset Missions)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {PRESET_SCENARIOS.map(sc => {
                const isSelected = selectedScenarioId === sc.id;

                return (
                  <div
                    key={sc.id}
                    onClick={() => handleSelectScenario(sc)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all shadow-2xs ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-100 text-slate-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold truncate text-slate-800">{sc.name}</div>
                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-1 font-medium">
                      {sc.description}
                    </p>
                    <div className="mt-2 text-[9px] font-mono font-bold text-indigo-700 flex items-center justify-between">
                      <span>{sc.difficulty}</span>
                      <span>{sc.estimatedTime}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mission Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              工程任务主题 (Mission Title)
            </label>
            <input
              type="text"
              value={missionTitle}
              onChange={e => setMissionTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>

          {/* Mission Natural Language Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              需求规格描述 / PRD Prompt (自然语言指令)
            </label>
            <textarea
              rows={4}
              value={missionPrompt}
              onChange={e => setMissionPrompt(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 leading-relaxed shadow-2xs"
            />
          </div>

          {/* SLA & Budget Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 shadow-2xs">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>目标生产 SLA 可用性</span>
                <span className="font-mono font-bold text-indigo-700">{slaTarget}</span>
              </label>
              <select
                value={slaTarget}
                onChange={e => setSlaTarget(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 shadow-2xs"
              >
                <option value="99.99%">Tier-1 核心级 (99.99% SLA)</option>
                <option value="99.9%">Tier-2 业务级 (99.9% SLA)</option>
                <option value="99.0%">Tier-3 敏捷探索级 (99.0% SLA)</option>
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1.5 shadow-2xs">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Token 算力预算上限</span>
                <span className="font-mono font-bold text-emerald-700">${budgetQuota}.00 USD</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={budgetQuota}
                onChange={e => setBudgetQuota(Number(e.target.value))}
                className="w-full accent-indigo-600 mt-2"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors shadow-2xs"
          >
            取消
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Clock size={14} className="animate-spin" />
                <span>AI PM 正在拆解意图...</span>
              </>
            ) : (
              <>
                <Rocket size={14} />
                <span>启动 AI PM 拆解与多智能体流转</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
