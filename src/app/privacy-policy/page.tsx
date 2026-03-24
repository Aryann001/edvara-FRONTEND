'use client';

import React from 'react';
import { useAppSelector } from '@/store/hooks';

export default function PrivacyPolicyPage() {
  // Pulling the current theme domain to keep the UI consistent
  const isCoding = useAppSelector((state) => state.app.isCodingDomain);

  // --- THEME CONSTANTS ---
  const bgTheme = isCoding ? "bg-[#161616]" : "bg-neutral-50";
  const textMain = isCoding ? "text-white" : "text-neutral-950";
  const textSub = isCoding ? "text-white/80" : "text-neutral-800";

  return (
    <div className={`w-full min-h-screen ${bgTheme} flex flex-col items-center font-['Helvena'] transition-colors duration-500`}>
      
      {/* Main Container - Precise top padding to clear the sticky global navbar */}
      <div className="w-full max-w-[1440px] px-5 md:px-10 lg:px-20 pt-[100px] lg:pt-[140px] pb-14 flex flex-col justify-start items-start gap-8 lg:gap-12">
        
        {/* Page Title */}
        <h1 className={`${textMain} text-3xl md:text-4xl lg:text-5xl font-bold leading-tight`}>
          Privacy Policy
        </h1>

        {/* Content Wrapper */}
        <div className="w-full flex flex-col justify-start items-start gap-8 lg:gap-10">
          
          {/* Section 1: Introduction and Scope */}
          <div className="w-full flex flex-col justify-start items-start gap-3 lg:gap-4">
            <h2 className={`${textMain} text-lg md:text-xl font-bold leading-6`}>
              Introduction and Scope
            </h2>
            
            {/* Responsive left-padding and subtle orange accent border */}
            <div className="w-full pl-0 md:pl-6 border-l-0 md:border-l-2 border-[#FE6100]">
              <p className={`${textSub} text-sm md:text-base font-medium leading-relaxed md:leading-7 text-justify`}>
                This Privacy Policy describes how Edvara Academics Private Limited (“Company”, “We”, “Our”, “Us”) collects, uses, and protects the personal information of users (&quot;You&quot;, &quot;User&quot;, &quot;Learner&quot;) when you use our website and services. We are committed to ensuring that your privacy is protected and that your personal data is handled transparently and securely in accordance with applicable data protection laws. Your use of our platform constitutes your acknowledgement that you have read, understood, and consented to the terms of this policy. This policy governs all information collected via our website, mobile applications, and related services, sales, marketing, or events. We are committed to fostering a safe educational environment and upholding the highest standards of data integrity for every learner. Should you disagree with any provisions of this policy or the terms of use, you must immediately cease all access and use of the platform and any communications with us. If any data you provide or upload violates this policy or the terms of use, we retain the right, upon notice to you, to delete such data and, if necessary, terminate your access without incurring any liability to you. Capitalised terms not defined herein are as defined in our Terms of Use. We strongly advise you to review this policy carefully prior to accessing or using our platform and its services. For questions, please contact us using the details provided below.
              </p>
            </div>
          </div>

          {/* Future sections can easily be stacked below following the same pattern */}

        </div>
      </div>
    </div>
  );
}