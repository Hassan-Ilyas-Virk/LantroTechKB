const OpenAI = require('openai');

// Grok uses the OpenAI SDK format with a different base URL
const openai = new OpenAI({
  apiKey: process.env.GROK_API_KEY, // Keeping the env var name the same to avoid breaking .env
  baseURL: 'https://api.groq.com/openai/v1',
});

// We are using Groq's fast Llama 3 model
const MODEL = 'llama-3.3-70b-versatile';

exports.analyzeKnowledgeGaps = async (questions) => {
  try {
    const prompt = `
    Analyze the following list of unresolved or frequently asked internal employee questions, along with their tags and categories.
    Identify the top 3-5 knowledge gaps or areas where employees are struggling repeatedly (e.g. repeated queries indicating a need for training or documentation improvement).
    Format the output exactly as a JSON array of objects with keys: "topic", "severity" (High, Medium, Low), "description", and "recommendation".
    
    Questions data: ${JSON.stringify(questions)}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an HR and DevOps analytics assistant.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Grok API Error in Knowledge Gap Analysis:', error);
    throw new Error('Failed to generate knowledge gap analysis');
  }
};

exports.generateAutoFAQ = async (qnaPairs) => {
  try {
    const prompt = `
    Based on the following highly-upvoted questions and answers from our internal knowledge base, 
    generate a cohesive "Monthly FAQ / Internal Newsletter". 
    Summarize the most important and frequently asked questions.
    Organize it logically by category or department.
    Format it in beautiful Markdown, using headings, bullet points, and short summaries.
    
    Data: ${JSON.stringify(qnaPairs)}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert technical writer and internal communications manager.' },
        { role: 'user', content: prompt }
      ]
    });

    return { markdown: response.choices[0].message.content };
  } catch (error) {
    console.error('Groq API Error in Auto FAQ:', error);
    throw new Error('Failed to generate Auto-FAQ');
  }
};

exports.detectTrendingTopics = async (recentQuestions) => {
  try {
    const prompt = `
    Analyze these recent internal questions to detect spikes in specific topics or issues, highlighting emerging technical or operational concerns.
    Return exactly a JSON object with a key "trends" which is an array of objects containing: "topicName", "mentionCount" (estimated importance 1-10), and "summary" (1 sentence context).
    
    Recent Questions: ${JSON.stringify(recentQuestions)}
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an internal trend detection analyst. Always respond in valid JSON format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq API Error in Trending Topics:', error);
    throw new Error('Failed to detect trending topics');
  }
};

exports.verifyAnswer = async (questionContext, answerText) => {
  try {
    const prompt = `
    You are an expert technical and organizational reviewer. 
    Evaluate the proposed user-submitted answer to the given question.
    
    CRITICAL INSTRUCTION: Be extremely lenient. ONLY flag the answer if it is completely and utterly irrelevant to the question (e.g. spam, gibberish, or talking about a completely different topic). If the answer has ANY relevance to the question, even if it is short, vague, or partially incorrect, you MUST mark its status as "verified". DO NOT flag answers just because they are unhelpful or brief.
    
    Question: "${questionContext.title}\n${questionContext.body}"
    Proposed Answer: "${answerText}"
    
    Return exactly a JSON object with:
    "status": one of ["verified", "flagged", "corrected"],
    "confidence": number between 0 and 100,
    "feedback": "string explaining why it is flagged, verified, or corrected. If incorrect/incomplete, explain what is wrong.",
    "suggestedCorrection": "If the answer is incorrect, incomplete, or misleading, provide a complete 'recommended answer' version for comparison. Otherwise, empty string."
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are an expert reviewer ensuring high quality internal answers. Always respond in valid JSON format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq API Error in Answer Verification:', error);
    throw new Error('Failed to verify answer');
  }
};
