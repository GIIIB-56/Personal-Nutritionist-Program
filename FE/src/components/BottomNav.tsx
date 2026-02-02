import { Home, Camera, BarChart3, User } from 'lucide-react';

interface BottomNavProps {
  currentScreen: 'dashboard' | 'analysis' | 'history' | 'profile';
  onNavigate: (screen: 'dashboard' | 'analysis' | 'history' | 'profile') => void;
  onScan: () => void;
}

export function BottomNav({ currentScreen, onNavigate, onScan }: BottomNavProps) {
  const handleScanClick = () => {
    if (currentScreen === 'analysis') {
      // If already on analysis screen, stay there
      return;
    }
    // Trigger scan and navigate to analysis
    onScan();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around h-20 px-2">
        {/* Home */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
        >
          <div className={`p-2 rounded-2xl transition-all ${
            currentScreen === 'dashboard' 
              ? 'bg-[#2ECC71]' 
              : 'bg-transparent'
          }`}>
            <Home 
              className={`w-6 h-6 ${
                currentScreen === 'dashboard' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </div>
          <span className={`text-xs ${
            currentScreen === 'dashboard' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Home
          </span>
        </button>

        {/* Scan - or Analysis if on analysis screen */}
        <button
          onClick={handleScanClick}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
        >
          <div className={`p-2 rounded-2xl transition-all ${
            currentScreen === 'analysis' 
              ? 'bg-[#2ECC71]' 
              : 'bg-transparent'
          }`}>
            <Camera 
              className={`w-6 h-6 ${
                currentScreen === 'analysis' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </div>
          <span className={`text-xs ${
            currentScreen === 'analysis' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Scan
          </span>
        </button>

        {/* History / Reports */}
        <button
          onClick={() => onNavigate('history')}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
        >
          <div className={`p-2 rounded-2xl transition-all ${
            currentScreen === 'history' 
              ? 'bg-[#2ECC71]' 
              : 'bg-transparent'
          }`}>
            <BarChart3 
              className={`w-6 h-6 ${
                currentScreen === 'history' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </div>
          <span className={`text-xs ${
            currentScreen === 'history' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Reports
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors"
        >
          <div className={`p-2 rounded-2xl transition-all ${
            currentScreen === 'profile' 
              ? 'bg-[#2ECC71]' 
              : 'bg-transparent'
          }`}>
            <User 
              className={`w-6 h-6 ${
                currentScreen === 'profile' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </div>
          <span className={`text-xs ${
            currentScreen === 'profile' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Profile
          </span>
        </button>
      </div>
    </div>
  );
}
