require("dotenv").config();
const OpenAI = require("openai");
const { ProxyAgent, setGlobalDispatcher } = require("undici");

const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
if (proxyUrl) {
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
  console.log(`Proxy enabled: ${proxyUrl}`);
}

async function main() {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 20000,
  });

  try {
    const models = await client.models.list();
    console.log("OK: key valid");
    console.log("model count:", models.data.length);
  } catch (error) {
    console.error("FAIL:", error?.message || error);
    if (error?.status) console.error("status:", error.status);
    if (error?.code) console.error("code:", error.code);
    if (error?.type) console.error("type:", error.type);
  }
}

main();
