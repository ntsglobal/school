import React, { useState, useEffect } from 'react';
import LanguageBuddyFinder from '../components/LanguageBuddyFinder.jsx';
import BuddyProfileSetup from '../components/BuddyProfileSetup.jsx';
import buddyService from '../services/buddyService.js';

const LanguageBuddyPage = () => {
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBuddyProfile();
  }, []);

  const checkBuddyProfile = async () => {
    try {
      await buddyService.getBuddyProfile();
      setHasProfile(true);
    } catch (error) {
      // Profile doesn't exist or user not authenticated
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setHasProfile(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your buddy profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {hasProfile ? (
        <LanguageBuddyFinder />
      ) : (
        <BuddyProfileSetup onComplete={handleProfileComplete} />
      )}
    </>
  );
};

export default LanguageBuddyPage;
