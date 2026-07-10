import axios from 'axios';
import { logger } from '../config/db.config.js';

export const getEmbedding = async (text, dimension = 1024) => {
  const openAIKey = process.env.OPENAI_API_KEY;
  const isOpenAIConfigured = openAIKey && openAIKey !== 'your_openai_api_key_here';
  
  if (isOpenAIConfigured) {
    try {
      const response = await axios.post('https://api.openai.com/v1/embeddings', {
        input: text,
        model: 'text-embedding-3-small' // 1536 dim by default
      }, {
        headers: { 'Authorization': `Bearer ${openAIKey}`, 'Content-Type': 'application/json' },
        timeout: 8000
      });
      return response.data?.data[0]?.embedding;
    } catch (err) {
      logger.error(`OpenAI Embedding generation failed: ${err.message}`);
    }
  }

  // Fallback to local Ollama
  const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';
  const model = 'nomic-embed-text'; // Typical embedding model for local RAG
  
  try {
    const response = await axios.post(`${ollamaHost}/api/embed`, {
      model: model,
      input: text
    }, {
      timeout: 8000
    }).catch(async () => {
      // Fallback for older Ollama versions using /api/embeddings
      const fallbackRes = await axios.post(`${ollamaHost}/api/embeddings`, {
        model: model,
        prompt: text
      }, { timeout: 8000 });
      return { data: { embeddings: [fallbackRes.data.embedding] } };
    });

    const embedding = response.data?.embeddings?.[0] || response.data?.embedding;
    if (embedding) return embedding;
  } catch (err) {
    logger.error(`Ollama Embedding generation failed for ${model}: ${err.message}`);
  }

  // Graceful mockup fallback (Pseudo-random normalized float array) to prevent system crashes
  logger.warn(`Using pseudo-random vector fallback of dimension ${dimension} for: "${text.substring(0, 30)}..."`);
  const vector = Array.from({ length: dimension }, () => Math.random() - 0.5);
  // Normalize vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map(val => val / (magnitude || 1));
};
