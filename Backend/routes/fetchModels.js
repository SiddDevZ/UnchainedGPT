import { Hono } from 'hono';
import fetch from 'node-fetch';

const router = new Hono();

router.get('/', async (c) => {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Accept": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const freeModels = [];

    for (const model of data.data) {
      const pricing = model.pricing || {};
      const promptPrice = parseFloat(pricing.prompt || "0");
      const completionPrice = parseFloat(pricing.completion || "0");
      const contextLength = parseInt(model.context_length || "0", 10);

      // Check if free (pricing is 0) and context > 20000
      if (promptPrice === 0 && completionPrice === 0 && contextLength > 20000) {
        let name = model.name;
        // Remove (free) from the end if present
        if (name.toLowerCase().endsWith('(free)')) {
            name = name.slice(0, -6).trim();
        }
        
        freeModels.push({
          id: model.id,
          name: name,
          context: contextLength
        });
      }
    }

    return c.json({ models: freeModels });

  } catch (error) {
    console.error('Error fetching models:', error);
    return c.json({ error: 'Failed to fetch models' }, 500);
  }
});

export default router;
