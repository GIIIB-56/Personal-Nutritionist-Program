import { motion, AnimatePresence } from 'motion/react';
import { ReactNode } from 'react';

interface AppTransitionProps {
  children: ReactNode;
  isVisible: boolean;
}

export function AppTransition({ children, isVisible }: AppTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="app-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -20 }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="h-full w-full"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface LandingTransitionProps {
  children: ReactNode;
  isVisible: boolean;
}

export function LandingTransition({ children, isVisible }: LandingTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="landing-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.4 }
          }}
          transition={{ duration: 0.3 }}
          className="h-full w-full absolute inset-0 z-20 bg-white"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PhoneFrameProps {
  children: ReactNode;
  showLanding: boolean;
}

export function PhoneFrame({ children, showLanding }: PhoneFrameProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        scale: showLanding ? 1 : 1,
        y: showLanding ? 0 : 0
      }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative"
      style={{ height: '812px' }}
    >
      {children}
    </motion.div>
  );
}
