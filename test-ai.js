require('dotenv').config({ path: '/Users/hassan/Documents/Personal Projects/LantroTech/.env' });
const aiService = require('./server/services/aiService.js');

async function test() {
  try {
    const res = await aiService.detectTrendingTopics([{ title: "How to use docker?", body: "I am having trouble with docker compose up" }]);
    console.log("SUCCESS:", res);
  } catch(e) {
    console.error("FAIL:", e);
  }
}
test();
