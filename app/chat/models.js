const models = {
  "GPT-4o": {
    display: "GPT-4o",
    value: "gpt-4o",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      "Pollinations AI": { display: "Pollinations", value: "PollinationsAI" },
      "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
      "Dark AI": { display: "DarkAI", value: "DarkAI" },
      // Liaobots: { display: "Liaobots", value: "Liaobots" },
      // "Copilot": { display: "Copilot", value: "Copilot" },
      // "Jmuz": {display: "Jmuz", value: "Jmuz" },
    },
  },
  "Claude 3.5 Sonnet": {
    display: "Claude 3.5",
    value: "claude-3.5-sonnet",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
      // "Liaobots": { display: "Liaobots", value: "Liaobots" },
      // "Jmuz": {display: "Jmuz", value: "Jmuz" },
      "Pollinations AI": { display: "Pollinations", value: "PollinationsAI" },
    },
  },
  "Qwen 2.5 Coder": {
    display: "Qwen Coder",
    value: "qwen-2.5-coder-32b",
    providers: {
      Auto: { display: "Auto", value: "auto" },
    //   "DeepInfra Chat": { display: "DeepInfra", value: "DeepInfraChat" },
      PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
      // "GeminiPro": { display: "GeminiPro", value: "GeminiPro" },
    },
  },
  "Evil (Experimental)": {
    display: "Evil",
    value: "evil",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      // "Airforce": { display: "Airforce", value: "Airforce" },
      PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
    },
  },
  "LLaMA 3.3 70B": {
    display: "LLaMA 3.3",
    value: "llama-3.3-70b",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
      PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
    //   Perplexity: { display: "Perplexity", value: "PerplexityLabs" },
    },
  },
  "Deepseek r1": {
    display: "Deepseek r1",
    value: "deepseek-r1",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      // "Jmuz": {display: "Jmuz", value: "Jmuz" },
      "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
      // PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
    //   Perplexity: { display: "Perplexity", value: "PerplexityLabs" },
    },
  },
  "Flux 1.1 (Image)": {
    display: "Flux 1.1",
    value: "flux",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      BlackboxCreateAgent: {
        display: "BlackboxC",
        value: "BlackboxCreateAgent",
      },
      PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
      Blackbox: { display: "Blackbox", value: "Blackbox" },
    },
  },
  // "Flux Pro": {
  //   display: "Flux Pro",
  //   value: "flux-pro",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //   //   Airforce: { display: "Airforce", value: "Airforce" },
  //     PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
  //   },
  // },
  // MidJourney: {
  //   display: "MidJourney",
  //   value: "midjourney",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //     // Airforce: { display: "Airforce", value: "Airforce" },
  //     PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
  //   },
  // },
  // "Flux Dev": {
  //   display: "Flux Dev",
  //   value: "flux-dev",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //     HuggingFace: { display: "HuggingFace", value: "HuggingFace" },
  //     "BlackForest Labs": { display: "BlackForest", value: "Flux" },
  //   },
  // },
};

export default models;