import react from 'react';
import Hero from './Hero';
import Features from './Features';
import AvailableLanguages from "./AvailableLanguages";
import SuccessStories from "./SuccessStories";
import FinalCTA from "./FinalCTA";

function LandingPage() {
  return (
    <>
      <Hero />
      <Features />
      <AvailableLanguages />
      <SuccessStories />
      <FinalCTA />
    </>
  );
}

export default LandingPage;
