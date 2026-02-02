import { ArrowLeft, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useState } from 'react';
import type { MealEntry, UserProfile } from '../App';

interface HistoryProps {
  meals: MealEntry[];
  userProfile: UserProfile;
  selectedDate: Date;
  isLoading: boolean;
  onSelectDate: (date: Date) => void;
  weeklyReport: {
    summary: string;
    highlights: string[];
    total_days: number;
    days_met: number;
    days_over: number;
    days_under: number;
  } | null;
  onBack: () => void;
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

export function History({
  meals,
  userProfile,
  selectedDate,
  isLoading,
  onSelectDate,
  weeklyReport,
  onBack
}: HistoryProps) {
  const [isWeeklyExpanded, setIsWeeklyExpanded] = useState(false);

  // Get week days starting from Monday
  const getWeekDays = () => {
    const days = [];
    const current = new Date(selectedDate);
    const startOfWeek = new Date(current);
    const dayOfWeek = startOfWeek.getDay() || 7;
    startOfWeek.setDate(current.getDate() - dayOfWeek + 1);

    for (let i = 0; i < 7; i++) {
      days.push({
        date: new Date(startOfWeek),
        day: startOfWeek.getDate()
      });
      startOfWeek.setDate(startOfWeek.getDate() + 1);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const isSelectedDay = (dayInfo: { date: Date }) => {
    return (
      dayInfo.date.getFullYear() === selectedDate.getFullYear() &&
      dayInfo.date.getMonth() === selectedDate.getMonth() &&
      dayInfo.date.getDate() === selectedDate.getDate()
    );
  };

  const totalCaloriesToday = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);

  const formatMacro = (value: number) => (Number.isFinite(value) ? value.toFixed(1) : '0.0');
  const formatNumber = (value: number) =>
    Number.isFinite(value)
      ? value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      : '0.0';
  const progress = (totalCaloriesToday / userProfile.dailyCalories) * 100;
  const weeklySummaryItems = weeklyReport ? splitAdvice(weeklyReport.summary || '') : [];
  const weeklyHighlightItems = weeklyReport?.highlights
    ? weeklyReport.highlights.flatMap((item) => splitAdvice(item))
    : [];
  const weeklyItems = [...weeklySummaryItems, ...weeklyHighlightItems];
  const shouldCollapseWeekly = weeklyItems.length > 4;

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="w-10" />
        <h1 className="text-gray-900">History & Reports</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <Filter className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="px-5 py-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const prev = new Date(selectedDate);
              prev.setDate(prev.getDate() - 7);
              onSelectDate(prev);
            }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-gray-900 font-medium">
            {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={() => {
              const next = new Date(selectedDate);
              next.setDate(next.getDate() + 7);
              onSelectDate(next);
            }}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayLabels.map((label, index) => (
              <div key={label} className="text-center text-xs text-gray-500 font-medium">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((dayInfo, index) => (
              <button
                key={index}
                onClick={() => onSelectDate(dayInfo.date)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${
                  isSelectedDay(dayInfo)
                    ? 'bg-[#2ECC71] text-white font-medium'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {dayInfo.day}
                {isSelectedDay(dayInfo) && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <input
            type="date"
            value={selectedDate.toISOString().slice(0, 10)}
            onChange={(event) => {
              const next = new Date(event.target.value + 'T00:00:00');
              if (!Number.isNaN(next.getTime())) {
                onSelectDate(next);
              }
            }}
            className="w-full h-11 px-4 rounded-xl bg-[#F8F9FA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] border border-transparent focus:border-[#2ECC71]"
          />
        </div>

        {/* Daily Summary Card */}
        <div className="bg-[#2ECC71] rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="text-sm opacity-90 mb-1">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="text-3xl font-bold mb-1">{formatNumber(totalCaloriesToday)} kcal</div>
              <div className="text-sm opacity-90">of {userProfile.dailyCalories.toLocaleString()} kcal goal</div>
            </div>
            <div className="relative w-16 h-16">
              <svg width="64" height="64" className="transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="white"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 - (progress / 100) * 2 * Math.PI * 28}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
          <div className="flex gap-4 text-sm">
            <div>Protein: <span className="font-semibold">{formatMacro(totalProtein)}g</span></div>
            <div>Carbs: <span className="font-semibold">{formatMacro(totalCarbs)}g</span></div>
            <div>Fats: <span className="font-semibold">{formatMacro(totalFats)}g</span></div>
          </div>
        </div>

        {/* Today's Meals */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Today's Meals</h2>
            <button className="text-[#2ECC71] text-sm font-medium">Export</button>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-gray-500 text-sm">Loading meals...</div>
            ) : meals.length === 0 ? (
              <div className="text-gray-500 text-sm">No meals for this date.</div>
            ) : (
              meals.map((meal) => (
              <div
                key={meal.id}
                className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 hover:border-gray-200 transition-colors"
              >
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="w-14 h-14 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-gray-900 font-medium">{meal.name}</h3>
                    <span className="text-gray-900 font-semibold ml-2">{formatNumber(meal.calories)} kcal</span>
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
                    <span>P: {formatNumber(meal.protein)}g</span>
                    <span>C: {formatNumber(meal.carbs)}g</span>
                    <span>F: {formatNumber(meal.fats)}g</span>
                  </div>
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900">Weekly Overview</h2>
            <button className="text-[#2ECC71] text-sm font-medium">Details</button>
          </div>
          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            {weeklyItems.length ? (
              <>
                <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                  {(shouldCollapseWeekly && !isWeeklyExpanded
                    ? weeklyItems.slice(0, 4)
                    : weeklyItems
                  ).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                {shouldCollapseWeekly ? (
                  <button
                    type="button"
                    onClick={() => setIsWeeklyExpanded((prev) => !prev)}
                    className="mt-3 text-[#2ECC71] text-sm font-medium hover:underline"
                  >
                    {isWeeklyExpanded ? '收起建议' : '展开建议'}
                  </button>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">
                Generate a weekly report to see your trends.
              </p>
            )}
            {weeklyReport ? (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div className="bg-white rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Days Met</div>
                  <div className="font-semibold">{weeklyReport.days_met}</div>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Days Over</div>
                  <div className="font-semibold">{weeklyReport.days_over}</div>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Days Under</div>
                  <div className="font-semibold">{weeklyReport.days_under}</div>
                </div>
                <div className="bg-white rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">Total Days</div>
                  <div className="font-semibold">{weeklyReport.total_days}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}














