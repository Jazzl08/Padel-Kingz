import React, { useEffect, useRef } from "react";
import "./scroll.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Lenis from "lenis";
 
gsap.registerPlugin(ScrollTrigger);
 
export default function Scroll() {
  const containerRef = useRef(null);
  const stepsRef = useRef(null);
  const countContainerRef = useRef(null);
 
  useEffect(() => {
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
 
    const stickySection = stepsRef.current;
    const stickyHeight = window.innerHeight * 4;
    const cards = containerRef.current.querySelectorAll(".card:not(.empty)");
    const countContainer = countContainerRef.current;
    const totalCards = cards.length;
 
    const getRadius = () => {
      return window.innerWidth < 900
        ? window.innerWidth * 7.5
        : window.innerWidth * 2.5;
    };
 
    const arcAngle = Math.PI * 0.4;
    const startAngle = Math.PI / 2 - arcAngle / 2;
 
    function positionCards(progress = 0) {
      const radius = getRadius();
      const totalTravel = 1 + totalCards / 7.5;
      const adjustedProgress = (progress * totalTravel - 1) * 0.75;
     
      cards.forEach((card, i) => {
        const normalizedProgress = (totalCards - 1 - i) / totalCards;
        const cardProgress = normalizedProgress + adjustedProgress;
        const angle = startAngle + arcAngle * cardProgress;
 
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const rotation = (angle - Math.PI / 2) * (180 / Math.PI);
 
        gsap.set(card, {
          x: x,
          y: -y + radius,
          rotation: -rotation,
          transformOrigin: "center center",
        });
      });
    }

    ScrollTrigger.create({
      trigger: stickySection,
      start: "top top",
      end: `+=${stickyHeight}px`,
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => {
        positionCards(self.progress);
      },
    });
 
    positionCards(0);
 
    let currentCardIndex = 0;
    let lastScrollY = window.scrollY;
 
    const options = {
      root: null,
      rootMargin: "0% 0%",
      threshold: 0.5,
    };
 
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lastScrollY = window.scrollY;
          let cardIndex = Array.from(cards).indexOf(entry.target);
          currentCardIndex = cardIndex;
 
          const targetY = 150 - currentCardIndex * 150;
          gsap.to(countContainer, {
            y: targetY,
            duration: 0.5,
            ease: "power1.out",
            overwrite: true,
          });
        }
      });
    }, options);
 
    cards.forEach((card) => {
      observer.observe(card);
    });
 
    const handleResize = () => positionCards(0);
    window.addEventListener("resize", handleResize);
 
    return () => {
      lenis.destroy();
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);
 
  return (
    <div className="container" ref={containerRef}>
      {/* Intro verkleind voor soepelere aansluiting met Hero */}
      <section className="intro" style={{ height: '30vh', backgroundColor: 'var(--bg-main)' }}></section>
      <section className="steps" ref={stepsRef}>
        <div className="step-counter">
          <div className="counter-title">
            <h1>Spelregels</h1>
          </div>
          <div className="count">
            <div className="count-container" ref={countContainerRef}>
              <h1>01</h1>
              <h1>02</h1>
              <h1>03</h1>
              <h1>04</h1>
              <h1>05</h1>
            </div>
          </div>
        </div>
 
        <div className="cards">
          {/* Card 1 */}
          <div className="card">
            <div className="card-img">
              <h2>Service</h2>
            </div>
            <div className="card-content">
              <p>
                De opslag moet onderhands gebeuren, waarbij de bal maximaal ter hoogte van het middel mag worden geraakt. De bal moet diagonaal in het juiste servicevak van de tegenstander stuiteren.
              </p>
            </div>
          </div>
          {/* Card 2 */}
          <div className="card">
            <div className="card-img">
              <h2>Puntentelling</h2>
            </div>
            <div className="card-content">
              <p>
                De puntentelling is identiek aan die van tennis: 15, 30, 40 en game. Bij een stand van 40-40 (deuce) moeten er twee opeenvolgende punten worden gescoord om de game te winnen.
              </p>
            </div>
          </div>
          {/* Card 3 */}
          <div className="card">
            <div className="card-img">
              <h2>Spelverloop</h2>
            </div>
            <div className="card-content">
              <p>
                De bal mag slechts één keer stuiteren op je eigen helft voordat je hem terugslaat. Je mag de bal direct uit de lucht spelen (volley), behalve bij de opslag-return.
              </p>
            </div>
          </div>
          {/* Card 4 */}
          <div className="card">
            <div className="card-img">
              <h2>Wanden</h2>
            </div>
            <div className="card-content">
              <p>
                Nadat de bal aan jouw kant heeft gestuiterd, mag deze de glazen wand of het hekwerk raken voordat je hem terugslaat. Je mag de bal ook via de glazen wanden van jouw eigen helft terugslaan.
              </p>
            </div>
          </div>
          {/* Card 5 */}
          <div className="card">
            <div className="card-img">
              <h2>Fouten</h2>
            </div>
            <div className="card-content">
              <p>
                Je verliest het punt als de bal direct tegen de wand aan de overkant komt zonder eerst te stuiteren, als hij het gaas aan jouw eigen kant raakt, of als hij voor de tweede keer stuitert.
              </p>
            </div>
          </div>
 
          <div className="card empty"></div>
          <div className="card empty"></div>
        </div>
      </section>
      {/* Outro verkleind zodat we sneller bij de footer of volgende secties zijn */}
      <section className="outro" style={{ height: "20vh", backgroundColor: 'var(--bg-main)' }}></section>
    </div>
  );
}