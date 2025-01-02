import { Hono } from 'hono'
import { rateLimiter } from "hono-rate-limiter"
import { spawn } from 'child_process'

const router = new Hono()

const limiter = rateLimiter({
  windowMs: 10 * 60 * 1000,  // 10 minutes in milliseconds
  limit: 150,                // 150 requests per 10 minutes
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header('x-forwarded-for') || c.req.ip,
})

function callPythonFunction(userInput) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['routes/utils/getResponse.py', userInput]);
    let output = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Error from Python: ${data.toString()}`);
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(output.trim());
      } else {
        reject(`Python process exited with code ${code}`);
      }
    });
  });
}

router.post('/', limiter, async (c) => {
  try {
    const { input } = await c.req.json();
    
    if (!input) {
      return c.json({ error: 'Input is required' }, 400);
    }

    const response = await callPythonFunction(input);
    return c.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'An error occurred while processing your request' }, 500);
  }
})

export default router