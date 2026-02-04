import { ArrowLeft, MoreVertical, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { MealEntry, UserProfile } from '../App';

interface AnalysisResultProps {
  meal: MealEntry;
  userProfile: UserProfile;
  onSave: () => void;
  onBack: () => void;
}

export function AnalysisResult({ meal, userProfile, onSave, onBack }: AnalysisResultProps) {
  const [isScanning, setIsScanning] = useState(true);
  const isNonFood = Boolean(meal.isNonFood);
  const nonFoodMessage = 'No food detected. Please retake the photo.';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const confidence = 96;

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto pb-20 md:pb-24">
      {/* Header */}
      <div className="px-5 md:px-10 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-gray-900">Analysis Result</h1>
        <button className="w-10 h-10 flex items-center justify-center">
          <MoreVertical className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="px-5 md:px-10 py-6 md:py-8 md:max-w-4xl md:mx-auto w-full">
        {/* Food Image with Scanning Effect */}
        <div className="relative rounded-2xl overflow-hidden mb-5">
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-56 md:h-72 object-cover"
          />
          {isScanning ? (
            <div className="absolute top-4 right-4">
              <div className="px-4 py-2 rounded-full bg-[#2ECC71] text-white text-sm font-medium flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                AI Analyzing
              </div>
            </div>
          ) : null}
        </div>

        {!isScanning && (
          isNonFood ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#F59E0B] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-[#F59E0B] text-sm font-medium">No food detected</span>
              </div>
              <div className="bg-[#F8F9FA] rounded-2xl p-4 text-gray-700 text-sm leading-relaxed mb-6">
                {nonFoodMessage}
              </div>
              <button
                onClick={onBack}
                className="w-full h-14 rounded-xl bg-[#2ECC71] text-white hover:bg-[#27AE60] transition-colors font-medium"
              >
                Retake Photo
              </button>
            </>
          ) : (
            <>
            {/* Identified Badge */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#2ECC71] flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-[#2ECC71] text-sm font-medium">IDENTIFIED</span>
            </div>

            {/* Meal Name & Description */}
            <div className="mb-4">
              <h2 className="text-gray-900 mb-2">{meal.name}</h2>
              <p className="text-gray-600 leading-relaxed">{meal.description}</p>
            </div>

            {/* Confidence & Correction */}
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Confidence:</span>
                <span className="text-[#2ECC71] font-semibold">{confidence}%</span>
              </div>
            </div>

            {/* Nutritional Breakdown */}
            <h3 className="text-gray-900 mb-4">Nutritional Breakdown</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {/* Large Calories Card */}
              <div className="col-span-2 md:col-span-2 bg-[#2ECC71] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L12.5 7.5L18 8.5L14 13L15 18.5L10 16L5 18.5L6 13L2 8.5L7.5 7.5L10 2Z" 
                          fill="white" fillOpacity="0.9"/>
                  </svg>
                  <span className="text-sm font-medium uppercase">Calories</span>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-1">{meal.calories}</div>
                  <div className="text-sm opacity-90">kcal</div>
                </div>
              </div>

              {/* Protein Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" fill="#3498DB" fillOpacity="0.2"/>
                    <circle cx="10" cy="10" r="4" fill="#3498DB"/>
                  </svg>
                  <span className="text-sm text-gray-600 uppercase">Protein</span>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{meal.protein}</div>
                  <div className="text-sm text-gray-500">grams</div>
                </div>
              </div>

              {/* Carbs Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="4" width="12" height="12" rx="2" fill="#F59E0B" fillOpacity="0.8"/>
                  </svg>
                  <span className="text-sm text-gray-600 uppercase">Carbs</span>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{meal.carbs}</div>
                  <div className="text-sm text-gray-500">grams</div>
                </div>
              </div>

              {/* Fats Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 3L13 7L17 8L13.5 11.5L14.5 16L10 13.5L5.5 16L6.5 11.5L3 8L7 7L10 3Z" 
                          fill="#F97316" fillOpacity="0.8"/>
                  </svg>
                  <span className="text-sm text-gray-600 uppercase">Fats</span>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{meal.fats}</div>
                  <div className="text-sm text-gray-500">grams</div>
                </div>
              </div>
            </div>

            {/* Additional Nutrients */}
            <h3 className="text-gray-900 mb-3">Additional Nutrients</h3>
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
              <NutrientRow label="Fiber" value={`${meal.fiber || 6}g`} />
              <NutrientRow label="Sodium" value={`${meal.sodium || 420}mg`} />
              <NutrientRow label="Sugar" value={`${meal.sugar || 4}g`} />
              <NutrientRow label="Cholesterol" value={`${meal.cholesterol || 75}mg`} isLast />
            </div>

            {/* Save Button */}
            <button
              onClick={onSave}
              className="w-full h-14 rounded-xl bg-[#2ECC71] text-white hover:bg-[#27AE60] transition-colors font-medium"
            >
              Save to Diary
            </button>
            </>
          )
        )}
      </div>
    </div>
  );
}

interface NutrientRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function NutrientRow({ label, value, isLast }: NutrientRowProps) {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${!isLast ? 'border-b border-gray-100' : ''}`}>
      <span className="text-gray-700">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
