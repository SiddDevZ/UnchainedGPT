"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import { useTheme } from "next-themes";
import Navbar from "../components/Navbar/Navbar";
import ShinyText from "../components/ShinyText/ShinyText";
import { BorderBeam } from "../components/ui/border-beam";
// import FlickeringGrid from "../components/ui/flickering-grid";
import dynamic from "next/dynamic";

const Particles = dynamic(() => import("../components/ui/particles"), {
  ssr: false,
  loading: () => <div></div>,
});
import Reviews from "../components/Reviews/Reviews";
import Lottie from "lottie-react";
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
  const gridRef = useRef(null);
  const headerRef = useRef(null);
  const featuresRef = useRef(null);
  const sectionRef = useRef(null);
  const faqRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    // Register the ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const h2 = section.querySelector("h2");
    const h4 = section.querySelector("h4");

    if (gridRef.current && headerRef.current && featuresRef.current && faqRef.current && ctaRef.current) {
      const gridItems = Array.from(gridRef.current.children);
      const featureElements = featuresRef.current.querySelectorAll(
        "h2, h4, img, .animation-container"
      );
      const faqElements = faqRef.current.querySelectorAll("h2, .faq-item");
      const ctaElements = ctaRef.current.querySelectorAll('h3, p, button');

      // Animate header
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headerRef.current,
            start: "top bottom-=100",
            end: "bottom top+=100",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        [h2, h4],
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: section,
            start: "top bottom-=100",
            end: "bottom top+=100",
            toggleActions: "play none none reverse",
          },
        }
      );

      gsap.fromTo(
        ctaElements,
        { 
          opacity: 0, 
          y: 50 
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Animate grid items
      gridItems.forEach((item, index) => {
        gsap.fromTo(
          item,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            delay: index * 0.125,
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top bottom-=100",
              end: "bottom top+=100",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // Animate feature elements
      featureElements.forEach((element, index) => {
        const totalElements = featureElements.length;
        const delay = index < totalElements - 4 ? index * 0.1 : 0;

        gsap.fromTo(
          element,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            delay: delay,
            scrollTrigger: {
              trigger: element,
              start: "top bottom",
              end: "bottom top",
              toggleActions: "play none none reverse",
              once: true,
            },
          }
        );
      });

      // Animate FAQ elements
      gsap.fromTo(
        faqElements,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: faqRef.current,
            start: "top bottom-=100",
            end: "bottom top+=100",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

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
      className=""
      style={{ backgroundColor: bgColor }}
    >
      <div className="dark flex mx-auto max-w-[200rem] h-max pb-[1rem] w-full flex-col overflow-hidden">
        <Navbar />
        <div className="md:w-[75%] sm:w-[85%] xs:w-[85%] xss:w-[95%] flex flex-col justify-center items-center mx-auto">
          <div className="flex flex-col mt-[2.7rem] h-full">
            <div className="hero-animate-down hero-animate-delay-0">
              <ShinyText />
            </div>
            <h1 className="hero-animate hero-animate-delay-1 w-[90%] mx-auto font-semibold py-6 text-center mt-1 md:text-8xl sm:text-7xl xs:text-6xl xss:text-4xl font-inter text-white leading-none text-transparent">
              Any AI Model in One Place for Free
            </h1>
            <h4 className="hero-animate hero-animate-delay-2 text-center font-inter font-medium text-[#cccccc] sm:text-lg xss:text-sm sm:w-[70%] xss:w-[95%] mx-auto">
              Discover the power of AI with Free Access to ChatGPT 4o, MidJourney,
              o1-preview, Flux 1.1, Claude, and alot more. One platform to create,
              innovate, and explore without limits.
            </h4>
            <div className="hero-animate hero-animate-delay-3 mx-auto mt-6 space-x-5 font-inter font-medium">
              <Link href="/register">
                <button className="md:px-6 md:py-[0.5rem] xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-black xss:text-[1rem] bg-[#efefef] hover:bg-[#fdfdfd] transition-all ease-in-out rounded-md ">
                  Get Started for free
                </button>
              </Link>
              <Link href="/register">
                <button className="md:px-6 md:py-[0.5rem] xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-white xss:text-[1rem] border border-[#838383] bg-black text-btn transition-all ease-in-out rounded-md ">
                  Try it out
                </button>
              </Link>
            </div>

            <div className="relative hero-animate hero-animate-delay-1 relativee back my-32 flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 bg-background">
              <img
                src="https://i.imgur.com/OmNuaFU.png"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <BorderBeam
                size={250}
                colorFrom={"#e98c00ad"}
                colorTo={"#e90090ad"}
                duration={10}
                delay={9}
              />
            </div>
          </div>
          <div className="flex flex-col mt-[2rem]">
            <h4
              ref={headerRef}
              className="text-[#46464c] font-inter font-semibold sm:text-base xss:text-sm text-center"
            >
              ALL THE MODELS YOU WILL EVER NEED
            </h4>
            <div className="flex justify-center">
              <div
                ref={gridRef}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 p-4 place-items-center"
              >
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

          <div
            ref={featuresRef}
            className="flex justify-center overflow-hidden mt-10"
          >
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
                    Generate stunning images from text prompts using the latest
                    models like Flux Pro, Midjourney, optimized for bulk creation
                    at lightning speed.
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
                    Transform ideas into reality using powerful AI models like
                    GPT-4o, Claude, and more, built for creativity and efficiency.
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
                    With access to models like gpt-4o, Flux Pro, your response is
                    generated in seconds, delivering fast, accurate results every
                    time.
                  </h4>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <Lottie animationData={light}></Lottie>
                  </div>
                </div>
                <div className="md:w-[55%] xss:w-[100%]  min-w-[310px] px-8 py-8  h-[22rem] flex flex-col">
                  <h2 className="font-inter text-2xl font-medium">
                    We support all LLMs
                  </h2>
                  <h4 className="font-inter font-medium text-[#cccccc] sm:text-sm xss:text-sm sm:w-[90%] mt-3 xss:w-[96%] relative z-10">
                    Whether it's OpenAI, Claude, or Your Mom's LLM, we support
                    everything. giving you the freedom to choose the best AI for
                    your needs.
                  </h4>
                  <div className="flex-grow flex justify-center items-center overflow-hidden mt-4">
                    <MorphingText
                      texts={[
                        "GPT-4o",
                        "Claude 3.5",
                        "Midjourney",
                        "Flux 1.1 Pro",
                      ]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            ref={sectionRef}
            className="flex flex-col w-[100%] mt-[12.5rem] relative"
          >
            <h2 className="text-center font-inter font-medium text-[#ffffff] sm:text-5xl xs:text-4xl xss:text-4xl leading-10 relative xs:w-full xss:w-[97%] z-10">
              Loved by people around the world
            </h2>
            <h4 className="text-center font-inter font-medium text-[#cccccc] sm:text-base xss:text-sm sm:w-[60%] mt-3 xss:w-[90%] mx-auto relative z-10">
              Trusted and admired globally, our platform brings innovation to
              users everywhere.
            </h4>
            <Reviews />
          </div>

          <div
            ref={faqRef}
            className="flex flex-col w-[100%] mt-[8.5rem] relative"
          >
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
            <div ref={ctaRef} className="flex flex-col justify-center items-center w-full h-full mx-auto my-auto">
              <h3 className="text-center font-inter font-extrabold text-[#f5f5f5] sm:text-6xl xs:text-4xl xss:text-4xl leading-10 relative xss:w-[90%] z-10">
                What are you waiting for?? <br />
                Join us now!
              </h3>
              <p className="text-center mb-5 z-10 font-inter font-medium text-[#cccccc] w-[80%] mt-3">
                Don’t miss out on the chance to access cutting-edge AI tools for
                free. From generating stunning visuals to crafting compelling
                text, everything you need is just a click away.
              </p>
              {/* <RainbowButton>Get Started for free</RainbowButton> */}
              <Link href="/register" className="md:px-6 z-10 md:py-[0.5rem] xs:px-3.5 xs:py-1.5 xss:px-3 hover:scale-[1.025] xss:py-1.5 items-center text-black xss:text-[1rem] bg-[#efefef] hover:bg-[#fdfdfd] transition-all ease-in-out rounded-md ">
                Get Started for free
              </Link>
            </div>
          </div>
          <Footer />
          <p
            className="text-center font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 dark:from-neutral-950 to-neutral-200 dark:to-neutral-800 w-full overflow-hidden whitespace-nowrap"
            style={{ fontSize: "min(17vw)" }}
          >
            ZENOS AI
          </p>
        </div>
        <Particles
          className="absolute -z-1 inset-0"
          quantity={70}
          ease={80}
          color={color}
          refresh
        />
      </div>
    </div>
  );
}

export default Home;
