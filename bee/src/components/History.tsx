import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MealEntry, UserProfile } from '../App';

interface HistoryProps {
  meals: MealEntry[];
  userProfile: UserProfile;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  isLoading: boolean;
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
  onSelectDate,
  isLoading,
  weeklyReport,
  onBack
}: HistoryProps) {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  useEffect(() => {
    setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [selectedDate]);

  // Get week days for the week containing selected date
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as first day
    startOfWeek.setDate(startOfWeek.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get all days in current month for full calendar
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    
    // Add previous month's days
    for (let i = startDay - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }
    
    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  };

  const weekDays = getWeekDays();
  const monthDays = getMonthDays();
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dayLabelsChinese = ['一', '二', '三', '四', '五', '六', '日'];

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const formatDateDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const formatMonthYearChinese = (date: Date) => {
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月`;
  };

  const changeMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const goToToday = () => {
    const today = new Date();
    onSelectDate(today);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setShowFullCalendar(false);
  };

  const clearSelection = () => {
    setShowFullCalendar(false);
  };

  const handleDateSelect = (date: Date) => {
    onSelectDate(date);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowFullCalendar(false);
  };

  // Filter meals for selected date
  const selectedDateMeals = meals.filter(meal => isSameDay(meal.timestamp, selectedDate));
  
  const totalCaloriesToday = selectedDateMeals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = selectedDateMeals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalCarbs = selectedDateMeals.reduce((sum, meal) => sum + meal.carbs, 0);
  const totalFats = selectedDateMeals.reduce((sum, meal) => sum + meal.fats, 0);
  
  const progress = (totalCaloriesToday / userProfile.dailyCalories) * 100;
  const weeklySummaryItems = weeklyReport ? splitAdvice(weeklyReport.summary || '') : [];
  const weeklyHighlightItems = weeklyReport?.highlights
    ? weeklyReport.highlights.flatMap((item) => splitAdvice(item))
    : [];
  const weeklyItems = [...weeklySummaryItems, ...weeklyHighlightItems];
  const shouldCollapseWeekly = weeklyItems.length > 4;
  const [isWeeklyExpanded, setIsWeeklyExpanded] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto pb-28">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 border-b border-gray-100">
        {/* Empty header for spacing */}
      </div>

      <div className="px-5 py-6">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => changeMonth(-1)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-gray-900 font-medium">{formatMonthYear(currentMonth)}</span>
          <button 
            onClick={() => changeMonth(1)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week Calendar Grid */}
        <div className="mb-4">
          <div className="grid grid-cols-7 gap-2 mb-3">
            {dayLabels.map((label) => (
              <div key={label} className="text-center text-xs text-gray-500 font-medium">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm transition-all relative ${
                  isSameDay(date, selectedDate)
                    ? 'bg-[#2ECC71] text-white font-medium'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {date.getDate()}
                {isSameDay(date, selectedDate) && (
                  <div className="absolute bottom-2 w-1 h-1 rounded-full bg-white"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date Display with Calendar Toggle */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-gray-900 font-medium text-lg">{formatDateDisplay(selectedDate)}</span>
          <button 
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CalendarIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Full Calendar Modal */}
        {showFullCalendar && (
          <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => changeMonth(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <span className="text-gray-900 font-medium">{formatMonthYearChinese(currentMonth)}</span>
              <button 
                onClick={() => changeMonth(1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabelsChinese.map((label) => (
                <div key={label} className="text-center text-xs text-gray-500 font-medium py-1">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((dayInfo, index) => {
                const isSelected = isSameDay(dayInfo.date, selectedDate);
                const isToday = isSameDay(dayInfo.date, new Date());
                
                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(dayInfo.date)}
                    className={`aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                      isSelected
                        ? 'bg-gray-900 text-white font-semibold'
                        : isToday
                        ? 'bg-gray-600 text-white font-medium'
                        : dayInfo.isCurrentMonth
                        ? 'text-gray-900 hover:bg-gray-100'
                        : 'text-gray-400'
                    }`}
                  >
                    {dayInfo.date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <button 
                onClick={clearSelection}
                className="text-[#3498DB] text-sm font-medium"
              >
                清除
              </button>
              <button 
                onClick={goToToday}
                className="text-[#3498DB] text-sm font-medium"
              >
                今天
              </button>
            </div>
          </div>
        )}

        {/* Daily Summary Card */}
        <div className="bg-[#2ECC71] rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="text-sm opacity-90 mb-1">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              <div className="text-3xl font-bold mb-1">{totalCaloriesToday.toFixed(1)} kcal</div>
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
            <div>Protein: <span className="font-semibold">{totalProtein.toFixed(1)}g</span></div>
            <div>Carbs: <span className="font-semibold">{totalCarbs.toFixed(1)}g</span></div>
            <div>Fats: <span className="font-semibold">{totalFats.toFixed(1)}g</span></div>
          </div>
        </div>

        {/* Today's Meals */}
        <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">
            {isSameDay(selectedDate, new Date()) ? "Today's Meals" : "Meals"}
          </h2>
        </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading meals...</p>
              </div>
            ) : selectedDateMeals.length > 0 ? (
              selectedDateMeals.map((meal) => (
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
                      <span className="text-gray-900 font-semibold ml-2">{meal.calories} kcal</span>
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
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fats}g</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No meals logged for this date</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Overview */}
      <div className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Weekly Overview</h2>
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
            <div className="flex items-end justify-between h-40 gap-2">
              {[
                { day: 'M', value: 85 },
                { day: 'T', value: 92 },
                { day: 'W', value: 78 },
                { day: 'T', value: 95 },
                { day: 'F', value: 88 },
                { day: 'S', value: 100 },
                { day: 'S', value: 92 }
              ].map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full relative" style={{ height: `${item.value}%` }}>
                    <div
                      className="w-full bg-[#2ECC71] rounded-full absolute bottom-0"
                      style={{ height: `${item.value}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{item.day}</span>
                </div>
              ))}
            </div>
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
          ) : (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                No data available for this week.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
