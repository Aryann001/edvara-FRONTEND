import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CourseSelection from '@/components/home/CourseSelection';
import WhyEdvaraTable from '@/components/home/WhyEdvaraTable';
import TestimonialSection from '@/components/home/TestimonialSection';
import FAQSection from '@/components/home/FAQSection';
import FreePreviews from '@/components/home/FreePreviews';
import BentoGrid from '@/components/home/BentoGrid';

export default function page() {

  return (
    <>
      <HeroSection />
      <CourseSelection />
      <WhyEdvaraTable />
      <BentoGrid />
      <TestimonialSection />
      <FreePreviews />
      <FAQSection />
    </>
  );
}