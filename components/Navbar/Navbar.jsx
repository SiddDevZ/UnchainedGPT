import React from "react";
import "remixicon/fonts/remixicon.css";
import { RainbowButton } from "../ui/rainbow-button";
import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40">
      <div className="flex mt-2 justify-between items-center mx-4 md:mx-16 lg:mx-24 py-4">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <img
                src="/unchained.webp"
                alt="UnchainedGPT Logo"
                className="w-7 h-7"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              UnchainedGPT
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.05] ease-out rounded-lg transition-all"
          >
            Login
          </Link>
          <Link href="/register">
            <button className="px-5 py-2 text-sm font-semibold text-black bg-white/90 hover:bg-white/80 rounded-lg transition-all ease-out active:scale-[0.98] shadow-lg shadow-white/10">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
