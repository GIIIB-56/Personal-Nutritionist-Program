const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "data.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_name TEXT NOT NULL,
    calories REAL NOT NULL,
    protein_g REAL NOT NULL,
    carbs_g REAL NOT NULL,
    fat_g REAL NOT NULL,
    sugar_g REAL NOT NULL,
    sodium_mg REAL NOT NULL,
    fiber_g REAL NOT NULL,
    top_benefits TEXT NOT NULL,
    health_warnings TEXT NOT NULL,
    dietary_advice TEXT NOT NULL,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weight REAL,
    height REAL,
    activity_level TEXT,
    ai_provider TEXT,
    openai_key TEXT,
    gemini_key TEXT,
    theme_mode TEXT,
    font_scale REAL,
    target_type TEXT,
    daily_calorie_goal REAL
  );
`);

try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN height REAL`);
} catch (error) {
  // Column already exists.
}

try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN activity_level TEXT`);
} catch (error) {
  // Column already exists.
}

try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN ai_provider TEXT`);
} catch (error) {
  // Column already exists.
}

try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN openai_key TEXT`);
} catch (error) {
  // Column already exists.
}

try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN gemini_key TEXT`);
} catch (error) {
  // Column already exists.
}

try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN theme_mode TEXT`);
} catch (error) {
  // Column already exists.
}

try {
  db.exec(`ALTER TABLE user_profile ADD COLUMN font_scale REAL`);
} catch (error) {
  // Column already exists.
}

const insertRecordStmt = db.prepare(`
  INSERT INTO records (
    food_name,
    calories,
    protein_g,
    carbs_g,
    fat_g,
    sugar_g,
    sodium_mg,
    fiber_g,
    top_benefits,
    health_warnings,
    dietary_advice,
    source,
    created_at
  ) VALUES (
    @food_name,
    @calories,
    @protein_g,
    @carbs_g,
    @fat_g,
    @sugar_g,
    @sodium_mg,
    @fiber_g,
    @top_benefits,
    @health_warnings,
    @dietary_advice,
    @source,
    COALESCE(@created_at, datetime('now','localtime'))
  )
`);

const listTodayStmt = db.prepare(`
  SELECT *
  FROM records
  WHERE date(created_at) = date('now','localtime')
  ORDER BY datetime(created_at) DESC
`);

const listByDateStmt = db.prepare(`
  SELECT *
  FROM records
  WHERE date(created_at) = date(@date)
  ORDER BY datetime(created_at) DESC
`);
const summaryTodayStmt = db.prepare(`
  SELECT
    COALESCE(SUM(calories), 0) AS calories,
    COALESCE(SUM(protein_g), 0) AS protein_g,
    COALESCE(SUM(carbs_g), 0) AS carbs_g,
    COALESCE(SUM(fat_g), 0) AS fat_g,
    COALESCE(SUM(sugar_g), 0) AS sugar_g,
    COALESCE(SUM(sodium_mg), 0) AS sodium_mg,
    COALESCE(SUM(fiber_g), 0) AS fiber_g
  FROM records
  WHERE date(created_at) = date('now','localtime')
`);

const weeklySummaryStmt = db.prepare(`
  SELECT
    date(created_at) AS day,
    COALESCE(SUM(calories), 0) AS calories,
    COALESCE(SUM(protein_g), 0) AS protein_g,
    COALESCE(SUM(carbs_g), 0) AS carbs_g,
    COALESCE(SUM(fat_g), 0) AS fat_g,
    COALESCE(SUM(sugar_g), 0) AS sugar_g,
    COALESCE(SUM(sodium_mg), 0) AS sodium_mg,
    COALESCE(SUM(fiber_g), 0) AS fiber_g
  FROM records
  WHERE date(created_at) >= date('now','localtime','-6 days')
  GROUP BY date(created_at)
  ORDER BY date(created_at) ASC
`);

const summaryByRangeStmt = db.prepare(`
  SELECT
    date(created_at) AS day,
    COALESCE(SUM(calories), 0) AS calories,
    COALESCE(SUM(protein_g), 0) AS protein_g,
    COALESCE(SUM(carbs_g), 0) AS carbs_g,
    COALESCE(SUM(fat_g), 0) AS fat_g,
    COALESCE(SUM(sugar_g), 0) AS sugar_g,
    COALESCE(SUM(sodium_mg), 0) AS sodium_mg,
    COALESCE(SUM(fiber_g), 0) AS fiber_g
  FROM records
  WHERE date(created_at) >= date(@start)
    AND date(created_at) <= date(@end)
  GROUP BY date(created_at)
  ORDER BY date(created_at) ASC
`);

const getProfileStmt = db.prepare(`
  SELECT id, weight, height, activity_level, ai_provider, openai_key, gemini_key, theme_mode, font_scale, target_type, daily_calorie_goal
  FROM user_profile
  ORDER BY id ASC
  LIMIT 1
`);

const upsertProfileStmt = db.prepare(`
  INSERT INTO user_profile (id, weight, height, activity_level, ai_provider, openai_key, gemini_key, theme_mode, font_scale, target_type, daily_calorie_goal)
  VALUES (1, @weight, @height, @activity_level, @ai_provider, @openai_key, @gemini_key, @theme_mode, @font_scale, @target_type, @daily_calorie_goal)
  ON CONFLICT(id) DO UPDATE SET
    weight = excluded.weight,
    height = excluded.height,
    activity_level = excluded.activity_level,
    ai_provider = excluded.ai_provider,
    openai_key = excluded.openai_key,
    gemini_key = excluded.gemini_key,
    theme_mode = excluded.theme_mode,
    font_scale = excluded.font_scale,
    target_type = excluded.target_type,
    daily_calorie_goal = excluded.daily_calorie_goal
`);

function insertRecord(record) {
  const payload = {
    ...record,
    top_benefits: JSON.stringify(record.top_benefits || []),
    health_warnings: JSON.stringify(record.health_warnings || []),
    created_at: record.created_at || null,
  };
  const info = insertRecordStmt.run(payload);
  return info.lastInsertRowid;
}

function listToday() {
  const rows = listTodayStmt.all();
  return rows.map((row) => ({
    ...row,
    top_benefits: JSON.parse(row.top_benefits || "[]"),
    health_warnings: JSON.parse(row.health_warnings || "[]"),
  }));
}

function listByDate(date) {
  const rows = listByDateStmt.all({ date });
  return rows.map((row) => ({
    ...row,
    top_benefits: JSON.parse(row.top_benefits || "[]"),
    health_warnings: JSON.parse(row.health_warnings || "[]"),
  }));
}

function summaryToday() {
  return summaryTodayStmt.get();
}

function summaryLast7Days() {
  return weeklySummaryStmt.all();
}

function summaryByDateRange(startDate, endDate) {
  return summaryByRangeStmt.all({ start: startDate, end: endDate });
}

function getProfile() {
  return getProfileStmt.get() || {
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
  };
}

function upsertProfile(profile) {
  upsertProfileStmt.run(profile);
}

module.exports = {
  insertRecord,
  listToday,
  listByDate,
  summaryToday,
  summaryLast7Days,
  summaryByDateRange,
  getProfile,
  upsertProfile,
};
