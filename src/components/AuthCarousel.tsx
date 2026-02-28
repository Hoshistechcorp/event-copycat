import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import mainLogo from "@/assets/mainlogo.png";
import event1 from "@/assets/event-1.jpg";
import event2 from "@/assets/event-2.jpg";
import event3 from "@/assets/event-3.jpg";
import event4 from "@/assets/event-4.jpg";
import event5 from "@/assets/event-5.jpg";

const slides = [
  { src: event1, headline: "Discover Amazing Events", sub: "Find concerts, festivals, and experiences near you." },
  { src: event2, headline: "Create Unforgettable Moments", sub: "Host and manage events effortlessly with iBLOOV." },
  { src: event3, headline: "Connect With Your Community", sub: "Meet like-minded people at events you love." },
  { src: event4, headline: "Seamless Ticketing", sub: "Buy and sell tickets with ease and confidence." },
  { src: event5, headline: "Your Next Experience Awaits", sub: "Explore thousands of events happening around you." },
];

const AuthCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
      {slides.map((slide, i) => (
        <img
          key={i}
          src={slide.src}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div className="relative z-10 flex flex-col justify-between p-10 w-full">
        <Link to="/">
          <img src={mainLogo} alt="iBLOOV" className="h-7" />
        </Link>
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white mb-2 transition-all duration-500">
            {slides[current].headline}
          </h2>
          <p className="text-white/70 text-sm max-w-md transition-all duration-500">
            {slides[current].sub}
          </p>
          {/* Dots */}
          <div className="flex gap-2 mt-6">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-white" : "w-4 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCarousel;
