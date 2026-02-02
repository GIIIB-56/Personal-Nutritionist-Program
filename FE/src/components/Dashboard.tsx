import { Menu, Bell, Camera, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import type { UserProfile, MealEntry } from '../App';

interface DashboardProps {
  userProfile: UserProfile;
  meals: MealEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  selectedDate: Date;
  dailyAdvice: string;
  onScanMeal: () => void;
  onTypeMeal: (text: string) => void;
  onNavigate: (screen: 'dashboard' | 'analysis' | 'history' | 'profile') => void;
}

function splitAdvice(text: string) {
  if (!text.trim()) return [];
  const cleaned = text
    .replace(/\r/g, "\n")
    .replace(/[\u2022\u00B7\u25AA\u25CF\u25CB\u25A0\u25A1\u25C6\u25C7]/g, "-")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\uFFFD/g, "")
    .replace(/[^\S\n]+/g, " ")
    .trim();
  if (!cleaned) return [];
  const lines = cleaned
    .split(/\n+/)
    .flatMap((line) => line.split(/\s*-\s+/))
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length > 1) return lines;
  return cleaned
    .split(/(?<=[\u3002.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function Dashboard({
  userProfile,
  meals,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFats,
  selectedDate,
  dailyAdvice,
  onScanMeal,
  onTypeMeal,
  onNavigate
}: DashboardProps) {
  const [mealInput, setMealInput] = useState('');
  const [isDailyAdviceExpanded, setIsDailyAdviceExpanded] = useState(false);
  
  const remaining = userProfile.dailyCalories - totalCalories;
  const progress = (totalCalories / userProfile.dailyCalories) * 100;
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const formatNumber = (value: number) =>
    Number.isFinite(value)
      ? value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : '0.0';
  const remainingDisplay = formatNumber(remaining);
  const remainingDigits = Math.max(remainingDisplay.replace(/[^\d]/g, '').length, 1);
  const remainingFontSize =
    remainingDigits >= 5 ? 34 : remainingDigits === 4 ? 40 : 48;
  const adviceItems = splitAdvice(dailyAdvice || '');
  const shouldCollapseAdvice = adviceItems.length > 3;
  const isToday =
    selectedDate.getFullYear() === new Date().getFullYear() &&
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getDate() === new Date().getDate();
  const selectedLabel = selectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const proteinTarget = 150;
  const carbsTarget = 250;
  const fatsTarget = 65;
  const fiberTarget = 30;

  const totalFiber = meals.reduce((sum, meal) => sum + (meal.fiber || 0), 0);

  const goalLabels = {
    lose: 'Lose Weight',
    maintain: 'Maintain Weight',
    gain: 'Gain Muscle'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mealInput.trim()) {
      onTypeMeal(mealInput);
      setMealInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between">
        <button className="w-10 h-10 flex items-center justify-center">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-gray-900">NutriAI</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <Bell className="w-6 h-6 text-gray-700" />
        </button>
      </div>
      <div className="px-5 pb-2 text-sm text-gray-500">
        {isToday ? `Showing today: ${selectedLabel}` : `Showing selected date: ${selectedLabel}`}
      </div>

      {/* Calorie Ring */}
      <div className="px-5 py-6 bg-[#F8F9FA] mx-5 rounded-2xl mb-5">
        <div className="flex justify-center">
          <div className="relative">
            <svg width="220" height="220" className="transform -rotate-90">
              <circle
                cx="110"
                cy="110"
                r="85"
                stroke="#E5E7EB"
                strokeWidth="18"
                fill="none"
              />
              <circle
                cx="110"
                cy="110"
                r="85"
                stroke="#2ECC71"
                strokeWidth="18"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="text-gray-900"
                style={{ fontSize: `${remainingFontSize}px`, fontWeight: '700', lineHeight: '1' }}
              >
                {remainingDisplay}
              </div>
              <div className="text-gray-500 mt-1" style={{ fontSize: '14px' }}>
                of {userProfile.dailyCalories} kcal
              </div>
              <div className="text-gray-400" style={{ fontSize: '13px' }}>
                remaining
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
          <span className="text-gray-600" style={{ fontSize: '14px' }}>
            Target: {goalLabels[userProfile.goal]}
          </span>
        </div>
      </div>

      {/* Macros */}
      <div className="px-5 mb-5">
        <h2 className="text-gray-900 mb-4">
          {isToday ? "Today's Macros" : "Macros"}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <MacroCard
            label="Protein"
            value={totalProtein}
            target={proteinTarget}
            unit="g"
            color="#3498DB"
            icon="💪"
          />
          <MacroCard
            label="Carbs"
            value={totalCarbs}
            target={carbsTarget}
            unit="g"
            color="#F59E0B"
            icon="🍞"
          />
          <MacroCard
            label="Fats"
            value={totalFats}
            target={fatsTarget}
            unit="g"
            color="#F97316"
            icon="🥑"
          />
          <MacroCard
            label="Fiber"
            value={totalFiber}
            target={fiberTarget}
            unit="g"
            color="#10B981"
            icon="🥬"
          />
        </div>
      </div>

      {/* Meals */}
      <div className="px-5 mb-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-900">{isToday ? "Recent Meals" : "Meals"}</h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-[#2ECC71]"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {meals.length === 0 ? (
            <div className="text-gray-500 text-sm">No meals for this date.</div>
          ) : meals.slice(-2).reverse().map((meal) => (
            <div
              key={meal.id}
              className="bg-[#F8F9FA] rounded-xl p-3 flex items-start gap-3"
            >
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-2xl">
                {meal.name.toLowerCase().includes('breakfast') ? '☕' : 
                 meal.name.toLowerCase().includes('lunch') ? '🍽️' : 
                 meal.name.toLowerCase().includes('dinner') ? '🍲' : '🍎'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-gray-900">{meal.name}</h3>
                </div>
                <p className="text-gray-500 text-sm mb-1">
                  {meal.timestamp.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
                <p className="text-gray-600 text-sm mb-2">{meal.description}</p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>{formatNumber(meal.calories)} kcal</span>
                  <span>•</span>
                  <span>P: {formatNumber(meal.protein)}g</span>
                  <span>C: {formatNumber(meal.carbs)}g</span>
                  <span>F: {formatNumber(meal.fats)}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Advice */}
      <div className="px-5 mb-5">
        <h2 className="text-gray-900 mb-3">
          {isToday ? "Today's Advice" : "Advice"}
        </h2>
        <div className="bg-[#F8F9FA] rounded-2xl p-4 text-gray-700 text-sm leading-relaxed">
          {adviceItems.length ? (
            <>
              <ul className="list-disc pl-5 space-y-1">
                {(shouldCollapseAdvice && !isDailyAdviceExpanded
                  ? adviceItems.slice(0, 3)
                  : adviceItems
                ).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              {shouldCollapseAdvice ? (
                <button
                  type="button"
                  onClick={() => setIsDailyAdviceExpanded((prev) => !prev)}
                  className="mt-3 text-[#2ECC71] text-sm font-medium hover:underline"
                >
                  {isDailyAdviceExpanded ? '收起建议' : '展开建议'}
                </button>
              ) : null}
            </>
          ) : (
            isToday ? 'Set your goal to receive personalized advice.' : 'Advice is available for today only.'
          )}
        </div>
      </div>

      {/* Manual Input - Simplified, removed Scan button since it's in bottom nav */}
      <div className="px-5 pb-6 pt-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            placeholder="Type what you ate (e.g., Two boiled eggs)..."
            className="w-full h-12 pl-4 pr-12 rounded-xl bg-[#F8F9FA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] text-sm"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#2ECC71] flex items-center justify-center hover:bg-[#27AE60] transition-colors"
          >
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}

interface MacroCardProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  icon: string;
}

function MacroCard({ label, value, target, unit, color, icon }: MacroCardProps) {
  const percentage = Math.min((value / target) * 100, 100);
  const displayValue = Number.isFinite(value) ? value.toFixed(1) : '0.0';

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <div className="mb-3">
        <span className="text-gray-900" style={{ fontSize: '24px', fontWeight: '700' }}>
          {displayValue}
        </span>
        <span className="text-gray-400 text-sm ml-1">/{target}{unit}</span>
      </div>
      <div className="w-full h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

