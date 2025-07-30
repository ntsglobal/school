import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSelector from '../../components/LanguageSelector';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './LanguageSelectionPage.css';

const LanguageSelectionPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const handleLanguageSelection = async (selections) => {
    try {
      setLoading(true);
      
      // Update user profile with selected languages
      await updateUserProfile({
        selectedLanguages: selections,
        onboardingComplete: true
      });
      
      // Navigate to dashboard
      navigate('/student-dashboard');
    } catch (error) {
      console.error('Error saving language selection:', error);
      // Handle error (show toast notification)
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/onboarding/step3');
  };

  return (
    <div className="language-selection-page">
      <Navbar />
      
      <div className="language-selection-container">
        <div className="language-selection-header">
          <h1 className="page-title">
            {t('languageSelection.title', 'Choose Your Learning Languages')}
          </h1>
          <p className="page-subtitle">
            {t('languageSelection.subtitle', 'Select the languages you want to learn and your proficiency level')}
          </p>
        </div>

        <div className="language-selection-content">
          <LanguageSelector
            onSelection={handleLanguageSelection}
            loading={loading}
            multiSelect={true}
            showGradeSelection={true}
            showPathSelection={true}
          />
        </div>

        <div className="navigation-buttons">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={handleBack}
            disabled={loading}
          >
            {t('common.back', 'Back')}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LanguageSelectionPage;
