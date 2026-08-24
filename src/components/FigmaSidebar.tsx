import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Search, 
  Layers, 
  PanelLeftClose, 
  PanelLeft, 
  FileText, 
  GripVertical,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { PageNode, WorkItem } from '../types/workflow';
import { DynamicIcon } from './DynamicIcon';

interface FigmaSidebarProps {
  pages: PageNode[];
  activePageId: string;
  onSelectPage: (pageId: string, subflowNodeId?: string) => void;
  workItems: WorkItem[];
  onSelectWorkItem: (item: WorkItem) => void;
  onOpenNewMissionModal: () => void;
}

export const FigmaSidebar: React.FC<FigmaSidebarProps> = ({
  pages,
  activePageId,
  onSelectPage,
  workItems,
  onSelectWorkItem,
  onOpenNewMissionModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [expandedPageIds, setExpandedPageIds] = useState<Record<string, boolean>>({
    'page_overview_canvas': true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pages' | 'layers'>('pages');

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Resize handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(220, Math.min(480, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const toggleExpand = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPageIds(prev => ({
      ...prev,
      [pageId]: !prev[pageId]
    }));
  };

  const filteredPages = pages.filter(p => {
    if (!searchQuery) return true;
    const matchParent = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchChildren = p.children?.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchParent || matchChildren;
  });

  if (isCollapsed) {
    return (
      <div className="w-14 bg-white border-r border-slate-200 flex flex-col items-center py-3 select-none z-20 shadow-xs">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors mb-3"
          title="展开侧边栏"
        >
          <PanelLeft size={18} />
        </button>
        <div className="w-8 h-[1px] bg-slate-200 my-2" />
        <div className="flex flex-col gap-2">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => {
                setIsCollapsed(false);
                onSelectPage(page.id, page.subflowNodeId);
              }}
              className={`p-2.5 rounded-lg transition-all ${
                activePageId === page.id
                  ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-200/80 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title={page.title}
            >
              <DynamicIcon name={page.icon} size={16} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={sidebarRef}
      style={{ width: sidebarWidth }}
      className="bg-white border-r border-slate-200 flex flex-col h-full select-none relative z-20 flex-shrink-0 text-slate-800 shadow-xs"
    >
      {/* Top Header / App Branding */}
      <div className="p-3.5 px-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm text-white font-bold text-sm flex-shrink-0">
            <Sparkles size={15} />
          </div>
          <div className="truncate">
            <h1 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
              AI OS | Engine
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold border border-indigo-100">
                v2.5
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate">
              软件工程全生命周期调度
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          title="折叠侧边栏"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Quick Action: Publish New Human Mission */}
      <div className="p-3">
        <button
          onClick={onOpenNewMissionModal}
          className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
        >
          <Sparkles size={14} className="text-indigo-200" />
          <span>发布新工程任务 (PM Hub)</span>
        </button>
      </div>

      {/* Tabs: Pages / Work Items Tree */}
      <div className="px-3 flex items-center gap-1 border-b border-slate-100 pb-2.5">
        <div className="flex w-full bg-slate-100 p-0.5 rounded-lg border border-slate-200/70">
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'pages'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers size={13} />
            <span>页面与流程</span>
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'layers'
                ? 'bg-white text-slate-800 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText size={13} />
            <span>工单 ({workItems.length})</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 pb-1.5">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'pages' ? '搜索页面或子流程...' : '搜索工单编号/标题...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Content List Area */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
        {activeTab === 'pages' ? (
          <div>
            <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Pages & Workflows</span>
              <span className="text-[10px] text-slate-400 font-normal">点击展开</span>
            </div>

            {filteredPages.map(page => {
              const isExpanded = !!expandedPageIds[page.id];
              const hasChildren = page.children && page.children.length > 0;
              const isActive = activePageId === page.id;

              return (
                <div key={page.id} className="space-y-0.5">
                  <div
                    onClick={() => onSelectPage(page.id, page.subflowNodeId)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/70 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {hasChildren ? (
                        <button
                          onClick={e => toggleExpand(page.id, e)}
                          className="p-0.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200/50"
                        >
                          {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                        </button>
                      ) : (
                        <span className="w-3.5" />
                      )}
                      <DynamicIcon name={page.icon} className={isActive ? 'text-indigo-600' : 'text-slate-400'} size={14} />
                      <span className="truncate">{page.title}</span>
                    </div>
                    {page.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {page.badge}
                      </span>
                    )}
                  </div>

                  {/* Sub-pages / Nested Flowcharts */}
                  {hasChildren && isExpanded && (
                    <div className="pl-6 space-y-0.5 border-l border-slate-200 ml-4 my-1">
                      {page.children!.map(child => {
                        const isChildActive = activePageId === child.id;
                        return (
                          <div
                            key={child.id}
                            onClick={() => onSelectPage(child.id, child.subflowNodeId)}
                            className={`flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer text-[11.5px] transition-all ${
                              isChildActive
                                ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/60'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <DynamicIcon name={child.icon} className={isChildActive ? 'text-indigo-600' : 'text-slate-400'} size={13} />
                              <span className="truncate">{child.title}</span>
                            </div>
                            {child.badge && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                                {child.badge}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Work Items Structure</span>
              <span className="text-[10px] text-slate-400 font-normal">Jira 敏捷</span>
            </div>

            {workItems
              .filter(w => !searchQuery || w.id.toLowerCase().includes(searchQuery.toLowerCase()) || w.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(item => {
                const isEpic = item.type === 'epic';
                const isFeature = item.type === 'feature';
                const isTask = item.type === 'task';

                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectWorkItem(item)}
                    className={`px-2.5 py-1.5 rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-200 hover:bg-slate-50 ${
                      isEpic ? 'bg-indigo-50/50 border-indigo-100 text-indigo-900 font-semibold mb-1' : ''
                    } ${isFeature ? 'ml-2 text-slate-700' : ''} ${isTask ? 'ml-4 text-slate-600 text-[11px]' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          item.type === 'epic' ? 'bg-purple-100 text-purple-700' :
                          item.type === 'feature' ? 'bg-sky-100 text-sky-700' :
                          item.type === 'qa_gate' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.id}
                        </span>
                        <span className="truncate text-xs">{item.title}</span>
                      </div>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        item.status === 'done' ? 'bg-emerald-500' :
                        item.status === 'in_progress' ? 'bg-amber-500 animate-pulse' :
                        'bg-slate-300'
                      }`} />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Footer User / System Status */}
      <div className="p-3 px-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
            CQ
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-800 leading-tight">Admin: Chen Qi</div>
            <div className="text-[10px] text-slate-500 leading-tight">Project Lead</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Active</span>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={() => setIsResizing(true)}
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-indigo-500 transition-colors ${
          isResizing ? 'bg-indigo-500 w-1.5' : 'bg-transparent'
        }`}
      />
    </div>
  );
};
