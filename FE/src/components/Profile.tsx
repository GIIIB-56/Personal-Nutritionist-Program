import { ArrowLeft, User, Activity, Target } from 'lucide-react';
import { useState } from 'react';
import type { UserProfile, GoalType } from '../App';

interface ProfileProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onBack: () => void;
}

export function Profile({ userProfile, onUpdateProfile, onBack }: ProfileProps) {
  const [weight, setWeight] = useState(userProfile.weight.toString());
  const [height, setHeight] = useState(userProfile.height.toString());
  const [activityLevel, setActivityLevel] = useState(userProfile.activityLevel);
  const [goal, setGoal] = useState<GoalType>(userProfile.goal);
  const [aiProvider, setAiProvider] = useState(userProfile.aiProvider || 'openai');
  const [openaiKey, setOpenaiKey] = useState(userProfile.openaiKey || '');
  const [geminiKey, setGeminiKey] = useState(userProfile.geminiKey || '');
  const [themeMode, setThemeMode] = useState(userProfile.themeMode || 'light');
  const [fontScale, setFontScale] = useState(userProfile.fontScale || 1);

  const handleSave = () => {
    const weightNum = parseFloat(weight) || 70;
    const heightNum = parseFloat(height) || 175;
    
    // Calculate daily calories based on goal
    let dailyCalories = 2000;
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * 30 + 5;
    
    const activityMultipliers: { [key: string]: number } = {
      'Sedentary': 1.2,
      'Light': 1.375,
      'Moderate': 1.55,
      'Active': 1.725,
      'Very Active': 1.9
    };
    
    const multiplier = activityMultipliers[activityLevel] || 1.55;
    
    switch (goal) {
      case 'lose':
        dailyCalories = Math.round(bmr * multiplier - 500);
        break;
      case 'maintain':
        dailyCalories = Math.round(bmr * multiplier);
        break;
      case 'gain':
        dailyCalories = Math.round(bmr * multiplier + 500);
        break;
    }

    onUpdateProfile({
      weight: weightNum,
      height: heightNum,
      activityLevel,
      goal,
      dailyCalories,
      aiProvider,
      openaiKey,
      geminiKey,
      themeMode,
      fontScale
    });
    onBack();
  };

  const getGoalDescription = (goalType: GoalType) => {
    switch (goalType) {
      case 'lose':
        return 'Lose weight mode creates a calorie deficit while maintaining protein for muscle preservation. Focus on whole foods and regular activity for sustainable fat loss.';
      case 'maintain':
        return 'Maintain mode focuses on nutrient density and steady energy levels. Perfect for sustaining your current physique while optimizing overall health and wellness.';
      case 'gain':
        return 'Gain muscle mode provides a calorie surplus with high protein intake. Combine with progressive resistance training for optimal muscle growth and strength gains.';
    }
  };

  const activityLevels = [
    { value: 'Sedentary', label: 'Sedentary (Little to no exercise)' },
    { value: 'Light', label: 'Light (Exercise 1-3 days/week)' },
    { value: 'Moderate', label: 'Moderate (Exercise 3-5 days/week)' },
    { value: 'Active', label: 'Active (Exercise 6-7 days/week)' },
    { value: 'Very Active', label: 'Very Active (Intense daily exercise)' }
  ];

  const bmi = ((parseFloat(weight) || 70) / Math.pow((parseFloat(height) || 175) / 100, 2)).toFixed(1);
  const bmiValue = parseFloat(bmi);
  
  const getBMIStatus = () => {
    if (bmiValue < 18.5) return { label: 'Underweight', color: '#3498DB' };
    if (bmiValue < 25) return { label: 'Normal', color: '#2ECC71' };
    if (bmiValue < 30) return { label: 'Overweight', color: '#F59E0B' };
    return { label: 'Obese', color: '#E74C3C' };
  };

  const bmiStatus = getBMIStatus();

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="w-10" />
        <h1 className="text-gray-900">Profile & Goals</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 py-6 flex-1 pb-28">
        {/* Profile Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2ECC71] to-[#27AE60] flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* User Stats Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-[#2ECC71]" />
            <h2 className="text-gray-900">Your Stats</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm mb-2 block">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] border border-transparent focus:border-[#2ECC71]"
                placeholder="70"
              />
            </div>
            
            <div>
              <label className="text-gray-600 text-sm mb-2 block">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] border border-transparent focus:border-[#2ECC71]"
                placeholder="175"
              />
            </div>
            
            <div>
              <label className="text-gray-600 text-sm mb-2 block">Activity Level</label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] border border-transparent focus:border-[#2ECC71] appearance-none cursor-pointer"
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* BMI Card */}
        <div className="bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-900">Body Mass Index</h3>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ backgroundColor: bmiStatus.color + '20', color: bmiStatus.color }}>
              {bmiStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-4xl font-bold text-gray-900">{bmi}</span>
            <span className="text-gray-600">BMI</span>
          </div>
          <div className="w-full h-2 bg-white rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${Math.min((bmiValue / 40) * 100, 100)}%`,
                backgroundColor: bmiStatus.color
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
          </div>
        </div>

        {/* Goal Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#2ECC71]" />
            <h2 className="text-gray-900">Your Goal</h2>
          </div>
          
          <div className="bg-[#F8F9FA] rounded-2xl p-2 grid grid-cols-3 gap-2 mb-4">
            <button
              onClick={() => setGoal('lose')}
              className={`h-12 rounded-xl transition-all font-medium ${
                goal === 'lose'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Lose Weight
            </button>
            <button
              onClick={() => setGoal('maintain')}
              className={`h-12 rounded-xl transition-all font-medium ${
                goal === 'maintain'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Maintain
            </button>
            <button
              onClick={() => setGoal('gain')}
              className={`h-12 rounded-xl transition-all font-medium ${
                goal === 'gain'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gain Muscle
            </button>
          </div>

          {/* Dynamic Goal Description */}
          <div className="bg-gradient-to-br from-[#E8F8F5] to-[#D5F5E3] rounded-2xl p-5">
            <h3 className="text-gray-900 mb-2 font-medium">About This Goal</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{getGoalDescription(goal)}</p>
          </div>
        </div>

        {/* AI Settings */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#2ECC71]" />
            <h2 className="text-gray-900">AI Provider</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm mb-2 block">Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as 'openai' | 'gemini')}
                className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] border border-transparent focus:border-[#2ECC71] appearance-none cursor-pointer"
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
            <div>
              <label className="text-gray-600 text-sm mb-2 block">OpenAI API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] border border-transparent focus:border-[#2ECC71]"
                placeholder="sk-..."
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm mb-2 block">Gemini API Key</label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-[#F8F9FA] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] border border-transparent focus:border-[#2ECC71]"
                placeholder="AIza..."
              />
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-[#2ECC71]" />
            <h2 className="text-gray-900">Display</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-gray-600 text-sm mb-2 block">Theme</label>
              <div className="bg-[#F8F9FA] rounded-2xl p-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setThemeMode('light')}
                  className={`h-11 rounded-xl transition-all font-medium ${
                    themeMode === 'light'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setThemeMode('dark')}
                  className={`h-11 rounded-xl transition-all font-medium ${
                    themeMode === 'dark'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
            <div>
              <label className="text-gray-600 text-sm mb-2 block">
                Font Size ({Math.round((fontScale || 1) * 100)}%)
              </label>
              <input
                type="range"
                min="0.9"
                max="1.1"
                step="0.05"
                value={fontScale}
                onChange={(e) => setFontScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Daily Calorie Target */}
        <div className="bg-[#2ECC71] rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L12.5 7.5L18 8.5L14 13L15 18.5L10 16L5 18.5L6 13L2 8.5L7.5 7.5L10 2Z" 
                    fill="white" fillOpacity="0.9"/>
            </svg>
            <span className="text-sm font-medium opacity-90">Estimated Daily Target</span>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-bold">
              {(() => {
                const weightNum = parseFloat(weight) || 70;
                const heightNum = parseFloat(height) || 175;
                const bmr = 10 * weightNum + 6.25 * heightNum - 5 * 30 + 5;
                const activityMultipliers: { [key: string]: number } = {
                  'Sedentary': 1.2, 'Light': 1.375, 'Moderate': 1.55, 'Active': 1.725, 'Very Active': 1.9
                };
                const multiplier = activityMultipliers[activityLevel] || 1.55;
                let calories = Math.round(bmr * multiplier);
                if (goal === 'lose') calories -= 500;
                if (goal === 'gain') calories += 500;
                return calories.toLocaleString();
              })()}
            </span>
            <span className="text-lg opacity-90">kcal/day</span>
          </div>
          <p className="text-sm opacity-90">
            Based on your stats and {goal === 'lose' ? 'weight loss' : goal === 'maintain' ? 'maintenance' : 'muscle gain'} goal
          </p>
        </div>
      </div>

      {/* Save Button - Fixed at bottom */}
      <div className="px-5 pb-32 pt-4 bg-white border-t border-gray-100">
        <button
          onClick={handleSave}
          className="w-full h-14 rounded-xl bg-[#2ECC71] text-white hover:bg-[#27AE60] transition-colors font-medium"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
