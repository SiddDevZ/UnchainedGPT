import React, { useState, useRef, useEffect } from "react";

const faqs = [
  {
    question: "What models do you provide?",
    answer:
      "We provide a range of advanced AI models including GPT 4o, Claude 3.5 Sonnet, Flux 1.1 Pro, Midjourney, and many more. These models are designed to cater to various applications.",
  },
  {
    question: "Are there any limits?",
    answer:
      "There are no strict usage limits, but spamming and unethical use of our platform are prohibited. We encourage responsible usage to ensure a fair experience for all users.",
  },
  {
    question: "Is the platform really free?",
    answer:
      "Yes, the platform is entirely free. There is no cost involved for any features or usage. Enjoy full access without any charges.",
  },
  {
    question: "Can I use these AI models for commercial purposes?",
    answer:
      "Yes, they can be used for commercial purposes, including models like GPT 4o and Flux. However, please check each individual model's policies for specific terms and conditions.",
  },
  {
    question: "Do I need an account to use the platform?",
    answer:
      "Yes, you need to create an account to access our platform. However, you can try it out for a limited time without an account to explore our basic features and models.",
  },
];

const QuestionList = ({ index, question, answer, isOpen, toggleAnswer }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.maxHeight = isOpen
        ? `${contentRef.current.scrollHeight}px`
        : "0px";
    }
  }, [isOpen]);

  return (
    <div
      className={`px-5 rounded-xl py-4 mb-2 border cursor-pointer transition-all ease-out ${
        isOpen ? "bg-[#2424244b]" : "hover:bg-[#2424244b]"
      }`}
      onClick={() => toggleAnswer(index)}
    >
      <div
        className="question-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="font-inter font-medium text-[#eaeaea] unselectable">
          {question}
        </h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: "0px" }}
      >
        <p className="mt-3 font-inter text-[#c4c4c4]">{answer}</p>
      </div>
    </div>
  );
};

const Questions = () => {
  const [openQuestionIndex, setOpenQuestionIndex] = useState(null);

  const toggleAnswer = (index) => {
    setOpenQuestionIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <div className="w-full flex mt-10">
      <div className="sm:w-[70%] xss:w-[90%] mx-auto">
        {faqs.map((faq, index) => (
          <QuestionList
            key={index}
            index={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openQuestionIndex === index}
            toggleAnswer={toggleAnswer}
          />
        ))}
      </div>
      {/* <div className="w-[30%] border mx-3"></div> */}
    </div>
  );
};

export default Questions;
