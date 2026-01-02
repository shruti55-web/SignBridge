import { Home, BookOpen, History, MessageSquare, Camera } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const tabs = [
    { id: 'text-to-sign', label: 'Text to Sign', icon: MessageSquare },
    { id: 'voice-to-sign', label: 'Voice to Sign', icon: Home },
    { id: 'sign-to-text', label: 'Sign to Text', icon: Camera },
    { id: 'dictionary', label: 'Dictionary', icon: BookOpen },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <nav className="bg-white shadow-md border-b-4 border-sky-400">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-2">
            <div className="bg-sky-500 p-2 rounded-lg">
              <Home className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sky-600">SignBridge</h1>
              <p className="text-sm text-gray-500">Communication Platform</p>
            </div>
          </div>
        </div>
        <div className="flex space-x-1 pb-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-sky-500 text-white shadow-lg transform -translate-y-1'
                    : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
