export interface ApiMeal {
  food_name: string;
  is_non_food?: boolean;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sugar_g: number;
  sodium_mg: number;
  fiber_g: number;
  top_benefits: string[];
  health_warnings: string[];
  dietary_advice: string;
  source?: "image" | "text";
}

export interface ApiProfile {
  weight: number | null;
  height?: number | null;
  activity_level?: string | null;
  ai_provider?: "openai" | "gemini" | null;
  openai_key?: string | null;
  gemini_key?: string | null;
  theme_mode?: "light" | "dark" | null;
  font_scale?: number | null;
  target_type: "lose" | "maintain" | "gain" | null;
  daily_calorie_goal: number | null;
}

export interface WeeklyReport {
  summary: string;
  highlights: string[];
  total_days: number;
  days_met: number;
  days_over: number;
  days_under: number;
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  return response.json() as Promise<T>;
}

export function analyzeImage(base64: string) {
  return requestJson<{ success: true; data: ApiMeal }>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ image: base64 }),
  });
}

export function analyzeText(text: string) {
  return requestJson<{ success: true; data: ApiMeal[] }>("/api/analyze-text", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function saveRecords(records: ApiMeal[], recordDate?: string) {
  return requestJson<{ success: true; ids: number[] }>("/api/records", {
    method: "POST",
    body: JSON.stringify({ record: records, record_date: recordDate }),
  });
}

export function getTodayRecords() {
  return requestJson<{ success: true; data: Array<ApiMeal & { id: number; created_at: string }> }>(
    "/api/records/today"
  );
}

export function getRecordsByDate(date: string) {
  return requestJson<{ success: true; data: Array<ApiMeal & { id: number; created_at: string }> }>(
    `/api/records?date=${encodeURIComponent(date)}`
  );
}

export function getProfile() {
  return requestJson<{ success: true; data: ApiProfile }>("/api/profile");
}

export function updateProfile(profile: ApiProfile) {
  return requestJson<{ success: true }>("/api/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}

export function getAdviceToday() {
  return requestJson<{ success: true; data: { advice: string } }>("/api/advice/today");
}

export function getWeeklyReport(date?: string) {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return requestJson<{ success: true; data: WeeklyReport }>(`/api/report/weekly${query}`);
}
