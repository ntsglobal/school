import React, { useState, useEffect } from 'react';
import { FaUser, FaGlobe, FaClock, FaHeart, FaBook, FaSave } from 'react-icons/fa';
import buddyService from '../services/buddyService.js';

const BuddyProfileSetup = ({ onComplete }) => {
  const [profile, setProfile] = useState({
    targetLanguage: '',
    currentLevel: '',
    learningGoals: [],
    timezone: 'GMT+5:30',
    interests: [],
    bio: '',
    ageRange: { min: 13, max: 25 },
    preferredGender: 'any',
    preferredLearningStyle: 'mixed',
    availableHours: []
  });
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const languages = [
    { id: 'english', name: 'English', flag: '🇺🇸' },
    { id: 'french', name: 'French', flag: '🇫🇷' },
    { id: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { id: 'german', name: 'German', flag: '🇩🇪' },
    { id: 'japanese', name: 'Japanese', flag: '🇯🇵' },
    { id: 'korean', name: 'Korean', flag: '🇰🇷' },
    { id: 'chinese', name: 'Chinese', flag: '🇨🇳' },
    { id: 'italian', name: 'Italian', flag: '🇮🇹' }
  ];

  const levels = buddyService.getLevels();
  const timezones = buddyService.getTimezones();
  const interests = buddyService.getInterests();
  const learningGoals = buddyService.getLearningGoals();

  const handleChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await buddyService.createBuddyProfile(profile);
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving buddy profile:', error);
      // For demo purposes, proceed anyway
      if (onComplete) {
        onComplete();
      }
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profile.targetLanguage && profile.currentLevel;
      case 2:
        return profile.timezone && profile.learningGoals.length > 0;
      case 3:
        return profile.interests.length > 0;
      case 4:
        return true; // Bio is optional
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FaGlobe className="text-4xl text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Choose Your Language & Level</h2>
              <p className="text-gray-600">What language are you learning and what's your current level?</p>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Target Language</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => handleChange('targetLanguage', lang.id)}
                    className={`p-4 rounded-lg border-2 transition ${
                      profile.targetLanguage === lang.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{lang.flag}</div>
                    <div className="text-sm font-medium">{lang.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Current Level</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleChange('currentLevel', level.id)}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      profile.currentLevel === level.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{level.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FaClock className="text-4xl text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Timezone & Learning Goals</h2>
              <p className="text-gray-600">When are you available and what do you want to focus on?</p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Your Timezone</label>
              <select
                value={profile.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            {/* Learning Goals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Learning Goals <span className="text-green-600">(Select at least one)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {learningGoals.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleArrayToggle('learningGoals', goal)}
                    className={`p-3 rounded-lg border-2 text-sm transition capitalize ${
                      profile.learningGoals.includes(goal)
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {profile.learningGoals.length}
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FaHeart className="text-4xl text-pink-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Your Interests</h2>
              <p className="text-gray-600">What do you like to talk about? This helps find compatible buddies.</p>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Your Interests <span className="text-green-600">(Select at least one)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => handleArrayToggle('interests', interest)}
                    className={`p-3 rounded-lg border-2 text-sm transition capitalize ${
                      profile.interests.includes(interest)
                        ? 'border-pink-500 bg-pink-50 text-pink-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected: {profile.interests.length}
              </p>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Buddy Age Range</label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Min Age</label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={profile.ageRange.min}
                    onChange={(e) => handleChange('ageRange', { 
                      ...profile.ageRange, 
                      min: parseInt(e.target.value) 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Max Age</label>
                  <input
                    type="number"
                    min="13"
                    max="100"
                    value={profile.ageRange.max}
                    onChange={(e) => handleChange('ageRange', { 
                      ...profile.ageRange, 
                      max: parseInt(e.target.value) 
                    })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FaUser className="text-4xl text-purple-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">Tell Us About Yourself</h2>
              <p className="text-gray-600">Add a bio to help potential buddies get to know you better!</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Bio <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell us about yourself, your learning goals, hobbies, or anything that would help a buddy get to know you better..."
                rows={4}
                maxLength={500}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {profile.bio.length}/500 characters
              </p>
            </div>

            {/* Learning Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Learning Style</label>
              <select
                value={profile.preferredLearningStyle}
                onChange={(e) => handleChange('preferredLearningStyle', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="mixed">Mixed (Visual + Auditory + Hands-on)</option>
                <option value="visual">Visual (Images, charts, diagrams)</option>
                <option value="auditory">Auditory (Listening, speaking, discussions)</option>
                <option value="kinesthetic">Kinesthetic (Hands-on, activities)</option>
              </select>
            </div>

            {/* Gender Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Buddy Gender Preference</label>
              <select
                value={profile.preferredGender}
                onChange={(e) => handleChange('preferredGender', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="any">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg transition ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className={`px-6 py-2 rounded-lg transition ${
                  isStepValid()
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-6 py-2 rounded-lg transition flex items-center gap-2 ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Create Profile
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuddyProfileSetup;
