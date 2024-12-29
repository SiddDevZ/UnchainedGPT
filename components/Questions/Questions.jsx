import React, { useState } from "react";

const faqs = [
  {
    question: "What is Zenos AI?",
    answer:
      "Zenos AI is an advanced artificial intelligence platform designed to assist with various tasks and provide intelligent solutions.",
  },
  {
    question: "How can I get started with Zenos AI?",
    answer:
      "To get started with Zenos AI, simply sign up for an account on our website and follow the onboarding process. We'll guide you through the initial setup and how to use our features.",
  },
  {
    question: "Is Zenos AI suitable for businesses?",
    answer:
      "Yes, Zenos AI offers solutions for businesses of all sizes. Our AI can be customized to meet specific industry needs and can help streamline various business processes.",
  },
  {
    question: "What kind of support does Zenos AI offer?",
    answer:
      "We offer 24/7 customer support via email and chat. For enterprise customers, we also provide dedicated support teams and personalized onboarding.",
  },
];

const QuestionList = ({ index, question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAnswer = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div key={index} className="px-5 rounded-xl py-2 mb-2 bg-red-500">
            <div 
                className="question-header" 
                onClick={toggleAnswer}
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <h2>{question}</h2>
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
                    style={{ transition: 'transform 0.3s ease' }}
                    transform={isOpen ? 'rotate(180)' : ''}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
            {isOpen && <p>{answer}</p>}
        </div>
    );
};

const Questions = () => {
  return (
    <div className="w-full mt-10">        
        <div className="w-[70%] mx-auto">
        {faqs.map((faq, index) => (
            <QuestionList
            key={index}
            index={index}
            question={faq.question}
            answer={faq.answer}
            />
        ))}
        </div>
    </div>
  );
};

export default Questions;