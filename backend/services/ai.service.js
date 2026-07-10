import { queryOllamaAPI } from './ollama.service.js';
import axios from 'axios';
import { logger } from '../config/db.config.js';

export const queryAI = async (prompt, modelName = null, options = {}) => {
  const openAIKey = process.env.OPENAI_API_KEY;
  const isOpenAIConfigured = openAIKey && openAIKey !== 'your_openai_api_key_here';

  // If OpenAI is explicitly requested or configured as primary and model matches
  if (isOpenAIConfigured && (modelName === 'gpt-4o' || modelName === 'gpt-3.5-turbo' || options.forceOpenAI)) {
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: modelName || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      });
      return response.data?.choices[0]?.message?.content || '';
    } catch (error) {
      logger.error(`OpenAI query failed, falling back: ${error.message}`);
      // Fallback to Ollama if OpenAI fails
    }
  }

  // Default: Ollama integration
  return await queryOllamaAPI(prompt, modelName);
};
