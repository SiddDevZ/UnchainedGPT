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
    <div className="" style={{ backgroundColor: bgColor }}>
      <div className="dark flex mx-auto max-w-[88rem] h-max pb-[1rem] w-full flex-col overflow-hidden">
        <Navbar />
        <div className="md:w-[75%] sm:w-[85%] xs:w-[85%] xss:w-[95%] flex flex-col justify-center items-center mx-auto">
          <div className="flex flex-col mt-24 md:mt-24 h-full">
            <div className="hero-animate-down hero-animate-delay-0 mb-6">
              <ShinyText />
            </div>
            <h1 className="hero-animate hero-animate-delay-1 max-w-[55rem] mx-auto font-bold text-center md:text-[4.5rem] md:leading-[1.1] sm:text-6xl xs:text-5xl xss:text-4xl font-inter bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent tracking-tight">
              Access Any Open-Source AI Model in One Place
            </h1>
            <p className="hero-animate hero-animate-delay-2 text-center font-inter text-white/60 sm:text-xl xss:text-base sm:w-[65%] xss:w-[90%] mx-auto mt-3 leading-relaxed">
              Harness the power of cutting-edge open-source AI models like LLaMA, Mistral, Qwen, and more. No limits. No costs.
              {/* <span className="block mt-1">No limits. No costs. Just pure innovation.</span> */}
            </p>
            <div className="hero-animate hero-animate-delay-3 flex flex-wrap justify-center gap-4 mt-10">
              <Link href="/register">
                <button className="md:px-6 md:py-[0.6rem] font-semibold xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-black xss:text-[1rem] bg-[#efefef] hover:bg-[#fdfdfd] transition-all ease-out rounded-md ">
                  Get Started for free
                </button>
              </Link>
              <Link href="/chat">
                <button className="px-6 py-[0.6rem] text-base font-semibold text-white/85 bg-white/[0.08] rounded-xl border border-white/[0.1] hover:border-white/[0.1] transition-all ease-out hover:scale-[1.025] active:scale-[0.98]">
                  Try Demo
                </button>
              </Link>
            </div>

            <div className="relative hero-animate hero-animate-delay-1 my-24 md:my-24 w-full">
              <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-2 shadow-2xl">
                <div className="rounded-xl overflow-hidden bg-black">
                  <img
                    src="unchained_showcase.webp"
                    alt="UnchainedGPT Interface"
                    className="w-full h-auto object-cover"
                  />
                </div>
                <div className="absolute -inset-[1px] bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 rounded-2xl blur-2xl -z-10 opacity-50"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col mt-16">
            <p className="text-white/40 font-inter font-base sm:text-sm text-xs tracking-wider uppercase text-center mb-8">
              Powered by Leading Open-Source Models
            </p>
            <div className="flex flex-col justify-center">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-8 items-center">
                <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-base font-semibold text-white/70">LLaMA</span>
                </div>
                <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-base font-semibold text-white/70">Mistral</span>
                </div>
                <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-base font-semibold text-white/70">Qwen</span>
                </div>
                <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-base font-semibold text-white/70">FLUX</span>
                </div>
                <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-base font-semibold text-white/70">DeepSeek</span>
                </div>
                <div className="flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
                  <span className="text-base font-semibold text-white/70">Gemma</span>
                </div>
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
              <h2 className="text-center font-inter font-medium text-[#ffffff] sm:text-5xl xs:text-4xl xss:text-[9vw] leading-10 relative z-10">
                Packed with hundreds of features
              </h2>
              <h4 className="text-center font-inter font-medium text-[#cccccc] sm:text-base xss:text-sm sm:w-[60%] mt-3 xss:w-[95%] mx-auto relative z-10">
                From text to image generation to even normal text generation,
                our platform offers all the latest models for free. It can even
                write your next big idea for you.
              </h4>
              <div className="border-[3px] flex border-dotted mt-14 relative z-10 flex-wrap">
                <div className="md:w-[55%] xss:w-[100%] min-w-[310px] px-8 py-8 border-b md:border-r border-[#ffffff20] h-[43rem] flex flex-col">
                  <h2 className="font-inter text-2xl font-medium">
                    Generate images with text
                  </h2>
                  <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                    Generate stunning images from text prompts using open-source
                    models like FLUX, optimized for bulk creation at lightning
                    speed.
                  </h4>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <img
                      src="ss.png"
                      className="opacity-75 object-contain fade-effect max-w-full max-h-full"
                      alt="Generated image example"
                    />
                  </div>
                </div>
                <div className="md:w-[45%] xss:w-[100%]  min-w-[250px] px-8 py-8 border-b border-[#ffffff20] h-[43rem] flex flex-col">
                  <h2 className="font-inter text-2xl font-medium">
                    Text with Generative AI
                  </h2>
                  <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                    Transform ideas into reality using powerful open-source AI
                    models like LLaMA, Mistral, Qwen, and more, built for
                    creativity and efficiency.
                  </h4>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <img
                      src="chat.png"
                      className="opacity-75 object-contain fade-effect max-w-full max-h-full"
                      alt="Generated image example"
                    />
                    {/* <Lottie animationData={light}></Lottie> */}
                  </div>
                </div>

                <div className="md:w-[45%] xss:w-[100%] min-w-[250px] px-8 py-8 xss:border-b md:border-b-0 md:border-r border-[#ffffff20] h-[22rem] flex flex-col">
                  <h2 className="font-inter text-2xl font-medium">
                    Generate in seconds
                  </h2>
                  <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                    With access to models like LLaMA 3.3, FLUX, your response is
                    generated in seconds, delivering fast, accurate results
                    every time.
                  </h4>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <DotLottieReact 
                      data={light} 
                      loop 
                      autoplay 
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
                <div className="md:w-[55%] xss:w-[100%]  min-w-[310px] px-8 py-8  h-[22rem] flex flex-col">
                  <h2 className="font-inter text-2xl font-medium">
                    We support open-source LLMs
                  </h2>
                  <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                    From LLaMA to Mistral to DeepSeek, we support the best
                    open-source models, giving you the freedom to choose the
                    best AI for your needs.
                  </h4>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <MorphingText
                      texts={["LLaMA 3", "Mistral", "Qwen 2.5", "Gemma"]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex px-3 md:px-0 flex-col w-full mt-[10rem] relative z-10">
            <h2 className="text-center font-inter font-medium text-[#ffffff] sm:text-5xl xs:text-4xl xss:text-4xl leading-10 relative z-10">
              Why Choose UnchainedGPT?
            </h2>
            <h4 className="text-center font-inter font-medium text-[#cccccc]/90 sm:text-base xss:text-sm sm:w-[60%] mt-3 xss:w-[90%] mx-auto relative z-10">
              Experience the true potential of open-source AI without the limitations.
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
              {[
                {
                  title: "Uncensored Access",
                  desc: "Access raw model outputs without arbitrary guardrails. Get the unfiltered truth from the world's best open models.",
                  icon: "ri-shield-check-line"
                },
                {
                  title: "Privacy First",
                  desc: "Your conversations are private. We don't train on your data or sell your information to third parties.",
                  icon: "ri-lock-password-line"
                },
                {
                  title: "Always Cutting Edge",
                  desc: "New open-source models are added within hours of release. Stay ahead of the curve with the latest tech.",
                  icon: "ri-rocket-line"
                }
              ].map((item, i) => (
                <div key={i} className="group px-8 py-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <div className="w-12 h-12 rounded-lg bg-white/[0.05] flex items-center justify-center mb-5">
                    <i className={`${item.icon} text-2xl text-white/80`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col px-3 md:px-0 md:flex-row items-center justify-between w-full mt-[10rem] gap-16 relative z-10">
            <div className="md:w-[45%]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-white/[0.08] to-white/[0.04] border border-white/[0.12] mb-6 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.1em]">Live Model Switching</span>
              </div>
              <h2 className="font-inter font-bold text-[#ffffff]/90 sm:text-[3.2rem] xs:text-4xl xss:text-4xl sm:leading-[1.1] xs:leading-tight mb-4 tracking-tight">
                Find Your Perfect Model
              </h2>
              <p className="font-inter text-white/60 text-[15px] leading-[1.7] mb-6 max-w-md">
                Not all models are created equal. Switch instantly between specialized AI models and compare results in real-time to get the best output for every task.
              </p>
              
              <div className="space-y-2.5">
                {[
                  { text: "Instant model switching", icon: "ri-refresh-line" },
                  { text: "Compare outputs side-by-side", icon: "ri-split-cells-horizontal" },
                  { text: "No subscriptions at all", icon: "ri-money-dollar-circle-line" }
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3.5 group">
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center group-hover:bg-white/[0.1] group-hover:border-white/[0.2] transition-all duration-300">
                      <i className={`${feature.icon} text-white/70 text-sm group-hover:text-white/90 transition-colors`}></i>
                    </div>
                    <span className="text-white/70 text-[14px] font-medium group-hover:text-white/90 transition-colors">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="md:w-[52%] w-full">
              <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.02]">
                {[
                  { name: "LLaMA 3.3 70B", type: "Reasoning & Logic" },
                  { name: "Mistral Large", type: "Code Generation" },
                  { name: "Qwen 2.5 72B", type: "Mathematics" },
                  { name: "DeepSeek V3", type: "Technical Tasks" },
                ].map((model, i) => (
                  <div key={i} className={`group flex items-center justify-between px-6 py-4 transition-colors ${i !== 3 ? 'border-b border-white/[0.06]' : ''}`}>
                    <div className="flex flex-col">
                      <div className="text-[14px] font-medium text-white/90 mb-1">{model.name}</div>
                      <div className="text-[13px] text-white/40">{model.type}</div>
                    </div>
                    <i className="ri-arrow-right-line text-white/30 "></i>
                  </div>
                ))}
                
                <div className="px-6 py-4 border-t border-white/[0.08] bg-white/[0.01]">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-white/40">50+ models available</span>
                    <span className="text-white/50">All Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-[100%] mt-[12.5rem] relative">
            <h2 className="text-center font-inter font-medium text-[#ffffff] sm:text-5xl xs:text-4xl xss:text-4xl leading-10 relative xs:w-full xss:w-[97%] z-10">
              Loved by people around the world
            </h2>
            <h4 className="text-center font-inter font-medium text-[#cccccc] sm:text-base xss:text-sm sm:w-[60%] mt-3 xss:w-[90%] mx-auto relative z-10">
              Trusted and admired globally, our platform brings innovation to
              users everywhere.
            </h4>
            <Reviews />
            <div className="text-center mt-7">
              <p className="text-xs text-neutral-600 uppercase tracking-wider">
                * Testimonials are fictional
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                For demonstration purposes only
              </p>
            </div>
          </div>

          <div className="flex flex-col w-[100%] mt-[8.5rem] relative">
            <h2 className="text-center font-inter font-medium text-[#ffffff] sm:text-5xl xs:text-4xl xss:text-4xl leading-10 relative xs:w-full xss:w-[97%] z-10">
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
            className="text-center font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 w-full overflow-hidden whitespace-nowrap"
            style={{ fontSize: "min(9vw)" }}
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
