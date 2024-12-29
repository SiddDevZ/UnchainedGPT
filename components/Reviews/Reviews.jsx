import React, { useState, useEffect } from "react";
import './Reviews.css'

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "John Doe",
    position: "CEO, Company A",
    quote:
      "It's like having a superpower! This AI tool has given us the ability to do things we never thought were possible in our field.",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "Jane Smith",
    position: "CTO, Company B",
    quote:
      "Transformative technology with real impact. It has streamlined our operations and brought unprecedented efficiency to our processes.",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    id: 3,
    name: "Mike Johnson",
    position: "Founder, Startup X",
    quote:
      "It has completely changed the way we operate. The AI's ability to analyze and optimize our processes is phenomenal.",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    id: 4,
    name: "Emily Brown",
    position: "COO, Tech Innovators",
    quote:
      "Absolutely revolutionary, a game-changer for our industry. It has streamlined our processes and enhanced our productivity dramatically.",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    id: 5,
    name: "Alex Chen",
    position: "Lead Developer, AI Solutions",
    quote:
      "What a fantastic AI! I just love it. It has completely transformed the way I approach problems and develop solutions.",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    id: 6,
    name: "Sarah Thompson",
    position: "Data Scientist, Research Labs",
    quote:
      "The insights provided by this AI are unparalleled. It's like having a team of experts at your fingertips.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
  {
    id: 7,
    name: "Robert Garcia",
    position: "Marketing Director, Global Brands",
    quote:
      "Our marketing strategies have never been more targeted and effective. This AI tool is a game-changer in understanding consumer behavior.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
  },
  {
    id: 8,
    name: "Lisa Wong",
    position: "UX Designer, Creative Solutions",
    quote:
      "The AI's ability to generate design ideas and predict user preferences has revolutionized our creative process.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
  },
  {
    id: 9,
    name: "David Patel",
    position: "CFO, Financial Tech",
    quote:
      "The predictive analytics provided by this AI have significantly improved our financial forecasting and risk management.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
  },
  {
    id: 10,
    name: "Emma Wilson",
    position: "HR Manager, People First",
    quote:
      "This AI tool has transformed our recruitment process, helping us find the perfect candidates with unprecedented accuracy.",
    image: "https://randomuser.me/api/portraits/women/10.jpg",
  },
  {
    id: 11,
    name: "Chris Taylor",
    position: "Operations Manager, Logistics Pro",
    quote:
      "The optimization capabilities of this AI have streamlined our supply chain in ways we never thought possible.",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
  },
  {
    id: 12,
    name: "Olivia Martinez",
    position: "Product Manager, Innovate Inc.",
    quote:
      "From ideation to launch, this AI tool has accelerated our product development cycle and improved our success rate.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
  },
  {
    id: 13,
    name: "Ryan Lee",
    position: "Security Analyst, Cyber Shield",
    quote:
      "The AI's threat detection capabilities have significantly enhanced our cybersecurity measures. It's like having a vigilant guardian.",
    image: "https://randomuser.me/api/portraits/men/13.jpg",
  },
  {
    id: 14,
    name: "Sophia Anderson",
    position: "Content Strategist, Media Minds",
    quote:
      "This AI tool has revolutionized our content creation process. It's like having a creative genius on call 24/7.",
    image: "https://randomuser.me/api/portraits/women/14.jpg",
  },
  {
    id: 15,
    name: "Daniel Kim",
    position: "CIO, Tech Frontiers",
    quote:
      "Integrating this AI into our IT infrastructure has boosted our efficiency and innovation capabilities beyond our expectations.",
    image: "https://randomuser.me/api/portraits/men/15.jpg",
  },
  {
    id: 16,
    name: "Rachel Green",
    position: "Customer Success Manager, Happy Clients",
    quote:
      "The AI-powered customer insights have allowed us to provide personalized experiences that delight our clients consistently.",
    image: "https://randomuser.me/api/portraits/women/16.jpg",
  },
  {
    id: 17,
    name: "Thomas Wright",
    position: "Research Scientist, BioTech Innovations",
    quote:
      "This AI tool has accelerated our research process, helping us identify patterns and insights that would have taken years to discover otherwise.",
    image: "https://randomuser.me/api/portraits/men/17.jpg",
  },
  {
    id: 18,
    name: "Natalie Clark",
    position: "Sustainability Officer, Green Future",
    quote:
      "The AI's predictive models have been instrumental in optimizing our sustainability efforts and reducing our environmental impact.",
    image: "https://randomuser.me/api/portraits/women/18.jpg",
  },
];

const ReviewChild = ({ name, position, quote, image }) => {
  return (
    <div className="child w-full rounded-3xl bg-neutral-900 p-8 pb-8 mb-6">
      <div className="flex">
        <img src={image} className="h-10 w-10 rounded-full" alt="" />
        <div className="flex flex-col ml-4">
          <h2 className="font-semibold text-[#fefefe]">{name}</h2>
          <h3 className="text-sm text-[#d6d6d6]">{position}</h3>
        </div>
      </div>
      <p className="text-[#ededed] mt-3">{quote}</p>
    </div>
  );
};

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
    setHoveredColumns((prev) => {
      const newState = [...prev];
      newState[columnIndex] = true;
      return newState;
    });
  };

  const handleMouseLeave = (columnIndex) => {
    setHoveredColumns((prev) => {
      const newState = [...prev];
      newState[columnIndex] = false;
      return newState;
    });
  };

  return (
    <div className="container mt-14 h-[90vh] overflow-hidden mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((columnIndex) => (
          <div
            key={columnIndex}
            className="relative"
            onMouseEnter={() => handleMouseEnter(columnIndex)}
            onMouseLeave={() => handleMouseLeave(columnIndex)}
          >
            <div
              className={`vertical-scroll ${
                hoveredColumns[columnIndex] ? "hovered" : ""
              } ${columnIndex === 0 || columnIndex === 2 ? "fast" : ""}`}
            >
              {[...testimonials, ...testimonials].map((testimonial, index) => {
                if (
                  (windowWidth >= 1024 && index % 3 === columnIndex) ||
                  (windowWidth >= 640 && windowWidth < 1024 && index % 2 === columnIndex % 2) ||
                  windowWidth < 640
                ) {
                  return (
                    <ReviewChild
                      key={`${testimonial.id}-${index}`}
                      name={testimonial.name}
                      position={testimonial.position}
                      quote={testimonial.quote}
                      image={testimonial.image}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
