const models = {
  "GPT-4o": {
    display: "GPT-4o",
    value: "gpt-4o",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      "Pollinations AI": { display: "Pollinations", value: "PollinationsAI" },
      // "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
      "Dark AI": { display: "DarkAI", value: "DarkAI" },
      // Liaobots: { display: "Liaobots", value: "Liaobots" },
      // "Copilot": { display: "Copilot", value: "Copilot" },
      // "Jmuz": {display: "Jmuz", value: "Jmuz" },
    },
  },
  "Claude 3.7 Sonnet": {
    display: "Claude 3.7",
    value: "claude-3.7-sonnet",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      // "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
      // "Liaobots": { display: "Liaobots", value: "Liaobots" },
      // "Jmuz": {display: "Jmuz", value: "Jmuz" },
      "Pollinations AI": { display: "Pollinations", value: "PollinationsAI" },
    },
  },
  // "o3-mini": {
  //   display: "o3-mini",
  //   value: "o3-mini",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //   //   "DeepInfra Chat": { display: "DeepInfra", value: "DeepInfraChat" },
  //     // "Blackbox AI": { display: "Blackbox", value: "Blackbox" },
  //     "TypeGPT": { display: "TypeGPT", value: "TypeGPT" },
  //     "Pollinations AI": { display: "Pollinations", value: "PollinationsAI" },
  //     "DuckDuck": { display: "DuckDuck", value: "DDG" },
  //   },
  // },
  "Evil (Uncensored)": {
    display: "Evil",
    value: "evil",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      // "TypeGPT": { display: "TypeGPT", value: "TypeGPT" },
      PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
    },
  },
  "LLaMA 3.3 70B": {
    display: "LLaMA 3.3",
    value: "llama-3.3-70b",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      "DeepInfraChat": { display: "DeepInfra", value: "DeepInfraChat" },
      PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
      LambdaChat: { display: "LambdaChat", value: "LambdaChat" },
    },
  },
  "Deepseek r1": {
    display: "Deepseek r1",
    value: "deepseek-r1",
    providers: {
      Auto: { display: "Auto", value: "auto" },
      "LambdaChat": {display: "LambdaChat", value: "LambdaChat" },
      "DeepInfraChat": { display: "DeepInfra", value: "DeepInfraChat" },
      PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
      Glider: { display: "Glider", value: "Glider" },
      TypeGPT: { display: "TypeGPT", value: "TypeGPT" },
    },
  },
  // "Flux 1.1 (Image)": {
  //   display: "Flux 1.1",
  //   value: "flux",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //     // BlackboxCreateAgent: {
  //     //   display: "BlackboxC",
  //     //   value: "BlackboxCreateAgent",
  //     // },
  //     ARTA: { display: "ARTA", value: "ARTA" },
  //     Blackbox: { display: "Blackbox", value: "Websim" },
  //   },
  // },
  // "Flux Pro": {
  //   display: "Flux Pro",
  //   value: "flux-pro",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //   //   Airforce: { display: "Airforce", value: "Airforce" },
  //     PollinationsAI: { display: "PollinationsAI", value: "PollinationsImage" },
  //   },
  // },
  // MidJourney: {
  //   display: "MidJourney",
  //   value: "midjourney",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //     // Airforce: { display: "Airforce", value: "Airforce" },
  //     PollinationsAI: { display: "PollinationsAI", value: "PollinationsImage" },
  //   },
  // },
  // "Flux Dev": {
  //   display: "Flux Dev",
  //   value: "flux-dev",
  //   providers: {
  //     Auto: { display: "Auto", value: "auto" },
  //     HuggingFace: { display: "HuggingFace", value: "HuggingFace" },
  //     "BlackForest Labs": { display: "BlackForest", value: "Flux" },
  //     PollinationsAI: { display: "PollinationsAI", value: "PollinationsAI" },
  //   },
  // },
};

export default models;