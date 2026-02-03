const store = {
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

function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
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
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function normalizeRecord(record) {
  return {
    food_name: record.food_name,
    calories: toNumber(record.calories),
    protein_g: toNumber(record.protein_g),
    carbs_g: toNumber(record.carbs_g),
    fat_g: toNumber(record.fat_g),
    sugar_g: toNumber(record.sugar_g),
    sodium_mg: toNumber(record.sodium_mg),
    fiber_g: toNumber(record.fiber_g),
    top_benefits: Array.isArray(record.top_benefits) ? record.top_benefits : [],
    health_warnings: Array.isArray(record.health_warnings) ? record.health_warnings : [],
    dietary_advice: record.dietary_advice || "",
    source: record.source || "image",
  };
}

function insertRecord(record) {
  const id = store.nextId++;
  const created_at = record.created_at || formatLocalDateTime(new Date());
  const normalized = normalizeRecord(record);
  store.records.push({ id, created_at, ...normalized });
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
  return store.records.reduce(
    (acc, row) => {
      const day = String(row.created_at || "").slice(0, 10);
      if (day !== formatLocalDate(new Date())) return acc;
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

function getProfile() {
  return store.profile;
}

function upsertProfile(profile) {
  store.profile = {
    ...store.profile,
    ...profile,
  };
}

module.exports = {
  insertRecord,
  listToday,
  listByDate,
  summaryToday,
  summaryByDateRange,
  getProfile,
  upsertProfile,
};
