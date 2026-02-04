const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const db = require("./db");

dotenv.config();

const app = express();

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) {
  const proxyAgent = new ProxyAgent(proxyUrl);
  setGlobalDispatcher(proxyAgent);
  console.log(`Proxy enabled: ${proxyUrl}`);
}

function getOpenAIClient(apiKey) {
  return new OpenAI({
    apiKey,
    timeout: 60000,
  });
}

const SYSTEM_PROMPT = [
  "Role: You are a professional nutritionist.",
  "Task: Identify the food in the image, estimate nutrition, and give advice.",
  "Rules:",
  "1. Return strict JSON only.",
  "2. If the image is not food, mention it in food_name.",
  "3. Advice should be concise and actionable for the current intake.",
  "4. Must include keys: food_name, calories, protein_g, carbs_g, fat_g, sugar_g, sodium_mg, fiber_g, top_benefits, health_warnings, dietary_advice.",
  "5. top_benefits and health_warnings must be arrays of strings.",
].join("\n");

const NON_FOOD_MESSAGE = "No food detected. Please retake the photo.";

function toNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

function toString(value, fallback = "") {
  if (typeof value === "string") return value.trim();
  if (value === null || value === undefined) return fallback;
  return String(value);
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

function normalizeWeight(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}g`;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "Unknown";
    if (/[a-zA-Z]/.test(trimmed)) return trimmed;
    const parsed = Number.parseFloat(trimmed);
    return Number.isFinite(parsed) ? `${parsed}g` : trimmed;
  }
  return "Unknown";
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
  return value
    .replace(/\r/g, "\n")
    .replace(/[•·▪●○■□◆◇]/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/\uFFFD/g, "")
    .replace(/[\u0400-\u04FF]/g, "")
    .replace(/[^\S\n]+/g, " ")
    .trim();
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

function parseModelContent(content) {
  let parsed;
  try {
    parsed = JSON.parse(content || "{}");
  } catch (error) {
    throw new Error("MODEL_JSON_INVALID");
  }
  return normalizeItem(parsed);
}

function parseTextContent(content) {
  let parsed;
  try {
    parsed = JSON.parse(content || "{}");
  } catch (error) {
    throw new Error("MODEL_JSON_INVALID");
  }
  const items = Array.isArray(parsed?.items)
    ? parsed.items
    : Array.isArray(parsed)
    ? parsed
    : [parsed];
  return items.map(normalizeItem);
}

function parseAdviceContent(content) {
  let parsed;
  try {
    parsed = JSON.parse(content || "{}");
  } catch (error) {
    throw new Error("MODEL_JSON_INVALID");
  }
  return {
    advice: normalizeAdviceText(toString(parsed?.advice, "")),
  };
}

function parseWeeklyContent(content) {
  let parsed;
  try {
    parsed = JSON.parse(content || "{}");
  } catch (error) {
    throw new Error("MODEL_JSON_INVALID");
  }
  return {
    summary: normalizeAdviceText(toString(parsed?.summary, "")),
    highlights: toStringArray(parsed?.highlights)
      .map((item) => normalizeAdviceText(item))
      .filter(Boolean),
  };
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
    "You are a nutritionist. Provide advice based on the user's goal and today's intake.",
    'Return strict JSON: {"advice":"..."}',
    `User goal: ${target}`,
    `Today intake: ${calories} kcal`,
    `Target calories: ${goal} kcal`,
    `Remaining calories: ${diff} kcal`,
    `Macros (g): protein ${summary.protein_g}, carbs ${summary.carbs_g}, fat ${summary.fat_g}`,
    `Sugar ${summary.sugar_g}g, sodium ${summary.sodium_mg}mg, fiber ${summary.fiber_g}g`,
    `Target range: ${rangeLow}-${rangeHigh} kcal`,
  ].join("\n");
}

function getAiConfig(profile) {
  const envOpenaiKey = process.env.OPENAI_API_KEY;
  const envGeminiKey = process.env.GEMINI_API_KEY;
  return {
    provider: profile.ai_provider || process.env.AI_PROVIDER || "openai",
    openaiKey: envOpenaiKey || profile.openai_key,
    geminiKey: envGeminiKey || profile.gemini_key,
  };
}

const geminiModelCache = {
  value: null,
  expiresAt: 0,
};

async function resolveGeminiModel(apiKey) {
  const configured = process.env.GEMINI_MODEL;
  if (configured) {
    return configured;
  }
  const now = Date.now();
  if (geminiModelCache.value && geminiModelCache.expiresAt > now) {
    return geminiModelCache.value;
  }

  const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(listUrl);
  if (!response.ok) {
    return "gemini-1.5-pro";
  }
  const json = await response.json();
  const models = (json.models || []).filter((model) =>
    (model.supportedGenerationMethods || []).includes("generateContent")
  );
  const preferred = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
  ];
  let selected =
    preferred.find((name) => models.some((model) => model.name === `models/${name}`)) ||
    models[0]?.name?.replace("models/", "");

  if (!selected) {
    selected = "gemini-1.5-pro";
  }

  geminiModelCache.value = selected;
  geminiModelCache.expiresAt = now + 5 * 60 * 1000;
  return selected;
}

async function callGemini({ apiKey, prompt, image }) {
  const model = await resolveGeminiModel(apiKey);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const parts = [{ text: prompt }];
  if (image) {
    parts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64,
      },
    });
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

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/api/analyze", async (req, res) => {
  const startedAt = Date.now();
  const { image } = req.body || {};
  const profile = db.getProfile();
  const aiConfig = getAiConfig(profile);

  if (!image) {
    return res.status(400).json({
      success: false,
      error: "Missing image in request body.",
    });
  }

  if (aiConfig.provider === "openai" && !aiConfig.openaiKey) {
    return res.status(500).json({
      success: false,
      error: "OPENAI_API_KEY is not configured.",
    });
  }
  if (aiConfig.provider === "gemini" && !aiConfig.geminiKey) {
    return res.status(500).json({
      success: false,
      error: "GEMINI_API_KEY is not configured.",
    });
  }

  const match = String(image).match(
    /^data:(image\/(jpeg|jpg|png));base64,(.+)$/i
  );
  if (!match) {
    return res.status(400).json({
      success: false,
      error: "Invalid image format. Expect data:image/jpeg;base64,...",
    });
  }

  const mimeType = match[1];
  const base64Payload = match[3];
  const dataUrl = `data:${mimeType};base64,${base64Payload}`;

  try {
    let content = "{}";
    if (aiConfig.provider === "gemini") {
      content = await callGemini({
        apiKey: aiConfig.geminiKey,
        prompt: [SYSTEM_PROMPT, "Return JSON following the rules."].join("\n"),
        image: { mimeType, base64: base64Payload },
      });
    } else {
      const openai = getOpenAIClient(aiConfig.openaiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: "Return JSON following the rules." },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      });
      content = response.choices?.[0]?.message?.content || "{}";
    }
    const data = parseModelContent(content);

    if (data && data.food_name) {
      console.log(`food_name: ${data.food_name}`);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error?.message === "MODEL_JSON_INVALID") {
      console.error("Model returned invalid JSON.");
      return res.status(502).json({
        success: false,
        error: "Model returned invalid JSON.",
      });
    }
    console.error(`AI request failed (${aiConfig.provider}):`, {
      message: error?.message,
      status: error?.status,
      name: error?.name,
      code: error?.code,
      type: error?.type,
    });
    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        error: "API key is invalid or unauthorized.",
      });
    }
    if (error?.status === 429) {
      return res.status(500).json({
        success: false,
        error: "Quota exceeded or rate limit reached.",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Recognition service is temporarily unavailable.",
    });
  } finally {
    const costMs = Date.now() - startedAt;
    console.log(`request_time_ms: ${costMs}`);
  }
});

app.post("/api/analyze-text", async (req, res) => {
  const startedAt = Date.now();
  const { text } = req.body || {};
  const profile = db.getProfile();
  const aiConfig = getAiConfig(profile);

  if (!text) {
    return res.status(400).json({
      success: false,
      error: "Missing text in request body.",
    });
  }

  if (aiConfig.provider === "openai" && !aiConfig.openaiKey) {
    return res.status(500).json({
      success: false,
      error: "OPENAI_API_KEY is not configured.",
    });
  }
  if (aiConfig.provider === "gemini" && !aiConfig.geminiKey) {
    return res.status(500).json({
      success: false,
      error: "GEMINI_API_KEY is not configured.",
    });
  }

  try {
    const textPrompt = [
      SYSTEM_PROMPT,
      "Note: The user input is a text description, not an image.",
      "If multiple foods are mentioned, return an items array with one record per food.",
      "If only one food is mentioned, still return an items array with 1 record.",
      `User food description: ${text}`,
    ].join("\n");

    let content = "{}";
    if (aiConfig.provider === "gemini") {
      content = await callGemini({
        apiKey: aiConfig.geminiKey,
        prompt: textPrompt,
      });
    } else {
      const openai = getOpenAIClient(aiConfig.openaiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              SYSTEM_PROMPT,
              "Note: The user input is a text description, not an image.",
              "If multiple foods are mentioned, return an items array with one record per food.",
              "If only one food is mentioned, still return an items array with 1 record.",
            ].join("\n"),
          },
          { role: "user", content: `User food description: ${text}` },
        ],
      });
      content = response.choices?.[0]?.message?.content || "{}";
    }
    const data = parseTextContent(content);

    if (Array.isArray(data) && data[0]?.food_name) {
      console.log(`food_name: ${data[0].food_name}`);
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error?.message === "MODEL_JSON_INVALID") {
      console.error("Model returned invalid JSON.");
      return res.status(502).json({
        success: false,
        error: "Model returned invalid JSON.",
      });
    }
    console.error(`AI request failed (${aiConfig.provider}):`, {
      message: error?.message,
      status: error?.status,
      name: error?.name,
      code: error?.code,
      type: error?.type,
    });
    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        error: "API key is invalid or unauthorized.",
      });
    }
    if (error?.status === 429) {
      return res.status(500).json({
        success: false,
        error: "Quota exceeded or rate limit reached.",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Recognition service is temporarily unavailable.",
    });
  } finally {
    const costMs = Date.now() - startedAt;
    console.log(`request_time_ms: ${costMs}`);
  }
});

app.post("/api/records", (req, res) => {
  const { record, record_date: recordDate } = req.body || {};

  if (!record) {
    return res.status(400).json({
      success: false,
      error: "Missing record in request body.",
    });
  }

  const createdAt = buildRecordTimestamp(recordDate);
  const records = Array.isArray(record) ? record : [record];
  const ids = records.map((item) => {
    const normalized = normalizeItem(item);
    const source = item.source === "text" ? "text" : "image";
    return db.insertRecord({
      ...normalized,
      source,
      created_at: createdAt,
    });
  });

  return res.status(200).json({
    success: true,
    ids,
  });
});

app.get("/api/records/today", (req, res) => {
  const records = db.listToday();
  return res.status(200).json({
    success: true,
    data: records,
  });
});

app.get("/api/records", (req, res) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({
      success: false,
      error: "Missing date query parameter.",
    });
  }
  const records = db.listByDate(String(date));
  return res.status(200).json({
    success: true,
    data: records,
  });
});

app.get("/api/summary/today", (req, res) => {
  const summary = db.summaryToday();
  return res.status(200).json({
    success: true,
    data: summary,
  });
});

app.get("/api/advice/today", async (req, res) => {
  const startedAt = Date.now();
  const profile = db.getProfile();
  const aiConfig = getAiConfig(profile);
  const summary = db.summaryToday();

  if (!profile.daily_calorie_goal || !profile.target_type) {
    return res.status(400).json({
      success: false,
      error: "Profile is incomplete. Set target_type and daily_calorie_goal.",
    });
  }

  try {
    let content = "{}";
    const prompt = buildAdvicePrompt(profile, summary);
    if (aiConfig.provider === "gemini") {
      if (!aiConfig.geminiKey) {
        return res.status(500).json({
          success: false,
          error: "GEMINI_API_KEY is not configured.",
        });
      }
      content = await callGemini({
        apiKey: aiConfig.geminiKey,
        prompt,
      });
    } else {
      if (!aiConfig.openaiKey) {
        return res.status(500).json({
          success: false,
          error: "OPENAI_API_KEY is not configured.",
        });
      }
      const openai = getOpenAIClient(aiConfig.openaiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });
      content = response.choices?.[0]?.message?.content || "{}";
    }
    const data = parseAdviceContent(content);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error?.message === "MODEL_JSON_INVALID") {
      console.error("Model returned invalid JSON.");
      return res.status(502).json({
        success: false,
        error: "Model returned invalid JSON.",
      });
    }
    console.error(`AI request failed (${aiConfig.provider}):`, {
      message: error?.message,
      status: error?.status,
      name: error?.name,
      code: error?.code,
      type: error?.type,
    });
    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        error: "API key is invalid or unauthorized.",
      });
    }
    if (error?.status === 429) {
      return res.status(500).json({
        success: false,
        error: "Quota exceeded or rate limit reached.",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Recognition service is temporarily unavailable.",
    });
  } finally {
    const costMs = Date.now() - startedAt;
    console.log(`request_time_ms: ${costMs}`);
  }
});

app.get("/api/profile", (req, res) => {
  const profile = db.getProfile();
  return res.status(200).json({
    success: true,
    data: profile,
  });
});

app.put("/api/profile", (req, res) => {
  const {
    weight,
    height,
    activity_level,
    ai_provider,
    openai_key,
    gemini_key,
    theme_mode,
    font_scale,
    target_type,
    daily_calorie_goal,
  } = req.body || {};

  const normalized = {
    weight: weight ?? null,
    height: height ?? null,
    activity_level: activity_level ?? null,
    ai_provider: ai_provider ?? null,
    openai_key: openai_key ?? null,
    gemini_key: gemini_key ?? null,
    theme_mode: theme_mode ?? null,
    font_scale: font_scale ?? null,
    target_type: target_type ?? null,
    daily_calorie_goal: daily_calorie_goal ?? null,
  };

  db.upsertProfile(normalized);

  return res.status(200).json({
    success: true,
  });
});

app.get("/api/report/weekly", async (req, res) => {
  const startedAt = Date.now();
  const profile = db.getProfile();
  const aiConfig = getAiConfig(profile);
  const baseDate = parseDateOnly(req.query?.date) || new Date();
  const range = getWeekRange(baseDate);
  const weekly = db.summaryByDateRange(range.start, range.end);
  const goal = Number(profile.daily_calorie_goal || 0);
  const stats = computeWeeklyStats(weekly, goal);

  try {
    const prompt = [
      "Generate a weekly report from the past 7 days of intake data.",
      'Return strict JSON: {"summary":"...","highlights":["...","..."]}',
      `User goal: ${profile.target_type || "unknown"}`,
      `Daily calorie goal: ${profile.daily_calorie_goal || "unknown"}`,
      `Days met: ${stats.days_met}, days over: ${stats.days_over}, days under: ${stats.days_under}`,
      `7-day summary: ${JSON.stringify(weekly)}`,
    ].join("\n");

    let content = "{}";
    if (aiConfig.provider === "gemini") {
      if (!aiConfig.geminiKey) {
        return res.status(500).json({
          success: false,
          error: "GEMINI_API_KEY is not configured.",
        });
      }
      content = await callGemini({
        apiKey: aiConfig.geminiKey,
        prompt,
      });
    } else {
      if (!aiConfig.openaiKey) {
        return res.status(500).json({
          success: false,
          error: "OPENAI_API_KEY is not configured.",
        });
      }
      const openai = getOpenAIClient(aiConfig.openaiKey);
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });
      content = response.choices?.[0]?.message?.content || "{}";
    }
    const data = parseWeeklyContent(content);

    return res.status(200).json({
      success: true,
      data: {
        ...data,
        ...stats,
      },
    });
  } catch (error) {
    if (error?.message === "MODEL_JSON_INVALID") {
      console.error("Model returned invalid JSON.");
      return res.status(502).json({
        success: false,
        error: "Model returned invalid JSON.",
      });
    }
    console.error(`AI request failed (${aiConfig.provider}):`, {
      message: error?.message,
      status: error?.status,
      name: error?.name,
      code: error?.code,
      type: error?.type,
    });
    if (error?.status === 401) {
      return res.status(500).json({
        success: false,
        error: "API key is invalid or unauthorized.",
      });
    }
    if (error?.status === 429) {
      return res.status(500).json({
        success: false,
        error: "Quota exceeded or rate limit reached.",
      });
    }
    return res.status(500).json({
      success: false,
      error: "Recognition service is temporarily unavailable.",
    });
  } finally {
    const costMs = Date.now() - startedAt;
    console.log(`request_time_ms: ${costMs}`);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
