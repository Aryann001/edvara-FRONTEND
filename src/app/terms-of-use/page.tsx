'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';

export default function TermsOfUsePage() {
  // Pulling the current theme domain to keep the UI consistent
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // --- THEME CONSTANTS ---
  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-white/80" : "text-neutral-800";

  // --- MOCK CONTENT DATA ---
  const termsSections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using the platform provided by Edvara Academics Private Limited (“Company”, “We”, “Our”, “Us”), you agree to comply with and be bound by these Terms of Use. These terms govern your access to and use of our website, mobile applications, and all associated services. If you do not agree with any part of these terms, you must immediately discontinue your use of our platform. We reserve the right to update or modify these terms at any time without prior notice, and your continued use of the platform constitutes your acceptance of such changes."
    },
    {
      title: "2. User Accounts and Security",
      content: "To access certain features of our platform, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and for any activities or actions under your account. Edvara Academics Private Limited will not be liable for any loss or damage arising from your failure to comply with these security obligations."
    },
    {
      title: "3. Acceptable Use of the Platform",
      content: "You agree to use the platform only for lawful educational purposes. You are strictly prohibited from using the platform to post or transmit any material that is infringing, threatening, false, misleading, abusive, harassing, defamatory, vulgar, obscene, scandalous, inflammatory, pornographic, or profane. Furthermore, you may not attempt to gain unauthorized access to any portion of the platform, circumvent our security measures, or use any automated means (such as scrapers or bots) to collect data from our services."
    },
    {
      title: "4. Intellectual Property Rights",
      content: "All content, features, and functionality on the platform—including but not limited to text, graphics, videos, logos, button icons, software, and audio—are the exclusive property of Edvara Academics Private Limited or its licensors and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You may access and use the materials for your personal, non-commercial educational use only. Any other reproduction, distribution, or creation of derivative works is strictly prohibited without our express written consent."
    },
    {
      title: "5. Limitation of Liability",
      content: "To the maximum extent permitted by applicable law, in no event shall Edvara Academics Private Limited, its affiliates, directors, employees, or licensors be liable for any indirect, punitive, incidental, special, consequential, or exemplary damages, including without limitation damages for loss of profits, goodwill, use, data, or other intangible losses, that result from the use of, or inability to use, this platform. The platform and all materials are provided on an 'as is' and 'as available' basis without warranties of any kind."
    }
  ];

  return (
    <div className={`w-full min-h-screen ${bgTheme} flex flex-col items-center font-['Helvena'] transition-colors duration-500`}>
      
      {/* Main Container - Precise top padding to clear the sticky global navbar */}
      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 pt-[100px] lg:pt-[140px] pb-14 flex flex-col justify-start items-start gap-8 lg:gap-12">
        
        {/* Page Title */}
        <div className="flex flex-col gap-2">
          <h1 className={`${textMain} text-3xl md:text-4xl lg:text-5xl font-bold leading-tight`}>
            Terms of Use
          </h1>
          <p className={`${textSub} text-sm md:text-base font-medium`}>
            Last updated: October 2023
          </p>
        </div>

        {/* Content Wrapper */}
        <div className="w-full flex flex-col justify-start items-start gap-10 lg:gap-12">
          
          {termsSections.map((section, index) => (
            <div key={index} className="w-full flex flex-col justify-start items-start gap-3 lg:gap-4">
              <h2 className={`${textMain} text-lg md:text-xl font-bold leading-6`}>
                {section.title}
              </h2>
              
              {/* Responsive left-padding and subtle orange accent border */}
              <div className="w-full pl-0 md:pl-6 border-l-0 md:border-l-2 border-[#FE6100]">
                <p className={`${textSub} text-sm md:text-base font-medium leading-relaxed md:leading-7 text-justify`}>
                  {section.content}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}