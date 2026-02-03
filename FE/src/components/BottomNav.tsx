import { Home, Camera, BarChart3, User } from 'lucide-react';
import { motion } from 'motion/react';

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
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-area-bottom">
      <div className="flex items-center justify-around h-20 px-2">
        {/* Home */}
        <motion.button
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <motion.div 
            className={`p-2 rounded-2xl ${
              currentScreen === 'dashboard' 
                ? 'bg-[#2ECC71]' 
                : 'bg-transparent'
            }`}
            animate={{
              scale: currentScreen === 'dashboard' ? 1 : 1,
              y: currentScreen === 'dashboard' ? -2 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Home 
              className={`w-6 h-6 transition-colors ${
                currentScreen === 'dashboard' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </motion.div>
          <span className={`text-xs transition-colors ${
            currentScreen === 'dashboard' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Home
          </span>
        </motion.button>

        {/* Scan - or Analysis if on analysis screen */}
        <motion.button
          onClick={handleScanClick}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <motion.div 
            className={`p-2 rounded-2xl ${
              currentScreen === 'analysis' 
                ? 'bg-[#2ECC71]' 
                : 'bg-transparent'
            }`}
            animate={{
              scale: currentScreen === 'analysis' ? 1 : 1,
              y: currentScreen === 'analysis' ? -2 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Camera 
              className={`w-6 h-6 transition-colors ${
                currentScreen === 'analysis' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </motion.div>
          <span className={`text-xs transition-colors ${
            currentScreen === 'analysis' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Scan
          </span>
        </motion.button>

        {/* History / Reports */}
        <motion.button
          onClick={() => onNavigate('history')}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <motion.div 
            className={`p-2 rounded-2xl ${
              currentScreen === 'history' 
                ? 'bg-[#2ECC71]' 
                : 'bg-transparent'
            }`}
            animate={{
              scale: currentScreen === 'history' ? 1 : 1,
              y: currentScreen === 'history' ? -2 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <BarChart3 
              className={`w-6 h-6 transition-colors ${
                currentScreen === 'history' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </motion.div>
          <span className={`text-xs transition-colors ${
            currentScreen === 'history' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Reports
          </span>
        </motion.button>

        {/* Profile */}
        <motion.button
          onClick={() => onNavigate('profile')}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full"
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <motion.div 
            className={`p-2 rounded-2xl ${
              currentScreen === 'profile' 
                ? 'bg-[#2ECC71]' 
                : 'bg-transparent'
            }`}
            animate={{
              scale: currentScreen === 'profile' ? 1 : 1,
              y: currentScreen === 'profile' ? -2 : 0
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <User 
              className={`w-6 h-6 transition-colors ${
                currentScreen === 'profile' ? 'text-white' : 'text-gray-400'
              }`}
            />
          </motion.div>
          <span className={`text-xs transition-colors ${
            currentScreen === 'profile' ? 'text-[#2ECC71] font-medium' : 'text-gray-400'
          }`}>
            Profile
          </span>
        </motion.button>
      </div>
    </div>
  );
}
