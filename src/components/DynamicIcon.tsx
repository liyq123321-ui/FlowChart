import React from 'react';
import { 
  Sparkles, 
  GitFork, 
  Network, 
  Palette, 
  Server, 
  LayoutGrid, 
  ShieldAlert, 
  ShieldCheck, 
  UserCheck, 
  Rocket, 
  Layout, 
  Cpu, 
  CloudLightning, 
  Kanban, 
  Bot, 
  FileSpreadsheet, 
  BarChart3, 
  Layers, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Sparkles,
  GitFork,
  Network,
  Palette,
  Server,
  LayoutGrid,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Rocket,
  Layout,
  Cpu,
  CloudLightning,
  Kanban,
  Bot,
  FileSpreadsheet,
  BarChart3,
  Layers,
};

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className = 'w-4 h-4', size }) => {
  const IconComponent = iconMap[name] || HelpCircle;
  return <IconComponent className={className} size={size} />;
};
