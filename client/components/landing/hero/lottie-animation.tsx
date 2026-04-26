'use client';

import Lottie from "lottie-react";
import animationData from "@/public/hero.json";

export default function LottieAnimation() {
  return (
    <Lottie 
      animationData={animationData} 
      loop={true} 
      className="w-full h-full max-w-[600px] max-h-[600px]"
    />
  );
}
