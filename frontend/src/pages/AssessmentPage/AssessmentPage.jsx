import React, { useState } from 'react';
import { FaArrowLeft, FaQuestionCircle, FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import './AssessmentPage.css';

const AssessmentPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState(7);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timeSpent, setTimeSpent] = useState('25:30');
  
  const totalQuestions = 30;
  const completed = 21;
  const remaining = 9;

  const skillProgress = [
    { skill: 'Reading', score: 8, total: 10, color: 'bg-green-500' },
    { skill: 'Listening', score: 6, total: 10, color: 'bg-blue-500' },
    { skill: 'Speaking', score: 4, total: 10, color: 'bg-yellow-500' },
    { skill: 'Writing', score: 0, total: 10, color: 'bg-gray-300' }
  ];

  const questionOptions = [
    { id: 'a', text: '本を読む a book', icon: '📖' },
    { id: 'b', text: 'am reading a book', icon: '📚' },
    { id: 'c', text: 'の読む read a book', icon: '📘' },
    { id: 'd', text: 'have read a book', icon: '📙' }
  ];

  const handleAnswerSelect = (answerId) => {
    setSelectedAnswer(answerId);
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="assessment-page">
      <Navbar />
      
      <div className="assessment-container">
        {/* Header */}
        <div className="assessment-header">
          <div className="header-left">
            <h1 className="assessment-title">Japanese Language Assessment ■ Module 3</h1>
            <p className="assessment-subtitle">Grammar and Vocabulary</p>
          </div>
          <div className="header-right">
            <div className="time-indicator">
              <FaClock className="time-icon" />
              <span>45 minutes left</span>
            </div>
          </div>
        </div>

        <div className="assessment-content">
          {/* Main Question Area */}
          <div className="question-section">
            <div className="question-header">
              <span className="question-number">Question {currentQuestion} of {totalQuestions}</span>
              <div className="help-indicator">
                <FaQuestionCircle className="help-icon" />
                <span>Need Help?</span>
              </div>
            </div>

            <div className="question-content">
              <h2 className="question-text">Choose the correct translation for the following Japanese sentence:</h2>
              <div className="japanese-sentence">私は本を読みました。</div>

              <div className="answer-options">
                {questionOptions.map((option) => (
                  <label key={option.id} className="answer-option">
                    <input
                      type="radio"
                      name="answer"
                      value={option.id}
                      checked={selectedAnswer === option.id}
                      onChange={() => handleAnswerSelect(option.id)}
                    />
                    <div className="option-content">
                      <span className="option-icon">{option.icon}</span>
                      <span className="option-text">{option.text}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="question-navigation">
              <button 
                className="nav-btn previous-btn"
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
              >
                <FaArrowLeft />
                Previous
              </button>
              <button className="nav-btn save-btn">
                Save & Exit
              </button>
              <button 
                className="nav-btn next-btn"
                onClick={handleNext}
                disabled={!selectedAnswer}
              >
                Next Question
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="assessment-sidebar">
            <div className="skill-progress">
              <h3>Skill Progress</h3>
              {skillProgress.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-header">
                    <span className="skill-name">{skill.skill}</span>
                    <span className="skill-score">{skill.score}/{skill.total}</span>
                  </div>
                  <div className="skill-bar">
                    <div 
                      className={`skill-fill ${skill.color}`}
                      style={{ width: `${(skill.score / skill.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Assessment Summary */}
        <div className="assessment-summary">
          <div className="summary-item">
            <FaQuestionCircle className="summary-icon" />
            <div>
              <span className="summary-label">Total Questions</span>
              <span className="summary-value">{totalQuestions}</span>
            </div>
          </div>
          <div className="summary-item">
            <FaClock className="summary-icon" />
            <div>
              <span className="summary-label">Time Spent</span>
              <span className="summary-value">{timeSpent}</span>
            </div>
          </div>
          <div className="summary-item">
            <FaCheckCircle className="summary-icon completed" />
            <div>
              <span className="summary-label">Completed</span>
              <span className="summary-value">{completed}/{totalQuestions}</span>
            </div>
          </div>
          <div className="summary-item">
            <FaExclamationTriangle className="summary-icon remaining" />
            <div>
              <span className="summary-label">Remaining</span>
              <span className="summary-value">{remaining}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="assessment-footer">
          <p>© 2024 NTS Green School. All rights reserved.</p>
          <div className="footer-links">
            <a href="/help">Help Center</a>
            <a href="/terms">Terms of Use</a>
            <a href="/privacy">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;
