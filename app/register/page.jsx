"use client";
import React, { useState, useEffect } from "react";
import "remixicon/fonts/remixicon.css";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Toaster, toast } from "sonner";

const BackgroundBeams = dynamic(
  () =>
    import("../../components/ui/background-beams").then(
      (mod) => mod.BackgroundBeams
    ),
  {
    ssr: false,
    loading: () => <div></div>,
  }
);

const page = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const router = useRouter();
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = Cookies.get("token");
      if (token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            }
          );
          const data = await response.json();
          if (data.valid) {
            router.push("/chat");
          } else {
            Cookies.remove("token");
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          Cookies.remove("token");
        }
      }
    };

    verifyToken();
  }, [router]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleEye = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    let hasError = false;
  
    if (username.length < 4 || username === "") {
      toast.error(`Username cannot be less than 4 characters`, {position: 'top-right'});
      setUsernameError(true);
      hasError = true;
    } else {
      setUsernameError(false);
    }
  
    if (!email.includes("@") || !email.includes(".") || email.includes(" ") || email === "") {
      toast.error(`Invalid Email, Please enter a valid email`, {
        position: "top-right",
      });
      setEmailError(true);
      hasError = true;
    } else {
      setEmailError(false);
    }
  
    if (password.length < 5 || password === "") {
      toast.error("Password cannot be less than 5 characters", {position: 'top-right'});
      setPasswordError(true);
      hasError = true;
    } else {
      setPasswordError(false);
    }
  
    setIsError(hasError);
  
    if(hasError) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Cookies.set("token", data.token, {
          expires: 365,
          sameSite: "None",
          secure: true,
          path: "/",
        });
        // toast.success("Registration successful!");
        router.push("/chat");
      } else {
        console.error("Registration failed:", data.error);
        toast.error(data.error || "Registration failed. Please try again.", {position: 'top-right'});
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An error occurred. Please try again later.", {position: 'top-right'});
    }
  };

  const handleDiscordLogin = () => {
    const CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/discord-callback`;
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&response_type=token&scope=identify%20email`;
    window.location.href = authUrl;
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response.access_token}`,
            },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        // console.log(JSON.stringify(data));

        const serverResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/googleauth`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            //   credentials: 'include', // This ensures cookies are sent with the request
          }
        );
        const result = await serverResponse.json();

        if (result.token) {
          Cookies.set("token", result.token, {
            expires: 365,
            sameSite: "None",
            secure: true,
            path: "/",
          });
        }

        router.push("/chat");
      } catch (err) {
        console.log("Error fetching user data:", err);
      }
    },
    onError: (error) => console.log("Login Failed:", error),
  });

  return (
    <div className="dark flex w-full h-screen flex-col items-center justify-center sm:justify-center overflow-hidden bg-black">
      <div className="w-full xss:max-w-full sm:max-w-[29rem] sm:h-max xss:h-screen z-10 flex flex-col items-center sm:justify-center xss:justify-start sm:px-10 xss:px-5 py-10 rounded-xl sm:border backdrop-filter backdrop-blur-sm bg-white bg-opacity-[0.02] xss:mt-5 sm:mt-0">
        <div className="w-full flex justify-center mb-6">
          <Link
            href="/"
            className="flex group items-center cursor-pointer gap-1"
            prefetch
          >
            <i className="ri-arrow-left-line text-sm text-[#CCCCCC] group-hover:-translate-x-1 transition-transform duration-300"></i>
            <p className="text-xs group-hover:underline text-[#CCCCCC]">Back</p>
          </Link>
        </div>
        <h1 className="font-inter font-semibold text-center text-4xl">
          Let's get started
        </h1>
        <h4 className="font-inter text-sm font-medium mt-4 mb-6 tracking-wide leading-5 text-[#cccccc] text-center max-w-[21rem]">
          You're just One step away from unlocking the full potential of AI.
          Sign up now!
        </h4>

        <div className="flex flex-col gap-4 justify-center w-full">
          <button
            onClick={() => googleLogin()}
            className="border border-[#acacac] hover:border-white hover:scale-[1.02] transition-all ease-in-out gap-2 flex items-center justify-center text-white font-inter w-full font-medium py-2.5 px-4 rounded-full duration-300"
          >
            <img src="google.svg" className="w-[1.7rem]" alt="" />
            Sign up with Google
          </button>
          <button
            onClick={() => handleDiscordLogin()}
            className="border border-[#acacac] hover:border-white hover:scale-[1.02] ease-in-out gap-2 flex items-center justify-center text-white font-inter w-full font-medium py-2.5 px-4 rounded-full transition duration-300"
          >
            <img src="discord.svg" className="w-[1.7rem]" alt="" />
            Sign up with Discord
          </button>
        </div>
        <div className="flex items-center w-[80%] mx-auto my-4">
          <div className="w-[45%] h-[1px] bg-[#8c8c8c]"></div>
          <div className="px-4 text-[#cccccc]">or</div>
          <div className="w-[45%] h-[1px] bg-[#8c8c8c]"></div>
        </div>

        <div className="w-full relative">
          <input
            type="text"
            placeholder="Enter username"
            id="username"
            onClick={() => setUsernameError(false)}
            className={`w-full ${
              usernameError ? "bg-[#440b0b]" : "bg-[#1f1f1f]"
            } text-white font-inter text-base py-3 px-7 rounded-full focus:outline-none focus:ring-2 focus:ring-[#cccccc] hover:ring-2 hover:ring-[#a2a2a2] focus:border-transparent transition duration-300`}
          />
        </div>

        <div className="w-full relative mt-4">
          <input
            type="email"
            placeholder="Enter your email"
            id="email"
            onClick={() => setEmailError(false)}
            className={`w-full ${
              emailError ? "bg-[#440b0b]" : "bg-[#1f1f1f]"
            } text-white font-inter text-base py-3 px-7 rounded-full focus:outline-none focus:ring-2 focus:ring-[#cccccc] hover:ring-2 hover:ring-[#a2a2a2] focus:border-transparent transition duration-300`}
          />
        </div>

        <div className="w-full relative mt-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            id="password"
            onClick={() => setPasswordError(false)}
            className={`w-full ${
              passwordError ? "bg-[#440b0b]" : "bg-[#1f1f1f]"
            } text-white font-inter text-base py-3 px-7 rounded-full focus:outline-none focus:ring-2 focus:ring-[#cccccc] hover:ring-2 hover:ring-[#a2a2a2] focus:border-transparent transition duration-300`}
          />
          <button
            type="button"
            onClick={handleEye}
            className={`${
              showPassword ? "ri-eye-line" : "ri-eye-off-line"
            } absolute right-6 text-xl top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer`}
          ></button>
        </div>

        <button
          onClick={handleEmailRegister}
          className="mt-6 hover:scale-[1.02] bg-[#f2f2f2] text-black font-inter w-full font-medium py-3 px-4 rounded-full hover:bg-[#e1e1e1] transition duration-300"
        >
          Register with Email
        </button>

        <h5 className="font-inter text-[#cccccc] mt-5">
          Already have an account?{" "}
          <Link
            href="/login"
            className="ml-0.5 hover:underline decoration-[#c1c1c1] text-white"
          >
            Login
          </Link>
        </h5>
      </div>
      {!isMobile && (
        // <Particles
        //   className="absolute -z-1 inset-0"
        //   quantity={70}
        //   ease={80}
        //   color={"#ffffff"}
        //   refresh
        // />
        <BackgroundBeams />
      )}
      <Toaster richColors theme="dark" />
    </div>
  );
};

export default page;
