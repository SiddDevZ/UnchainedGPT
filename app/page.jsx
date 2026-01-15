"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "../components/Navbar/Navbar";
import ShinyText from "../components/ShinyText/ShinyText";
import { BorderBeam } from "../components/ui/border-beam";
// import FlickeringGrid from "../components/ui/flickering-grid";
import dynamic from "next/dynamic";
import Lenis from "lenis";

const Particles = dynamic(() => import("../components/ui/particles"), {
  ssr: false,
  loading: () => <div></div>,
});
import Reviews from "../components/Reviews/Reviews";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import light from "../public/car.json";
import Questions from "../components/Questions/Questions";
import Footer from "../components/Footer/Footer";
// import { RainbowButton } from "../components/ui/rainbow-button";
const BackgroundBeams = dynamic(
  () =>
    import("../components/ui/background-beams").then(
      (mod) => mod.BackgroundBeams
    ),
  {
    ssr: false,
    loading: () => <div></div>,
  }
);
const MorphingText = dynamic(() => import("../components/ui/morphing-text"), {
  ssr: false,
  loading: () => <div></div>,
});

export function Home() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("#000000");

  useEffect(() => {
    if (resolvedTheme === "dark") {
      setColor("#ffffff");
      setBgColor("#000000");
    } else {
      setColor("#ffffff");
      setBgColor("#000000");
    }
  }, [resolvedTheme]);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="overflow-hidden" style={{ backgroundColor: bgColor }}>
      <div className="dark flex mx-auto max-w-[88rem] h-max pb-[1rem] w-full flex-col overflow-hidden">
        <Navbar />
        <div className="md:w-[75%] sm:w-[85%] xs:w-[85%] xss:w-[95%] flex flex-col justify-center items-center mx-auto">
          <div className="flex flex-col mt-24 md:mt-24 h-full">
            <div className="hero-animate-down hero-animate-delay-0 mb-6">
              <ShinyText />
            </div>
            <h1 className="hero-animate hero-animate-delay-1 max-w-[50rem] mx-auto font-semibold text-center md:text-[3.75rem] md:leading-[1.15] sm:text-5xl xs:text-4xl xss:text-3xl font-space text-white tracking-[-0.03em]">
              Access Any Open-Source AI Model in One Place
            </h1>
            <p className="hero-animate hero-animate-delay-2 text-center font-inter text-neutral-400 sm:text-lg xss:text-base sm:w-[58%] xss:w-[90%] mx-auto mt-3 leading-relaxed font-normal">
              Harness cutting-edge open-source AI models like OpenAI, LLaMA, Mistral, Deepseek, and 40+ more. No limits. No costs.
            </p>
            <div className="hero-animate hero-animate-delay-3 flex flex-wrap justify-center gap-3 mt-8">
              <Link href="/register">
                <button className="px-6 py-2.5 text-sm font-semibold text-black bg-white/95 hover:bg-white/85 transition-all ease-out duration-200 rounded-lg">
                  Get Started now
                </button>
              </Link>
              <Link href="/chat">
                <button className="px-6 py-2.5 text-sm font-semibold text-neutral-300 rounded-lg border border-neutral-800 bg-[#080808] hover:border-neutral-700 hover:bg-white/[0.05] transition-all ease-out duration-200">
                  Live Demo
                </button>
              </Link>
            </div>

            <div className="relative hero-animate hero-animate-delay-1 my-20 md:my-24 w-full">
              <div className="relative rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/50 p-1.5">
                <div className="rounded-lg overflow-hidden bg-neutral-950">
                  <img
                    src="unchained_showcase.webp"
                    alt="UnchainedGPT Interface"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-xl"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-12">
            <p className="text-neutral-600 font-inter text-xs font-semibold tracking-widest uppercase text-center mb-7">
              Powered by Leading Open-Source Models
            </p>
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 items-center">
                {["OpenAI", "Mistral", "Qwen", "LLaMA", "DeepSeek", "Gemma"].map((model) => (
                  <div key={model} className="flex items-center justify-center opacity-40 hover:opacity-70 transition-opacity duration-300">
                    <span className="text-sm font-semibold text-neutral-400">{model}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-[1rem] z-50 overflow-hidden">
            <div className="absolute flex justify-center pt-[4rem] w-full h-full overflow-hidden">
              <div
                className="w-[200vw] h-[200vw] absolute lg:translate-y-16 md:translate-y-20 sm:translate-y-24 xs:translate-y-32 xss:translate-y-28 opacity-30"
                style={{
                  backgroundImage: "url(circle-cropped.svg)",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "contain",
                  filter: "drop-shadow(0 0 10.5em rgba(233, 140, 0, 0.4))",
                  "@media screen and (-moz-images-in-menus:0)": {
                    filter: "drop-shadow(0 0 10.5em rgba(233, 140, 0, 0.6))",
                  },
                }}
              ></div>
            </div>
            <div className="flex flex-col mt-[20rem] relative">
              <h2 className="text-center font-space font-semibold text-white sm:text-4xl xs:text-3xl xss:text-2xl leading-tight relative z-10 tracking-[-0.02em]">
                Packed with hundreds of features
              </h2>
              <p className="text-center font-inter text-neutral-400 sm:text-base xss:text-sm sm:w-[55%] mt-3 xss:w-[95%] mx-auto relative z-10">
                From text to image generation to even normal text generation,
                our platform offers all the latest models for free.
              </p>
              <div className="border border-neutral-800  flex mt-12 relative z-10 flex-wrap overflow-hidden">
                <div className="md:w-[55%] xss:w-[100%] min-w-[310px] px-8 py-8 border-b md:border-r border-neutral-800 h-[43rem] flex flex-col bg-neutral-950/20">
                  <h3 className="font-space text-xl font-semibold text-white tracking-tight">
                    Generate images with text
                  </h3>
                  <p className="font-inter text-neutral-400 text-sm sm:w-[90%] mt-2.5 xss:w-[96%] relative z-10">
                    Generate stunning images from text prompts using open-source
                    models like FLUX, optimized for bulk creation.
                  </p>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <img
                      src="ss.png"
                      className="opacity-75 object-contain fade-effect max-w-full max-h-full"
                      alt="Generated image example"
                    />
                  </div>
                </div>
                <div className="md:w-[45%] xss:w-[100%] min-w-[250px] px-8 py-8 border-b border-neutral-800 h-[43rem] flex flex-col bg-neutral-950/20">
                  <h3 className="font-space text-xl font-semibold text-white tracking-tight">
                    Text with Generative AI
                  </h3>
                  <p className="font-inter text-neutral-400 text-sm sm:w-[90%] mt-2.5 xss:w-[96%] relative z-10">
                    Transform ideas into reality using powerful open-source AI
                    models like LLaMA, Mistral, and Qwen.
                  </p>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <img
                      src="chat.png"
                      className="opacity-75 object-contain fade-effect max-w-full max-h-full"
                      alt="Generated image example"
                    />
                    {/* <Lottie animationData={light}></Lottie> */}
                  </div>
                </div>

                <div className="md:w-[45%] xss:w-[100%] min-w-[250px] px-8 py-8 xss:border-b md:border-b-0 md:border-r border-neutral-800 h-[22rem] flex flex-col bg-neutral-950/20">
                  <h3 className="font-space text-xl font-semibold text-white tracking-tight">
                    Generate in seconds
                  </h3>
                  <p className="font-inter text-neutral-400 text-sm sm:w-[90%] mt-2.5 xss:w-[96%] relative z-10">
                    With access to models like LLaMA 3.3 and FLUX, responses are
                    generated in seconds with accuracy.
                  </p>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <DotLottieReact 
                      data={light} 
                      loop 
                      autoplay 
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
                <div className="md:w-[55%] xss:w-[100%] min-w-[310px] px-8 py-8 h-[22rem] flex flex-col bg-neutral-950/20">
                  <h3 className="font-space text-xl font-semibold text-white tracking-tight">
                    We support all open-source LLMs
                  </h3>
                  <p className="font-inter text-neutral-400 text-sm sm:w-[90%] mt-2.5 xss:w-[96%] relative z-10">
                    From LLaMA to Mistral to DeepSeek, we support the best
                    open-source models for your needs.
                  </p>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <MorphingText
                      texts={["LLaMA", "Mistral", "Qwen", "Gemma", "OpenAI", "DeepSeek"]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex px-3 md:px-0 flex-col w-full mt-[10rem] relative z-10">
            <h2 className="text-center font-space font-semibold text-white sm:text-4xl xs:text-3xl xss:text-2xl leading-tight relative z-10 tracking-[-0.02em]">
              Why Choose UnchainedGPT?
            </h2>
            <p className="text-center font-inter text-neutral-400 sm:text-base xss:text-sm sm:w-[50%] mt-4 xss:w-[90%] mx-auto relative z-10">
              Experience the true potential of open-source AI without limitations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 w-full">
              {[
                {
                  title: "Uncensored Access",
                  desc: "Access raw model outputs without arbitrary guardrails. Get unfiltered results from the best open models.",
                  icon: "ri-shield-check-line"
                },
                {
                  title: "Privacy First",
                  desc: "Your conversations are private. We don't train on your data or sell your information to third parties.",
                  icon: "ri-lock-password-line"
                },
                {
                  title: "Always Cutting Edge",
                  desc: "New open-source models are added within hours of release. Stay ahead with the latest tech.",
                  icon: "ri-rocket-line"
                }
              ].map((item, i) => (
                <div key={i} className="group px-7 py-6 rounded-xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 transition-colors duration-300">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center mb-4">
                    <i className={`${item.icon} text-lg text-neutral-300`}></i>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-500 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col px-3 md:px-0 md:flex-row items-center justify-between w-full mt-[10rem] gap-12 relative z-10">
            <div className="md:w-[45%]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Live Model Switching</span>
              </div>
              <h2 className="font-space font-semibold text-white sm:text-4xl xs:text-3xl xss:text-2xl sm:leading-tight mb-4 tracking-[-0.02em]">
                Find Your Perfect Model
              </h2>
              <p className="font-inter text-neutral-400 text-sm leading-relaxed mb-6 max-w-md">
                Not all models are created equal. Switch instantly between specialized AI models and compare results in real-time.
              </p>
              
              <div className="space-y-3">
                {[
                  { text: "Instant model switching", icon: "ri-refresh-line" },
                  { text: "Compare outputs side-by-side", icon: "ri-split-cells-horizontal" },
                  { text: "No subscriptions at all", icon: "ri-money-dollar-circle-line" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className="w-5 h-5 rounded bg-neutral-800 flex items-center justify-center">
                      <i className={`${feature.icon} text-neutral-400 text-xs`}></i>
                    </div>
                    <span className="text-neutral-400 text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:w-[52%] w-full">
              <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/50">
                {[
                  { name: "LLaMA 3.3 70B", type: "Reasoning & Logic" },
                  { name: "OpenAI oss-120B", type: "Mathematics" },
                  { name: "Mistral Large", type: "Code Generation" },
                  { name: "DeepSeek V3", type: "Technical Tasks" },
                ].map((model, i) => (
                  <div key={i} className={`group flex items-center justify-between px-5 py-3.5 hover:bg-neutral-800/30 transition-colors ${i !== 3 ? 'border-b border-neutral-800' : ''}`}>
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-white mb-0.5">{model.name}</div>
                      <div className="text-xs text-neutral-500">{model.type}</div>
                    </div>
                    <i className="ri-arrow-right-line text-neutral-600"></i>
                  </div>
                ))}
                
                <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">40+ models available</span>
                    <span className="text-emerald-500/80">All Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-[100%] mt-[10rem] relative">
            <h2 className="text-center font-space font-semibold text-white sm:text-4xl xs:text-3xl xss:text-2xl leading-tight relative xs:w-full xss:w-[97%] z-10 tracking-[-0.02em]">
              Loved by people around the world
            </h2>
            <p className="text-center font-inter text-neutral-400 sm:text-base xss:text-sm sm:w-[50%] mt-4 xss:w-[90%] mx-auto relative z-10">
              Trusted and admired globally, our platform brings innovation to
              users everywhere.
            </p>
            <Reviews />
            <div className="text-center mt-7">
              {/* <p className="text-xs text-neutral-600 uppercase tracking-wider">
                * Testimonials are fictional
              </p> */}
              <p className="text-xs text-neutral-800 mt-1">
                For demonstration purposes only
              </p>
            </div>
          </div>

          <div className="flex flex-col w-[100%] mt-[8rem] relative">
            <h2 className="text-center font-space font-semibold text-white sm:text-4xl xs:text-3xl xss:text-2xl leading-tight relative xs:w-full xss:w-[97%] z-10 tracking-[-0.02em]">
              Frequently asked questions
            </h2>
            {/* <h4 className="text-center font-inter font-medium text-[#cccccc] sm:text-base xss:text-sm sm:w-[60%] mt-3 xss:w-[90%] mx-auto relative z-10">
              Trusted and admired globally, our platform brings innovation to users everywhere.
            </h4> */}
            <Questions />
          </div>

          <div className="relative w-[90%] mx-auto h-[25rem] mt-[5rem] rounded-lg bg-background overflow-hidden border">
            <BackgroundBeams />
            {/* <FlickeringGrid
              className="z-0 absolute inset-0 size-full"
              squareSize={4}
              gridGap={6}
              color="#6B7280"
              maxOpacity={0.5}
              flickerChance={0.1}
              height={800}
              width={gridWidth}
            /> */}
            <div className="flex flex-col justify-center items-center w-full h-full mx-auto my-auto">
              <h3 className="text-center font-inter font-extrabold text-[#f5f5f5] sm:text-5xl xs:text-4xl xss:text-4xl leading-10 relative xss:w-[90%] z-10">
                What are you waiting for?? <br />
                Join us now!
              </h3>
              <p className="text-center mb-5 z-10 font-inter font-medium text-[#cccccc] w-[80%] mt-3">
                Don’t miss out on the chance to access cutting-edge AI tools for
                free. From generating stunning visuals to crafting compelling
                text, everything you need is just a click away.
              </p>
              {/* <RainbowButton>Get Started for free</RainbowButton> */}
              <Link
                href="/register"
                className="md:px-6 z-10 md:py-[0.5rem] xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-black xss:text-[1rem] bg-[#efefef] hover:bg-[#fdfdfd] transition-all ease-in-out rounded-md "
              >
                Get Started for free
              </Link>
            </div>
          </div>
          <Footer />
          <p
            className="text-center font-sora font-bold text-neutral-900 w-full overflow-hidden whitespace-nowrap select-none"
            style={{ fontSize: "min(8vw)" }}
          >
            UnchainedGPT
          </p>
        </div>
        <Particles
          className="absolute -z-1 inset-0"
          quantity={70}
          ease={10}
          color={color}
          refresh
        />
      </div>
    </div>
  );
}

export default Home;
