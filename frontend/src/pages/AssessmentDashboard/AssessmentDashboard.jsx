import React, { useState } from 'react';
import { FaBook, FaHeadphones, FaMicrophone, FaPen, FaEye, FaRedo, FaPlay } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './AssessmentDashboard.css';

const AssessmentDashboard = () => {
  const assessmentModules = [
    {
      id: 1,
      title: 'Reading Assessment',
      subtitle: 'Test your reading comprehension',
      moduleCount: '7/10 modules completed',
      icon: <FaBook />,
      color: 'green',
      bgColor: 'bg-green-50'
    },
    {
      id: 2,
      title: 'Listening Assessment',
      subtitle: 'Evaluate your listening skills',
      moduleCount: '5/10 modules completed',
      icon: <FaHeadphones />,
      color: 'blue',
      bgColor: 'bg-blue-50'
    },
    {
      id: 3,
      title: 'Speaking Assessment',
      subtitle: 'Practice pronunciation and fluency',
      moduleCount: '3/10 modules completed',
      icon: <FaMicrophone />,
      color: 'yellow',
      bgColor: 'bg-yellow-50'
    },
    {
      id: 4,
      title: 'Writing Assessment',
      subtitle: 'Improve your writing abilities',
      moduleCount: '4/10 modules completed',
      icon: <FaPen />,
      color: 'red',
      bgColor: 'bg-red-50'
    }
  ];

  const recentTests = [
    {
      id: 1,
      name: 'Japanese Reading Comprehension',
      language: 'Japanese',
      score: '85%',
      date: '2024/12/15',
      status: 'Completed'
    },
    {
      id: 2,
      name: 'German Listening Practice',
      language: 'German',
      score: '78%',
      date: '2024/12/14',
      status: 'Completed'
    },
    {
      id: 3,
      name: 'French Speaking Test',
      language: 'French',
      score: '92%',
      date: '2024/12/13',
      status: 'Completed'
    }
  ];

  const performanceData = [
    { skill: 'Reading', score: 85, color: '#10b981' },
    { skill: 'Listening', score: 78, color: '#3b82f6' },
    { skill: 'Speaking', score: 92, color: '#f59e0b' },
    { skill: 'Writing', score: 75, color: '#ef4444' }
  ];

  return (
    <div className="assessment-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Language Assessments</h1>
          <p className="dashboard-subtitle">Test your language proficiency across multiple skills</p>
        </div>

        {/* Assessment Modules */}
        <div className="assessment-modules">
          {assessmentModules.map((module) => (
            <div key={module.id} className={`assessment-card ${module.bgColor}`}>
              <div className="card-header">
                <div className={`card-icon ${module.color}`}>
                  {module.icon}
                </div>
                <h3 className="card-title">{module.title}</h3>
              </div>
              <p className="card-subtitle">{module.subtitle}</p>
              <div className="card-progress">
                <span className="progress-text">{module.moduleCount}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Tests */}
        <div className="recent-tests-section">
          <h2 className="section-title">Recent Tests</h2>
          <div className="tests-table">
            <div className="table-header">
              <div className="header-cell">Test Name</div>
              <div className="header-cell">Language</div>
              <div className="header-cell">Score</div>
              <div className="header-cell">Date</div>
              <div className="header-cell">Status</div>
              <div className="header-cell">Action</div>
            </div>
            {recentTests.map((test) => (
              <div key={test.id} className="table-row">
                <div className="table-cell">{test.name}</div>
                <div className="table-cell">{test.language}</div>
                <div className="table-cell">
                  <span className="score">{test.score}</span>
                </div>
                <div className="table-cell">{test.date}</div>
                <div className="table-cell">
                  <span className="status completed">{test.status}</span>
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button className="action-btn view-btn" title="View Results">
                      <FaEye />
                    </button>
                    <button className="action-btn retry-btn" title="Retry Test">
                      <FaRedo />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="performance-section">
          <h2 className="section-title">Your Performance Overview</h2>
          <div className="chart-container">
            <div className="chart">
              {performanceData.map((item, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${item.score}%`, 
                      backgroundColor: item.color 
                    }}
                  ></div>
                  <div className="bar-label">{item.skill}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color"></div>
                <span>Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="dashboard-actions">
          <button className="action-button primary">
            <FaPlay className="button-icon" />
            Start New Test
          </button>
          <button className="action-button secondary">
            Review Previous Tests
          </button>
          <button className="action-button tertiary">
            View Study Material
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AssessmentDashboard;
