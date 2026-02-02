import { ArrowLeft, MoreVertical, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { MealEntry, UserProfile } from '../App';

interface AnalysisResultProps {
  meal: MealEntry;
  userProfile: UserProfile;
  onSave: () => void;
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

export function AnalysisResult({ meal, userProfile, onSave, onBack }: AnalysisResultProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [isAdviceExpanded, setIsAdviceExpanded] = useState(false);
  const isNonFood = Boolean(meal.isNonFood);
  const nonFoodMessage = '你上传的图片未检测到食物，请重新拍摄。';
  const adviceItems = splitAdvice(meal.advice || '');
  const shouldCollapseAdvice = adviceItems.length > 3;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScanning(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const confidence = 96;
  const formatNumber = (value?: number) =>
    typeof value === 'number' ? value.toFixed(1) : '0.0';

  return (
    <div className="h-full flex flex-col bg-white overflow-y-auto pb-20">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
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

      <div className="px-5 py-6">
        {/* Food Image with Scanning Effect */}
        <div className="relative rounded-2xl overflow-hidden mb-5">
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className="w-full h-56 object-cover"
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
                <span className="text-[#F59E0B] text-sm font-medium">未检测到食物</span>
              </div>
              <div className="bg-[#F8F9FA] rounded-2xl p-4 text-gray-700 text-sm leading-relaxed mb-6">
                {nonFoodMessage}
              </div>
              <button
                onClick={onBack}
                className="w-full h-14 rounded-xl bg-[#2ECC71] text-white hover:bg-[#27AE60] transition-colors font-medium"
              >
                返回重拍
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
                <button className="text-[#3498DB] text-sm hover:underline">
                  Not correct?
                </button>
              </div>

              {/* Nutritional Breakdown */}
              <h3 className="text-gray-900 mb-4">Nutritional Breakdown</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-5">
                {/* Large Calories Card */}
                <div className="col-span-1 bg-[#2ECC71] rounded-2xl p-5 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2L12.5 7.5L18 8.5L14 13L15 18.5L10 16L5 18.5L6 13L2 8.5L7.5 7.5L10 2Z" 
                            fill="white" fillOpacity="0.9"/>
                    </svg>
                    <span className="text-sm font-medium uppercase">Calories</span>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-1">{formatNumber(meal.calories)}</div>
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
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatNumber(meal.protein)}
                    </div>
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
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatNumber(meal.carbs)}
                    </div>
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
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {formatNumber(meal.fats)}
                    </div>
                    <div className="text-sm text-gray-500">grams</div>
                  </div>
                </div>
              </div>

              {/* Additional Nutrients */}
              <h3 className="text-gray-900 mb-3">Additional Nutrients</h3>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6">
                <NutrientRow label="Fiber" value={`${formatNumber(meal.fiber)}g`} />
                <NutrientRow label="Sodium" value={`${formatNumber(meal.sodium)}mg`} />
                <NutrientRow label="Sugar" value={`${formatNumber(meal.sugar)}g`} />
                <NutrientRow label="Cholesterol" value={`${formatNumber(meal.cholesterol)}mg`} isLast />
              </div>

              {/* AI Advice */}
            <h3 className="text-gray-900 mb-3">AI Dietary Advice</h3>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 text-gray-700 text-sm leading-relaxed mb-6">
              {adviceItems.length ? (
                <>
                  <ul className="list-disc pl-5 space-y-1">
                    {(shouldCollapseAdvice && !isAdviceExpanded
                      ? adviceItems.slice(0, 3)
                      : adviceItems
                    ).map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                  {shouldCollapseAdvice ? (
                    <button
                      type="button"
                      onClick={() => setIsAdviceExpanded((prev) => !prev)}
                      className="mt-3 text-[#2ECC71] text-sm font-medium hover:underline"
                    >
                      {isAdviceExpanded ? '收起建议' : '展开建议'}
                    </button>
                  ) : null}
                </>
              ) : (
                'No advice available for this meal yet.'
              )}
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




