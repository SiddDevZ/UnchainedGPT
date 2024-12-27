"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Navbar from "../components/Navbar/Navbar";
import ShinyText from "../components/ShinyText/ShinyText";
import { BorderBeam } from "../components/ui/border-beam";
import Particles from "../components/ui/particles";
import { NeonGradientCard } from "../components/ui/neon-gradient-card";

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
      className="dark flex h-max pb-96 w-full flex-col overflow-hidden"
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
            Flux 1.1, Claude, Gemini, and alot more. One platform to create,
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
            <BorderBeam size={250} duration={12} delay={9} />
          </div>
        </div>
        <div className="flex flex-col mt-[2.7rem] h-full">

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
