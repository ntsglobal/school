import React, { useState } from 'react';
import { FaDownload, FaCalendar, FaGraduationCap, FaStar, FaChartLine, FaUser, FaAward } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './ParentPortal.css';

const ParentPortal = () => {
  const [selectedMonth] = useState('January');

  const progressCards = [
    {
      id: 1,
      title: 'Total Subjects',
      value: '45/50',
      subtitle: '90% completion',
      icon: <FaGraduationCap />,
      color: 'green'
    },
    {
      id: 2,
      title: 'Current Level',
      value: 'Intermediate',
      subtitle: 'Japanese',
      icon: <FaChartLine />,
      color: 'green'
    },
    {
      id: 3,
      title: 'Next Assessment',
      value: 'July 15',
      subtitle: '2 weeks remaining',
      icon: <FaCalendar />,
      color: 'blue'
    }
  ];

  const skillProgress = [
    { skill: 'Course Completion', progress: 85, color: '#10b981' },
    { skill: 'Reading', progress: 90, color: '#10b981' },
    { skill: 'Writing', progress: 84, color: '#10b981' },
    { skill: 'Speaking', progress: 78, color: '#f59e0b' },
    { skill: 'Listening', progress: 86, color: '#10b981' }
  ];

  const attendanceData = [
    { day: 'Mon', value: 95 },
    { day: 'Tue', value: 98 },
    { day: 'Wed', value: 92 },
    { day: 'Thu', value: 96 },
    { day: 'Fri', value: 94 },
    { day: 'Sat', value: 97 }
  ];

  const achievements = [
    {
      id: 1,
      title: 'Perfect Attendance',
      date: 'June 2023',
      description: 'Attended 100% of the month',
      icon: <FaAward />,
      color: 'gold'
    },
    {
      id: 2,
      title: 'Speaking Milestone',
      date: 'May 2023',
      description: 'Completed advanced speaking module',
      icon: <FaStar />,
      color: 'gold'
    },
    {
      id: 3,
      title: 'Writing Excellence',
      date: 'April 2023',
      description: 'Achieved 95% in writing assessment',
      icon: <FaAward />,
      color: 'gold'
    }
  ];

  const teacherFeedback = [
    {
      id: 1,
      teacher: 'Ms. Tanaka',
      subject: 'Japanese Language',
      feedback: 'Excellent progress in speaking skills, shows great enthusiasm in class discussions.',
      date: 'June 15, 2023',
      avatar: '👩‍🏫'
    },
    {
      id: 2,
      teacher: 'Mr. Schmidt',
      subject: 'German Language',
      feedback: 'Consistent attendance and active participation in group activities.',
      date: 'June 10, 2023',
      avatar: '👨‍🏫'
    }
  ];

  return (
    <div className="parent-portal">
      <Navbar />
      
      <div className="portal-container">
        {/* Header */}
        <div className="portal-header">
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome back, Sarah</h1>
            <p className="last-login">Last Login: Today at 9:45 AM</p>
          </div>
          <div className="header-actions">
            <button className="action-btn primary">
              View Schedule
            </button>
            <button className="action-btn secondary">
              <FaDownload className="btn-icon" />
              Download Report
            </button>
          </div>
        </div>

        {/* Progress Cards */}
        <div className="progress-cards">
          {progressCards.map((card) => (
            <div key={card.id} className={`progress-card ${card.color}`}>
              <div className="card-icon">
                {card.icon}
              </div>
              <div className="card-content">
                <div className="card-value">{card.value}</div>
                <div className="card-title">{card.title}</div>
                <div className="card-subtitle">{card.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="portal-content">
          {/* Overall Progress */}
          <div className="progress-section">
            <h2 className="section-title">Overall Progress</h2>
            <div className="progress-container">
              <div className="circular-progress">
                <div className="circle-chart">
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path
                      className="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="circle"
                      strokeDasharray="85, 100"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <text x="18" y="20.35" className="percentage">85%</text>
                  </svg>
                </div>
              </div>
              <div className="skills-list">
                {skillProgress.map((skill, index) => (
                  <div key={index} className="skill-item">
                    <div className="skill-header">
                      <span className="skill-name">{skill.skill}</span>
                      <span className="skill-percentage">{skill.progress}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-fill"
                        style={{ 
                          width: `${skill.progress}%`,
                          backgroundColor: skill.color
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="attendance-section">
            <h2 className="section-title">Attendance Overview</h2>
            <div className="attendance-chart">
              <div className="chart-bars">
                {attendanceData.map((day, index) => (
                  <div key={index} className="attendance-bar">
                    <div 
                      className="bar"
                      style={{ height: `${day.value}%` }}
                    ></div>
                    <div className="bar-label">{day.day}</div>
                  </div>
                ))}
              </div>
              <div className="attendance-stats">
                <div className="stat-item">
                  <span className="stat-value">95%</span>
                  <span className="stat-label">Average</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="achievements-section">
          <h2 className="section-title">Recent Achievements</h2>
          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-card">
                <div className={`achievement-icon ${achievement.color}`}>
                  {achievement.icon}
                </div>
                <div className="achievement-content">
                  <h3 className="achievement-title">{achievement.title}</h3>
                  <p className="achievement-date">{achievement.date}</p>
                  <p className="achievement-description">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Teacher Feedback */}
        <div className="feedback-section">
          <h2 className="section-title">Latest Teacher Feedback</h2>
          <div className="feedback-list">
            {teacherFeedback.map((feedback) => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-header">
                  <div className="teacher-avatar">{feedback.avatar}</div>
                  <div className="teacher-info">
                    <h4 className="teacher-name">{feedback.teacher}</h4>
                    <p className="teacher-subject">{feedback.subject}</p>
                  </div>
                  <div className="feedback-date">{feedback.date}</div>
                </div>
                <p className="feedback-text">{feedback.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ParentPortal;
