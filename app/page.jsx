"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Navbar from "../components/Navbar/Navbar";
import ShinyText from "../components/ShinyText/ShinyText";
import { BorderBeam } from "../components/ui/border-beam";
import Particles from "../components/ui/particles";
import { NeonGradientCard } from "../components/ui/neon-gradient-card";
import Lottie from "lottie-react";
import light from '../public/space.json'

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

  return (
    <div
      className="dark flex h-max pb-[100rem] w-full flex-col overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <Navbar />
      <div className="md:w-[75%] sm:w-[85%] xs:w-[85%] xss:w-[95%] flex flex-col justify-center items-center mx-auto">
        <div className="flex flex-col mt-[2.7rem] h-full">
          <ShinyText />
          <h1 className=" font-semibold py-6 text-center mt-1 md:text-8xl sm:text-7xl xs:text-6xl xss:text-4xl font-inter text-white leading-none text-transparent">
            Access Any AI Model, All in One Place, for Free.
          </h1>
          <h4 className="text-center font-inter font-medium text-[#cccccc] sm:text-lg xss:text-sm sm:w-[70%] xss:w-[95%] mx-auto">
            Discover the power of AI with Free Access to ChatGPT 4o, MidJourney,
            o1-preview, Flux 1.1, Claude, and alot more. One platform to create,
            innovate, and explore without limits.
          </h4>
          <div className="mx-auto mt-6 space-x-5 font-inter font-medium">
            <button className="md:px-6 md:py-[0.5rem] xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-black xss:text-[1rem] bg-[#efefef] hover:bg-[#fdfdfd] transition-all ease-in-out rounded-md ">
              Get Started for free
            </button>
            <button className="md:px-6 md:py-[0.5rem] xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-white xss:text-[1rem] border border-[#838383] bg-black text-btn transition-all ease-in-out rounded-md ">
              Try it out
            </button>
          </div>

          <div className="relative relativee back my-32 flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 bg-background">
            <img
              src="https://i.imgur.com/RXBEJz2.png"
              alt="Background"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <BorderBeam size={250} duration={10} delay={9} />
          </div>
        </div>
        <div className="flex flex-col mt-[2rem]">
          <h4 className="text-[#46464c] font-inter font-semibold sm:text-base xss:text-sm text-center">
            ALL THE MODELS YOU WILL EVER NEED
          </h4>
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 p-4 place-items-center">
              <div className="flex items-center space-x-3 h-10">
                <img src="openai.svg" className="w-6 h-6 invert" alt="" />
                <span className="text-lg font-medium">ChatGPT 4.0</span>
              </div>
              <div className="flex items-center space-x-3 h-10">
                <span className="text-lg">FLUX 1.1</span>
              </div>
              <div className="flex items-center space-x-3 h-10">
                <img src="claude.svg" className="w-6 h-6 invert" alt="" />
                <span className="text-lg font-medium">Claude 3.5</span>
              </div>
              <div className="flex items-center space-x-3 h-10">
                <span className="text-lg font-medium">MidJourney</span>
              </div>
              <div className="flex items-center space-x-3 h-10">
                <img src="meta.svg" className="w-6 h-6" alt="" />
                <span className="text-lg font-medium">LLaMA</span>
              </div>
              <div className="flex items-center space-x-3 h-10">
                <img src="openai.svg" className="w-6 h-6 invert" alt="" />
                <span className="text-lg font-medium">o1-preview</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center overflow-hidden mt-10">
          <div className="absolute flex justify-center w-full h-full overflow-hidden">
            <div
              className="w-[200vw] h-[200vw] absolute lg:translate-y-16 md:translate-y-20 sm:translate-y-24 xs:translate-y-32 xss:translate-y-28 opacity-30"
              style={{
                backgroundImage: "url(circle-cropped.svg)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
                filter: "drop-shadow(0 0 10.5em #e98c00ad)",
              }}
            ></div>
          </div>
          <div className="flex flex-col mt-[20rem] relative">
            <h2 className="text-center font-inter font-medium text-[#ffffff] sm:text-5xl xs:text-4xl xss:text-[9vw] leading-10 relative z-10">
              Packed with hundreds of features
            </h2>
            <h4 className="text-center font-inter font-medium text-[#cccccc] sm:text-base xss:text-sm sm:w-[60%] mt-3 xss:w-[95%] mx-auto relative z-10">
              From text to image generation to even normal text generation, our
              platform offers all the latest models for free. It can even write
              your next big idea for you.
            </h4>
            <div className="border-[3px] flex border-dotted mt-14 relative z-10 flex-wrap">
              <div className="md:w-[55%] xss:w-[100%] min-w-[310px] px-8 py-8 border-b md:border-r border-[#ffffff20] h-[43rem] flex flex-col">
                <h2 className="font-inter text-2xl font-medium">
                  Generate images with text
                </h2>
                <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                  Generate stunning images from text prompts using the latest models like Flux Pro, Midjourney, optimized for bulk creation at lightning speed.
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
                  Transform ideas into reality using powerful AI models like GPT-4o, Claude, and more, built for creativity and efficiency.
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

              <div className="md:w-[45%] xss:w-[100%] min-w-[250px] px-8 py-8 xss:border-b md:border-b-0 md:border-r border-[#ffffff20] h-[43rem] flex flex-col">
                <h2 className="font-inter text-2xl font-medium">
                  Generate images with text
                </h2>
                <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                  Generate stunning images from text prompts using the latest models like Flux Pro, Midjourney, optimized for bulk creation at lightning speed.
                </h4>
                <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                  <img
                    src="ss.png"
                    className="opacity-75 object-contain fade-effect max-w-full max-h-full"
                    alt="Generated image example"
                  />
                </div>
              </div>
              <div className="md:w-[55%] xss:w-[100%]  min-w-[310px] px-8 py-8  h-[43rem] flex flex-col">
                <h2 className="font-inter text-2xl font-medium">
                  Text with Generative AI
                </h2>
                <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                  Transform ideas into reality using powerful AI models like GPT-4o, Claude, and more, built for creativity and efficiency.
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
            </div>
          </div>
        </div>
      </div>
      <Particles
        className="absolute -z-1 inset-0"
        quantity={70}
        ease={80}
        color={color}
        refresh
      />
    </div>
  );
}

export default Home;
