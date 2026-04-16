import gsap from "gsap";

export const animatePageIn = () => {
  const banners = document.querySelectorAll(".transition-banner");

  if (banners.length > 0) {
    if (sessionStorage.getItem("skipBannerIn") === "true") {
      sessionStorage.removeItem("skipBannerIn");

      // haalt banners direct weg nadat de transition gedaan is
      gsap.set(banners, { yPercent: 100 });
      return;
    }

    // ruimt eventuele animaties op
    gsap.killTweensOf(banners);
    const tl = gsap.timeline();

    // fromTo is betrouwbaar in React
    tl.fromTo(banners, 
      { yPercent: 0 },
      {
        yPercent: 100,
        stagger: 0.2,
        duration: 0.5,
        ease: "power2.inOut"
      }
    );
  }
};

export const animatePageOut = (href, router) => {
  const banners = document.querySelectorAll(".transition-banner");

  if (banners.length > 0) {
    gsap.killTweensOf(banners);
    const tl = gsap.timeline();

    // being verborgen boven het scherm (-100%) en glijdt naar beneden om het te vullen (0%)
    tl.fromTo(banners, 
      { yPercent: -100 },
      {
        yPercent: 0,
        stagger: 0.2,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(href);
        },
      }
    );
  }
};
