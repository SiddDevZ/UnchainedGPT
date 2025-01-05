import { spawn } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runChatbot() {
  const pythonProcess = spawn('python', ['./utils/getResponse.py'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONUNBUFFERED: '1' }
  });

  let currentProvider = '';
  let waitingForResponse = false;
  let buffer = '';

  pythonProcess.stdout.on('data', (data) => {
    buffer += data.toString();
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      processLine(line);
    }
  });

  function processLine(line) {
    try {
      const jsonData = JSON.parse(line);
      switch (jsonData.type) {
        case 'provider':
          currentProvider = jsonData.name;
          console.log(`\nUsing provider: ${currentProvider}`);
          break;
        case 'content':
          process.stdout.write(jsonData.text);
          break;
        case 'done':
          console.log('\n\nResponse complete.');
          waitingForResponse = false;
          askQuestion();
          break;
        case 'error':
          console.error('\nError:', jsonData.message);
          waitingForResponse = false;
          askQuestion();
          break;
      }
    } catch (error) {
      // Ignore parsing errors for non-JSON output
    }
  }

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
    waitingForResponse = false;
    askQuestion();
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process exited with code ${code}`);
    rl.close();
  });

  console.log("Chat initialized! Type 'quit' to exit");
  askQuestion();

  function askQuestion() {
    if (waitingForResponse) return;

    rl.question('\nYou: ', (answer) => {
      if (answer.toLowerCase() === 'quit') {
        pythonProcess.kill();
        return;
      }
      waitingForResponse = true;
      pythonProcess.stdin.write(answer + '\n');
    });
  }
}

runChatbot();