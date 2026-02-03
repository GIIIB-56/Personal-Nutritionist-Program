const SYSTEM_PROMPT = [
  "Role: You are a professional nutritionist.",
  "Task: Identify the food in the image or description, estimate nutrition, and provide advice.",
  "Rules:",
  "1. Return strict JSON only.",
  "2. If the input is not food, mention that in food_name.",
  "3. Advice should be concise and actionable.",
  "4. Must include keys: food_name, calories, protein_g, carbs_g, fat_g, sugar_g, sodium_mg, fiber_g, top_benefits, health_warnings, dietary_advice.",
  "5. top_benefits and health_warnings must be arrays of strings.",
].join("\n");

const NON_FOOD_MESSAGE = "No food detected. Please retake the photo.";

const store = globalThis.__PN_STORE__ || {
  nextId: 1,
  records: [],
  profile: {
    weight: null,
    height: null,
    activity_level: null,
    ai_provider: null,
    openai_key: null,
    gemini_key: null,
    theme_mode: null,
    font_scale: null,
    target_type: null,
    daily_calorie_goal: null,
  },
};

globalThis.__PN_STORE__ = store;

function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toString(value, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => toString(item, "")).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  return [];
}

function normalizeAdviceText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\r/g, "\n").replace(/[^\S\n]+/g, " ").trim();
}

function isNonFoodName(value) {
  if (!value) return false;
  const normalized = String(value).toLowerCase();
  const keywords = ["not food", "non-food", "no food", "not edible"];
  return keywords.some((keyword) => normalized.includes(keyword));
}

function normalizeItem(raw) {
  const nutrients = raw?.nutrients || {};
  const foodName = toString(raw?.food_name || raw?.food_item, "Unknown meal");
  const isNonFood = isNonFoodName(foodName);

  return {
    food_name: foodName,
    is_non_food: isNonFood,
    calories: toNumber(raw?.calories ?? nutrients.calories, 0),
    protein_g: toNumber(raw?.protein_g ?? nutrients.protein, 0),
    carbs_g: toNumber(raw?.carbs_g ?? nutrients.carbs, 0),
    fat_g: toNumber(raw?.fat_g ?? nutrients.fat, 0),
    sugar_g: toNumber(raw?.sugar_g, 0),
    sodium_mg: toNumber(raw?.sodium_mg, 0),
    fiber_g: toNumber(raw?.fiber_g, 0),
    top_benefits: toStringArray(raw?.top_benefits),
    health_warnings: toStringArray(raw?.health_warnings),
    dietary_advice: isNonFood
      ? NON_FOOD_MESSAGE
      : normalizeAdviceText(toString(raw?.dietary_advice, "")),
  };
}

function parseJson(content) {
  try {
    return JSON.parse(content || "{}");
  } catch (error) {
    const parseError = new Error("MODEL_JSON_INVALID");
    parseError.cause = error;
    throw parseError;
  }
}

function parseModelContent(content) {
  return normalizeItem(parseJson(content));
}

function parseTextContent(content) {
  const parsed = parseJson(content);
  const items = Array.isArray(parsed?.items)
    ? parsed.items
    : Array.isArray(parsed)
    ? parsed
    : [parsed];
  return items.map(normalizeItem);
}

function parseAdviceContent(content) {
  const parsed = parseJson(content);
  return {
    advice: normalizeAdviceText(toString(parsed?.advice, "")),
  };
}

function parseWeeklyContent(content) {
  const parsed = parseJson(content);
  return {
    summary: normalizeAdviceText(toString(parsed?.summary, "")),
    highlights: toStringArray(parsed?.highlights)
      .map((item) => normalizeAdviceText(item))
      .filter(Boolean),
  };
}

function formatLocalDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ].join(" ");
}

function formatLocalDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
}

function buildRecordTimestamp(recordDate) {
  const match = String(recordDate || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const now = new Date();
  const merged = new Date(now);
  merged.setFullYear(year, month, day);
  if (
    merged.getFullYear() !== year ||
    merged.getMonth() !== month ||
    merged.getDate() !== day
  ) {
    return null;
  }
  return formatLocalDateTime(merged);
}

function parseDateOnly(value) {
  const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

function getWeekRange(date) {
  const start = new Date(date);
  const dayOfWeek = start.getDay() || 7;
  start.setDate(start.getDate() - dayOfWeek + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end),
  };
}

function insertRecord(record) {
  const id = store.nextId++;
  const created_at = record.created_at || formatLocalDateTime(new Date());
  store.records.push({ id, ...record, created_at });
  return id;
}

function listToday() {
  const today = formatLocalDate(new Date());
  return store.records
    .filter((row) => String(row.created_at || "").startsWith(today))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

function listByDate(date) {
  return store.records
    .filter((row) => String(row.created_at || "").startsWith(date))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

function summaryToday() {
  const todayRecords = listToday();
  return summarizeRecords(todayRecords);
}

function summaryByDateRange(startDate, endDate) {
  const summaryMap = new Map();
  for (const row of store.records) {
    const day = String(row.created_at || "").slice(0, 10);
    if (day < startDate || day > endDate) continue;
    if (!summaryMap.has(day)) {
      summaryMap.set(day, {
        day,
        calories: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        sugar_g: 0,
        sodium_mg: 0,
        fiber_g: 0,
      });
    }
    const entry = summaryMap.get(day);
    entry.calories += toNumber(row.calories);
    entry.protein_g += toNumber(row.protein_g);
    entry.carbs_g += toNumber(row.carbs_g);
    entry.fat_g += toNumber(row.fat_g);
    entry.sugar_g += toNumber(row.sugar_g);
    entry.sodium_mg += toNumber(row.sodium_mg);
    entry.fiber_g += toNumber(row.fiber_g);
  }
  return Array.from(summaryMap.values()).sort((a, b) =>
    a.day.localeCompare(b.day)
  );
}

function summarizeRecords(records) {
  return records.reduce(
    (acc, row) => {
      acc.calories += toNumber(row.calories);
      acc.protein_g += toNumber(row.protein_g);
      acc.carbs_g += toNumber(row.carbs_g);
      acc.fat_g += toNumber(row.fat_g);
      acc.sugar_g += toNumber(row.sugar_g);
      acc.sodium_mg += toNumber(row.sodium_mg);
      acc.fiber_g += toNumber(row.fiber_g);
      return acc;
    },
    {
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      sugar_g: 0,
      sodium_mg: 0,
      fiber_g: 0,
    }
  );
}

function computeWeeklyStats(weekly, goal) {
  if (!goal || !Array.isArray(weekly)) {
    return {
      total_days: weekly?.length || 0,
      days_met: 0,
      days_over: 0,
      days_under: 0,
    };
  }
  const low = goal * 0.9;
  const high = goal * 1.1;
  let days_met = 0;
  let days_over = 0;
  let days_under = 0;

  for (const day of weekly) {
    const calories = Number(day.calories || 0);
    if (calories >= low && calories <= high) days_met += 1;
    else if (calories > high) days_over += 1;
    else days_under += 1;
  }

  return {
    total_days: weekly.length,
    days_met,
    days_over,
    days_under,
  };
}

function buildAdvicePrompt(profile, summary) {
  const goal = Number(profile.daily_calorie_goal || 0);
  const calories = Number(summary.calories || 0);
  const diff = goal - calories;
  const target = profile.target_type || "maintain";
  const rangeLow = Math.round(goal * 0.9);
  const rangeHigh = Math.round(goal * 1.1);

  return [
    "You are a nutritionist. Provide advice for today.",
    'Return strict JSON: {"advice":"..."}',
    `User goal: ${target}`,
    `Today calories: ${calories} kcal`,
    `Target calories: ${goal} kcal`,
    `Remaining calories: ${diff} kcal`,
    `Macros (g): protein ${summary.protein_g}, carbs ${summary.carbs_g}, fat ${summary.fat_g}`,
    `Sugar ${summary.sugar_g}g, sodium ${summary.sodium_mg}mg, fiber ${summary.fiber_g}g`,
    `Target range: ${rangeLow}-${rangeHigh} kcal`,
  ].join("\n");
}

function getAiConfig() {
  return {
    provider: process.env.AI_PROVIDER || "openai",
    openaiKey: process.env.OPENAI_API_KEY,
    geminiKey: process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  };
}

async function callOpenAI({ apiKey, prompt, image }) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    image
      ? {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: image } },
          ],
        }
      : { role: "user", content: prompt },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || "OpenAI request failed");
    error.status = response.status;
    throw error;
  }
  const json = await response.json();
  return json.choices?.[0]?.message?.content || "{}";
}

async function callGemini({ apiKey, prompt, image, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const parts = [{ text: prompt }];
  if (image) {
    const match = String(image).match(/^data:(image\/[^;]+);base64,(.+)$/i);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      });
    }
  }
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });
  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || "Gemini request failed");
    error.status = response.status;
    throw error;
  }
  const json = await response.json();
  const content = (json.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .join("");
  return content || "{}";
}

async function readJson(req) {
  if (req.body) {
    if (typeof req.body === "object") return req.body;
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

module.exports = {
  SYSTEM_PROMPT,
  NON_FOOD_MESSAGE,
  buildAdvicePrompt,
  buildRecordTimestamp,
  computeWeeklyStats,
  formatLocalDate,
  getAiConfig,
  getWeekRange,
  insertRecord,
  listByDate,
  listToday,
  normalizeItem,
  parseAdviceContent,
  parseModelContent,
  parseTextContent,
  parseWeeklyContent,
  parseDateOnly,
  readJson,
  summaryByDateRange,
  summaryToday,
  store,
  callOpenAI,
  callGemini,
};
