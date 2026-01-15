import React, { useState, useEffect } from "react";
import './Reviews.css'

const testimonials = [
  {
    id: 1,
    name: "Marcus Chen",
    position: "Indie Developer",
    quote: "finally access to mistral large without burning a hole in my pocket. code gen is on par with the paid giants.",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 2,
    name: "Sarah Jenkins",
    position: "Digital Artist",
    quote: "The FLUX image generation is insane. Prompt adherence is actually better than paid tools sometimes.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    name: "Dr. Aris Thorne",
    position: "AI Researcher",
    quote: "Having LLaMA 3, Qwen, and DeepSeek all in one interface is a lifesaver for my research comparisons.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    position: "Content Creator",
    quote: "being able to switch models for different tones makes this platform unique. love the flexibility.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: 5,
    name: "David Park",
    position: "CS Student",
    quote: "saved my finals. LLaMA 70B explained algorithms better than my professor did.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
  },
  {
    id: 6,
    name: "Priya Patel",
    position: "Startup Founder",
    quote: "We're bootstrapping, so free access to enterprise models helped us build our MVP way faster.",
    image: "https://randomuser.me/api/portraits/women/33.jpg",
  },
  {
    id: 7,
    name: "James Wilson",
    position: "Privacy Advocate",
    quote: "uncensored access means i get raw, unfiltered answers. exactly what i need for unbiased research.",
    image: "https://randomuser.me/api/portraits/men/54.jpg",
  },
  {
    id: 8,
    name: "Tom H.",
    position: "Freelance Writer",
    quote: "No credit card required. Just straight access to the best models. Refreshing change of pace.",
    image: "https://randomuser.me/api/portraits/men/86.jpg",
  },
  {
    id: 9,
    name: "Nina Kowalski",
    position: "UX Designer",
    quote: "speed is surprisingly fast for these large models. UI is clean and doesn't get in the way.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 10,
    name: "Rahul Gupta",
    position: "Data Analyst",
    quote: "deepseek v3 is underrated for sql debugging. i use it daily and it rarely misses.",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 11,
    name: "Jessica M.",
    position: "Marketing Manager",
    quote: "Generating copy and then immediately creating a matching image with FLUX is a huge productivity hack.",
    image: "https://randomuser.me/api/portraits/women/90.jpg",
  },
  {
    id: 12,
    name: "Alex Thompson",
    position: "System Admin",
    quote: "mistral gives me concise, accurate bash scripts. always open on my second monitor.",
    image: "https://randomuser.me/api/portraits/men/91.jpg",
  },
  {
    id: 13,
    name: "Morgan F.",
    position: "Creative Director",
    quote: "Image generation detail is stunning. We used it to storyboard a pitch in record time.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 14,
    name: "Samir K.",
    position: "Hobbyist Coder",
    quote: "learning python and qwen 72b explains it better than tutorials. feels like a personalized tutor.",
    image: "https://randomuser.me/api/portraits/men/29.jpg",
  },
  {
    id: 15,
    name: "Jordan Lee",
    position: "Fiction Writer",
    quote: "uncensored nature allows for actual creative writing without the moralizing. finally a tool for writers.",
    image: "https://randomuser.me/api/portraits/women/52.jpg",
  },
];

const ReviewChild = ({ name, position, quote, image }) => (
  <div className="w-full rounded-2xl bg-neutral-900/30 backdrop-blur-sm border border-neutral-800/40 p-6 mb-4 transition-colors duration-200">
    <div className="flex items-center gap-3 mb-4">
      <img 
        src={image} 
        className="h-9 w-9 rounded-full object-cover ring-2 ring-neutral-800" 
        alt={name}
      />
      <div>
        <h3 className="font-semibold text-neutral-200">{name}</h3>
        <p className="text-xs -translate-y-0.5 text-neutral-400">{position}</p>
      </div>
    </div>
    <p className="text-neutral-300 text-sm leading-relaxed">{quote}</p>
  </div>
);

const Reviews = () => {
  const [hoveredColumns, setHoveredColumns] = useState([false, false, false]);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseEnter = (columnIndex) => {
    setHoveredColumns(prev => {
      const newState = [...prev];
      newState[columnIndex] = true;
      return newState;
    });
  };

  const handleMouseLeave = (columnIndex) => {
    setHoveredColumns(prev => {
      const newState = [...prev];
      newState[columnIndex] = false;
      return newState;
    });
  };

  const shouldShowInColumn = (index, columnIndex) => {
    if (windowWidth >= 1024) return index % 3 === columnIndex;
    if (windowWidth >= 640) return index % 2 === columnIndex % 2;
    return true;
  };

  return (
    <div className="container mt-14 h-[90vh] overflow-hidden mx-auto">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((columnIndex) => (
          <div
            key={columnIndex}
            className="relative"
            // onMouseEnter={() => handleMouseEnter(columnIndex)}
            // onMouseLeave={() => handleMouseLeave(columnIndex)}
          >
            <div
              className={`vertical-scroll ${hoveredColumns[columnIndex] ? "hovered" : ""} ${
                columnIndex === 0 || columnIndex === 2 ? "fast" : ""
              }`}
            >
              {[...testimonials, ...testimonials].map((testimonial, index) => 
                shouldShowInColumn(index, columnIndex) ? (
                  <ReviewChild
                    key={`${testimonial.id}-${index}`}
                    name={testimonial.name}
                    position={testimonial.position}
                    quote={testimonial.quote}
                    image={testimonial.image}
                  />
                ) : null
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
