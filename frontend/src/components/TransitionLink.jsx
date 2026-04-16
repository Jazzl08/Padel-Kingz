"use client";

import { usePathname, useRouter } from "next/navigation";
import { animatePageOut } from "../utils/animations";

const TransitionLink = ({ href, label, className, onClick }) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(); // Start klik functie
    if (pathname !== href) {
      animatePageOut(href, router);
    }
  };

  const handleMouseEnter = () => {
    router.prefetch(href);
  };

  return (
    <button
      className={className || "transition-link"}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {label}
    </button>
  );
};

export default TransitionLink;
