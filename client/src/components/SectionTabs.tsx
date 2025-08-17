import { Cpu, Users } from 'lucide-react';
import type { BookSection } from '../../../server/src/schema';

interface SectionTabsProps {
  selectedSection: BookSection;
  onSectionChange: (section: BookSection) => void;
}

export function SectionTabs({ selectedSection, onSectionChange }: SectionTabsProps) {
  const tabs = [
    {
      id: 'mind_and_machine' as BookSection,
      label: 'Mind and Machine',
      description: 'Books written by AI',
      icon: Cpu,
      gradient: 'from-cyan-400 to-blue-500',
      activeGradient: 'from-cyan-500 to-blue-600'
    },
    {
      id: 'veridion_writers_coop' as BookSection,
      label: 'The Veridion Writer\'s Co-Op',
      description: 'Community collaborative stories',
      icon: Users,
      gradient: 'from-purple-400 to-pink-500',
      activeGradient: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex space-x-4 p-2 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 shadow-lg">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = selectedSection === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onSectionChange(tab.id)}
              className={`group relative px-6 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isActive 
                  ? `bg-gradient-to-r ${tab.activeGradient} shadow-lg text-white` 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className={`w-5 h-5 ${isActive ? 'animate-pulse' : ''}`} />
                <div className="text-left">
                  <div className="font-semibold text-sm">{tab.label}</div>
                  <div className={`text-xs ${isActive ? 'text-white/90' : 'text-white/60'}`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}