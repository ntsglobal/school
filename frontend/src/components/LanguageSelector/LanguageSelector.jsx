import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LEARNING_LANGUAGES, CEFR_LEVELS, GRADE_LEVELS, LEARNING_PATHS } from '../../constants/languages';
import { useAuth } from '../../contexts/AuthContext';
import './LanguageSelector.css';

const LanguageSelector = ({ onLanguageSelect, currentSelection = null, mode = 'full' }) => {
  const { t } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(currentSelection?.language || '');
  const [selectedLevel, setSelectedLevel] = useState(currentSelection?.cefrLevel || '');
  const [selectedGrade, setSelectedGrade] = useState(currentSelection?.gradeLevel || 6);
  const [selectedPath, setSelectedPath] = useState(currentSelection?.learningPath || 'academic');
  const [selectedBoard, setSelectedBoard] = useState(currentSelection?.board || 'CBSE');
  const [showDetails, setShowDetails] = useState(false);

  // Handle language selection
  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    if (mode === 'simple') {
      onLanguageSelect({ language: languageCode });
    }
  };

  // Handle level selection
  const handleLevelChange = (level) => {
    setSelectedLevel(level);
  };

  // Handle complete selection
  const handleComplete = async () => {
    const selection = {
      language: selectedLanguage,
      cefrLevel: selectedLevel,
      gradeLevel: selectedGrade,
      learningPath: selectedPath,
      board: selectedBoard
    };

    if (onLanguageSelect) {
      onLanguageSelect(selection);
    }

    // Update user profile if user is logged in
    if (user) {
      try {
        await updateUserProfile(selection);
      } catch (error) {
        console.error('Failed to update user profile:', error);
      }
    }
  };

  // Get language details
  const getLanguageDetails = (code) => {
    return Object.values(LEARNING_LANGUAGES).find(lang => lang.code === code);
  };

  // Check if selection is complete
  const isSelectionComplete = () => {
    if (mode === 'simple') return selectedLanguage;
    return selectedLanguage && selectedLevel && selectedGrade && selectedPath;
  };

  return (
    <div className="language-selector">
      <div className="selector-header">
        <h2 className="selector-title">
          {mode === 'simple' ? t('languages.selectLanguage') : t('onboarding.customizeLearning')}
        </h2>
        <p className="selector-subtitle">
          {mode === 'simple' 
            ? t('languages.chooseLanguageToLearn')
            : t('onboarding.personalizeExperience')
          }
        </p>
      </div>

      {/* Language Selection */}
      <div className="selection-section">
        <h3 className="section-title">{t('languages.learningLanguage')}</h3>
        <div className="language-grid">
          {Object.values(LEARNING_LANGUAGES).map((language) => (
            <div
              key={language.code}
              className={`language-card ${selectedLanguage === language.code ? 'selected' : ''}`}
              onClick={() => handleLanguageChange(language.code)}
            >
              <div className="language-flag">{language.flag}</div>
              <div className="language-info">
                <h4 className="language-name">{language.name}</h4>
                <p className="language-native">{language.nativeName}</p>
                <div className="language-icon">{language.icon}</div>
              </div>
              <div className="language-meta">
                <div className="cefr-levels">
                  {language.cefr.map(level => (
                    <span key={level} className="level-badge">{level}</span>
                  ))}
                </div>
                <div className="cultural-regions">
                  <span className="region-count">
                    {language.culturalRegions.length} {t('languages.regions')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CEFR Level Selection */}
      {selectedLanguage && mode === 'full' && (
        <div className="selection-section">
          <h3 className="section-title">{t('languages.currentLevel')}</h3>
          <div className="level-grid">
            {Object.values(CEFR_LEVELS).map((level) => (
              <div
                key={level.code}
                className={`level-card ${selectedLevel === level.code ? 'selected' : ''}`}
                onClick={() => handleLevelChange(level.code)}
                style={{ '--level-color': level.color }}
              >
                <div className="level-header">
                  <h4 className="level-code">{level.code}</h4>
                  <span className="level-name">{level.name}</span>
                </div>
                <p className="level-description">{level.description}</p>
                <div className="level-details">
                  <div className="detail-item">
                    <span className="detail-label">{t('languages.vocabulary')}:</span>
                    <span className="detail-value">{level.vocabulary.toLocaleString()} {t('common.words')}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">{t('languages.duration')}:</span>
                    <span className="detail-value">{level.duration}</span>
                  </div>
                </div>
                <button
                  className="level-expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(!showDetails);
                  }}
                >
                  {t('common.viewSkills')}
                </button>
                {showDetails && (
                  <div className="level-skills">
                    <div className="skill-item">
                      <strong>{t('skills.listening')}:</strong> {level.skills.listening}
                    </div>
                    <div className="skill-item">
                      <strong>{t('skills.reading')}:</strong> {level.skills.reading}
                    </div>
                    <div className="skill-item">
                      <strong>{t('skills.speaking')}:</strong> {level.skills.speaking}
                    </div>
                    <div className="skill-item">
                      <strong>{t('skills.writing')}:</strong> {level.skills.writing}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade and Board Selection */}
      {selectedLanguage && mode === 'full' && (
        <div className="selection-section">
          <h3 className="section-title">{t('academic.gradeAndBoard')}</h3>
          <div className="academic-selection">
            <div className="grade-selection">
              <label className="selection-label">{t('academic.grade')}</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(Number(e.target.value))}
                className="selection-dropdown"
              >
                {Object.values(GRADE_LEVELS).map((grade) => (
                  <option key={grade.grade} value={grade.grade}>
                    {t('academic.class')} {grade.grade} ({grade.ageRange} {t('academic.years')})
                  </option>
                ))}
              </select>
            </div>
            <div className="board-selection">
              <label className="selection-label">{t('academic.board')}</label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="selection-dropdown"
              >
                {GRADE_LEVELS[selectedGrade]?.boards.map((board) => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
            </div>
          </div>
          {selectedGrade && (
            <div className="grade-info">
              <h4>{t('academic.recommendedFocus')}</h4>
              <div className="focus-areas">
                {GRADE_LEVELS[selectedGrade]?.focusAreas.map((area, index) => (
                  <span key={index} className="focus-area-tag">{area}</span>
                ))}
              </div>
              <p className="recommended-level">
                {t('academic.recommendedLevel')}: 
                <span className="level-highlight">
                  {GRADE_LEVELS[selectedGrade]?.recommendedCefr}
                </span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Learning Path Selection */}
      {selectedLanguage && mode === 'full' && (
        <div className="selection-section">
          <h3 className="section-title">{t('learningPath.choosePath')}</h3>
          <div className="path-grid">
            {Object.values(LEARNING_PATHS).map((path) => (
              <div
                key={path.id}
                className={`path-card ${selectedPath === path.id ? 'selected' : ''}`}
                onClick={() => setSelectedPath(path.id)}
              >
                <div className="path-icon">{path.icon}</div>
                <h4 className="path-name">{path.name}</h4>
                <p className="path-description">{path.description}</p>
                <div className="path-features">
                  {path.features.map((feature, index) => (
                    <span key={index} className="feature-tag">{feature}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Summary */}
      {isSelectionComplete() && (
        <div className="selection-summary">
          <h3 className="summary-title">{t('common.summary')}</h3>
          <div className="summary-content">
            <div className="summary-item">
              <span className="summary-label">{t('languages.language')}:</span>
              <span className="summary-value">
                {getLanguageDetails(selectedLanguage)?.flag} {getLanguageDetails(selectedLanguage)?.name}
              </span>
            </div>
            {mode === 'full' && (
              <>
                <div className="summary-item">
                  <span className="summary-label">{t('languages.level')}:</span>
                  <span className="summary-value">{selectedLevel} - {CEFR_LEVELS[selectedLevel]?.name}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('academic.grade')}:</span>
                  <span className="summary-value">{t('academic.class')} {selectedGrade} ({selectedBoard})</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">{t('learningPath.path')}:</span>
                  <span className="summary-value">
                    {LEARNING_PATHS[selectedPath]?.icon} {LEARNING_PATHS[selectedPath]?.name}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="selector-actions">
        {mode === 'full' && (
          <button
            className="btn-secondary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? t('common.hideDetails') : t('common.showDetails')}
          </button>
        )}
        <button
          className={`btn-primary ${!isSelectionComplete() ? 'disabled' : ''}`}
          onClick={handleComplete}
          disabled={!isSelectionComplete()}
        >
          {mode === 'simple' ? t('common.select') : t('common.continue')}
        </button>
      </div>

      {/* Not sure about level? */}
      {selectedLanguage && mode === 'full' && !selectedLevel && (
        <div className="level-help">
          <p className="help-text">{t('languages.notSureLevel')}</p>
          <button className="btn-link">
            {t('languages.takePlacementTest')}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
