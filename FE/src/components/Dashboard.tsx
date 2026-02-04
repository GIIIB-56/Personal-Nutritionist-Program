import { Camera, ArrowRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
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
  onSelectDate: (date: Date) => void;
  onScanMeal: () => void;
  onTypeMeal: (text: string) => void;
  onNavigate: (screen: 'dashboard' | 'analysis' | 'history' | 'profile') => void;
}

export function Dashboard({
  userProfile,
  meals,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFats,
  selectedDate,
  onSelectDate,
  onScanMeal,
  onTypeMeal,
  onNavigate
}: DashboardProps) {
  const [mealInput, setMealInput] = useState('');
  
  const remaining = userProfile.dailyCalories - totalCalories;
  const progress = (totalCalories / userProfile.dailyCalories) * 100;
  const circumference = 2 * Math.PI * 85;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    onSelectDate(newDate);
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto pb-28 md:pb-24">
      {/* Header */}
      <div className="px-5 md:px-10 pt-12 pb-4 flex items-center justify-between">
        <div className="w-10" />
        <div className="flex items-center gap-1.5">
          <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#2ECC71] to-[#27AE60] bg-clip-text text-transparent tracking-tight">
            Nutri
          </span>
          <span className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            AI
          </span>
        </div>
        <div className="w-10" />
      </div>

      {/* Date Selector */}
      <div className="px-5 md:px-10 mb-4">
        <div className="flex items-center justify-between bg-[#F8F9FA] rounded-2xl md:rounded-3xl px-4 md:px-6 py-3 md:py-4">
          <button 
            onClick={() => changeDate(-1)}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 text-sm md:text-base">
              Showing selected date: <span className="text-gray-900 font-medium">{formatDate(selectedDate)}</span>
            </span>
          </div>
          <button 
            onClick={() => changeDate(1)}
            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calorie Ring */}
      <div className="px-5 md:px-10 mb-5">
        <div className="py-6 bg-[#F8F9FA] rounded-2xl md:rounded-3xl px-4 md:px-6">
        <div className="flex justify-center">
          <div className="relative">
            <svg width="220" height="220" className="transform -rotate-90 md:scale-110">
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
              <div className="text-gray-900" style={{ fontSize: '48px', fontWeight: '700', lineHeight: '1' }}>
                {remaining}
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
      </div>

      {/* Today's Macros */}
      <div className="px-5 md:px-10 mb-5">
        <h2 className="text-gray-900 mb-4">Today's Macros</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Recent Meals */}
      <div className="px-5 md:px-10 mb-5 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-900">Recent Meals</h2>
        </div>
        <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 md:gap-4">
          {meals.slice(-2).reverse().map((meal) => (
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
                  <span>{meal.calories} kcal</span>
                  <span>•</span>
                  <span>P: {meal.protein}g</span>
                  <span>C: {meal.carbs}g</span>
                  <span>F: {meal.fats}g</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Input - Simplified, removed Scan button since it's in bottom nav */}
      <div className="px-5 md:px-10 pb-6 pt-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            placeholder="Type what you ate (e.g., Two boiled eggs)..."
            className="w-full h-12 md:h-14 pl-4 pr-12 rounded-xl bg-[#F8F9FA] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] text-sm md:text-base"
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

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <span className="text-gray-600 text-sm">{label}</span>
      </div>
      <div className="mb-3">
        <span className="text-gray-900" style={{ fontSize: '24px', fontWeight: '700' }}>
          {value}
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
