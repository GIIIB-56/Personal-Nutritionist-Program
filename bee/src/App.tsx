import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dashboard } from './components/Dashboard';
import { AnalysisResult } from './components/AnalysisResult';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { BottomNav } from './components/BottomNav';
import { LandingPage } from './components/LandingPage';
import { AppTransition, LandingTransition, PhoneFrame } from './components/AppTransition';
import {
  analyzeImage,
  analyzeText,
  getWeeklyReport,
  getProfile,
  getRecordsByDate,
  getTodayRecords,
  saveRecords,
  updateProfile,
  type ApiMeal,
  type WeeklyReport
} from './api';

export type GoalType = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  weight: number;
  height: number;
  activityLevel: string;
  goal: GoalType;
  dailyCalories: number;
  aiProvider?: 'openai' | 'gemini';
  openaiKey?: string;
  geminiKey?: string;
  themeMode?: 'light' | 'dark';
  fontScale?: number;
}

export interface MealEntry {
  id: string;
  name: string;
  description: string;
  advice?: string;
  isNonFood?: boolean;
  timestamp: Date;
  imageUrl: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sodium?: number;
  sugar?: number;
  cholesterol?: number;
}

const DEFAULT_IMAGE_URL =
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZvJTIwYm93bHxlbnwxfHx8fDE3Njc1MDA0MDF8MA&ixlib=rb-4.1.0&q=80&w=1080';
const NON_FOOD_MESSAGE = '你上传的图片未检测到食物，请重新拍摄。';

function getTextImageUrl(text: string) {
  const query = encodeURIComponent(text.trim() || 'healthy meal');
  return `https://source.unsplash.com/featured/?${query}`;
}

function mapApiMealToEntry(
  meal: ApiMeal & { id?: number; created_at?: string },
  imageUrl: string
): MealEntry {
  const isNonFood = Boolean(meal.is_non_food);
  const name = meal.food_name?.trim()
    ? meal.food_name
    : isNonFood
    ? '未检测到食物'
    : 'Unknown meal';
  const advice = meal.dietary_advice || (isNonFood ? NON_FOOD_MESSAGE : '');
  return {
    id: meal.id ? meal.id.toString() : Date.now().toString(),
    name,
    description: advice || 'Logged meal',
    advice,
    isNonFood,
    timestamp: meal.created_at ? new Date(meal.created_at) : new Date(),
    imageUrl,
    calories: meal.calories,
    protein: meal.protein_g,
    carbs: meal.carbs_g,
    fats: meal.fat_g,
    fiber: meal.fiber_g,
    sodium: meal.sodium_mg,
    sugar: meal.sugar_g
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildRecordDateTime(date: Date) {
  const now = new Date();
  const merged = new Date(date);
  merged.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return merged;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Screen = 'dashboard' | 'analysis' | 'history' | 'profile';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    weight: 70,
    height: 175,
    activityLevel: 'Moderate',
    goal: 'maintain',
    dailyCalories: 2000,
    aiProvider: 'openai',
    themeMode: 'light',
    fontScale: 1
  });
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [analyzedMeal, setAnalyzedMeal] = useState<MealEntry | null>(null);
  const [pendingMeals, setPendingMeals] = useState<ApiMeal[]>([]);
  const [pendingImageUrl, setPendingImageUrl] = useState<string>(DEFAULT_IMAGE_URL);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pendingRecordDate, setPendingRecordDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitial = async () => {
      try {
        const profileResponse = await getProfile();
        setUserProfile((prev) => ({
          ...prev,
          height: profileResponse.data.height ?? prev.height,
          activityLevel: profileResponse.data.activity_level ?? prev.activityLevel,
          goal: profileResponse.data.target_type ?? prev.goal,
          dailyCalories: profileResponse.data.daily_calorie_goal ?? prev.dailyCalories,
          aiProvider: profileResponse.data.ai_provider ?? prev.aiProvider,
          openaiKey: profileResponse.data.openai_key ?? prev.openaiKey,
          geminiKey: profileResponse.data.gemini_key ?? prev.geminiKey,
          themeMode: profileResponse.data.theme_mode ?? prev.themeMode,
          fontScale: profileResponse.data.font_scale ?? prev.fontScale
        }));
      } catch (error) {
        console.error(error);
      }

      try {
        const recordsResponse = await getTodayRecords();
        const mapped = recordsResponse.data.map((item) =>
          mapApiMealToEntry(item, DEFAULT_IMAGE_URL)
        );
        setMeals(mapped);
      } catch (error) {
        console.error(error);
      }

      try {
        const weeklyResponse = await getWeeklyReport(formatDate(new Date()));
        setWeeklyReport(weeklyResponse.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadInitial();
  }, []);

  useEffect(() => {
    const mode = userProfile.themeMode || 'light';
    document.documentElement.classList.toggle('dark', mode === 'dark');
  }, [userProfile.themeMode]);

  useEffect(() => {
    const scale = userProfile.fontScale || 1;
    document.documentElement.style.setProperty('--font-scale', String(scale));
  }, [userProfile.fontScale]);

  useEffect(() => {
    const loadByDate = async () => {
      setHistoryLoading(true);
      try {
        const dateString = formatDate(selectedDate);
        const recordsResponse = await getRecordsByDate(dateString);
        const mapped = recordsResponse.data.map((item) =>
          mapApiMealToEntry(item, DEFAULT_IMAGE_URL)
        );
        setMeals(mapped);

        const weeklyResponse = await getWeeklyReport(dateString);
        setWeeklyReport(weeklyResponse.data);
      } catch (error) {
        console.error(error);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadByDate();
  }, [selectedDate]);

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

  const handleScanMeal = () => {
    setPendingRecordDate(selectedDate);
    fileInputRef.current?.click();
  };

  const handleTypeMeal = async (text: string) => {
    if (!text.trim()) return;
    try {
      setPendingRecordDate(selectedDate);
      setIsLoading(true);
      const response = await analyzeText(text);
      const items = response.data.map((item) => ({
        ...item,
        source: 'text' as const
      }));
      if (!items.length) return;
      setPendingMeals(items);
      const imageUrl = getTextImageUrl(text);
      setPendingImageUrl(imageUrl);
      setAnalyzedMeal(mapApiMealToEntry(items[0], imageUrl));
      setCurrentScreen('analysis');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (pendingMeals.length === 0) return;
    const recordDate = pendingRecordDate || new Date();
    const recordDateString = formatDate(recordDate);
    try {
      await saveRecords(pendingMeals, recordDateString);
    } catch (error) {
      console.error(error);
    }
    const entries = pendingMeals.map((item) => {
      const entry = mapApiMealToEntry(item, pendingImageUrl);
      entry.timestamp = buildRecordDateTime(recordDate);
      return entry;
    });
    if (isSameDay(recordDate, selectedDate)) {
      setMeals([...meals, ...entries]);
    }
    setPendingMeals([]);
    setAnalyzedMeal(null);
    setCurrentScreen('dashboard');
  };

  const handleUpdateProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      await updateProfile({
        weight: profile.weight,
        height: profile.height,
        activity_level: profile.activityLevel,
        ai_provider: profile.aiProvider,
        openai_key: profile.openaiKey,
        gemini_key: profile.geminiKey,
        theme_mode: profile.themeMode,
        font_scale: profile.fontScale,
        target_type: profile.goal,
        daily_calorie_goal: profile.dailyCalories
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileSelected = async (file: File) => {
    setPendingRecordDate(selectedDate);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = String(reader.result || '');
      if (!base64.startsWith('data:image')) return;
      try {
        setIsLoading(true);
        const response = await analyzeImage(base64);
        const item = { ...response.data, source: 'image' as const };
        const objectUrl = URL.createObjectURL(file);
        setPendingMeals([item]);
        setPendingImageUrl(objectUrl);
        setAnalyzedMeal(mapApiMealToEntry(item, objectUrl));
        setCurrentScreen('analysis');
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStartApp = () => {
    setShowLanding(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <PhoneFrame showLanding={showLanding}>
        <LandingTransition isVisible={showLanding}>
          <LandingPage onStart={handleStartApp} />
        </LandingTransition>

        <AppTransition isVisible={!showLanding}>
          <div className="h-full flex flex-col relative">
            <AnimatePresence mode="wait" initial={false}>
              {currentScreen === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3
                  }}
                  className="absolute inset-0"
                >
                  <Dashboard
                    userProfile={userProfile}
                    meals={meals}
                    totalCalories={totalCalories}
                    totalProtein={totalProtein}
                    totalCarbs={totalCarbs}
                    totalFats={totalFats}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    onScanMeal={handleScanMeal}
                    onTypeMeal={handleTypeMeal}
                    onNavigate={setCurrentScreen}
                  />
                </motion.div>
              )}
              
              {currentScreen === 'analysis' && analyzedMeal && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3
                  }}
                  className="absolute inset-0"
                >
                  <AnalysisResult
                    meal={analyzedMeal}
                    userProfile={userProfile}
                    onSave={handleSaveMeal}
                    onBack={() => setCurrentScreen('dashboard')}
                  />
                </motion.div>
              )}
              
              {currentScreen === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3
                  }}
                  className="absolute inset-0"
                >
                  <History
                    meals={meals}
                    userProfile={userProfile}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    isLoading={historyLoading}
                    weeklyReport={weeklyReport}
                    onBack={() => setCurrentScreen('dashboard')}
                  />
                </motion.div>
              )}
              
              {currentScreen === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ 
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                    duration: 0.3
                  }}
                  className="absolute inset-0"
                >
                  <Profile
                    userProfile={userProfile}
                    onUpdateProfile={handleUpdateProfile}
                    onBack={() => setCurrentScreen('dashboard')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Navigation - shown on all screens */}
            <BottomNav
              currentScreen={currentScreen}
              onNavigate={setCurrentScreen}
              onScan={handleScanMeal}
            />
          </div>
        </AppTransition>
      </PhoneFrame>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        style={{ display: 'none' }}
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleFileSelected(file);
          }
          event.target.value = '';
        }}
      />
      {isLoading ? (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl px-6 py-5 shadow-lg flex flex-col items-center gap-3">
            <div className="loading-orb" aria-hidden="true">
              <span className="loading-orb__ring"></span>
              <span className="loading-orb__dot"></span>
            </div>
            <div className="text-gray-800 text-sm font-medium">正在解析营养成分</div>
            <div className="loading-dots" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="loading-balls" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
