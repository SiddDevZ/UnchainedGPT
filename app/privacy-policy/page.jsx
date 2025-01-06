"use client"
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function PrivacyPolicy() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const sections = document.querySelectorAll('.policy-section');

    sections.forEach((section, index) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom-=100',
            end: 'bottom top+=100',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold mb-8 text-center animate-fade-in-down">Privacy Policy</h1>
        
        <section className="policy-section mb-12 hover:bg-gray-900 transition-colors duration-300 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">We collect the following information when you use our service:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your name</li>
            <li>Email address</li>
            <li>Profile picture</li>
            <li>Any other information you choose to provide</li>
          </ul>
        </section>

        <section className="policy-section mb-12 hover:bg-gray-900 transition-colors duration-300 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the collected information for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain our service</li>
            <li>To notify you about changes to our service</li>
            <li>To allow you to participate in interactive features of our service</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our service</li>
            <li>To monitor the usage of our service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>
        </section>

        <section className="policy-section mb-12 hover:bg-gray-900 transition-colors duration-300 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold mb-4">3. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction or damage.
          </p>
        </section>

        <section className="policy-section mb-12 hover:bg-gray-900 transition-colors duration-300 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold mb-4">4. Third-Party Services</h2>
          <p>
            We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related services, or assist us in analyzing how our service is used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
          </p>
        </section>

        <section className="policy-section mb-12 hover:bg-gray-900 transition-colors duration-300 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal information</li>
            <li>Correct any inaccurate personal information</li>
            <li>Request the deletion of your personal information</li>
            <li>Object to the processing of your personal information</li>
            <li>Request the transfer of your personal information</li>
          </ul>
        </section>

        <section className="policy-section mb-12 hover:bg-gray-900 transition-colors duration-300 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold mb-4">6. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "effective date" at the top of this Privacy Policy.
          </p>
        </section>

        <section className="policy-section hover:bg-gray-900 transition-colors duration-300 p-6 rounded-lg">
          <h2 className="text-3xl font-semibold mb-4">7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at siddz.dev@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}