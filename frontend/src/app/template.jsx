"use client";

import { useEffect } from "react";
import { animatePageIn } from "../utils/animations";

export default function Template({ children }) {
  useEffect(() => {
    animatePageIn();
  }, []);

  return (
    <div>
      <div id="banner-1" className="transition-banner" />
      <div id="banner-2" className="transition-banner" />
      <div id="banner-3" className="transition-banner" />
      <div id="banner-4" className="transition-banner" />
      {children}
    </div>
  );
}
