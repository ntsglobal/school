import React, { useState } from 'react';
import { FaFire, FaCalendar, FaPlay, FaUsers, FaTrophy, FaBook, FaChartLine, FaGraduationCap } from 'react-icons/fa';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const weeklyProgress = [
    { day: 'Mon', value: 85 },
    { day: 'Tue', value: 70 },
    { day: 'Wed', value: 95 },
    { day: 'Thu', value: 60 },
    { day: 'Fri', value: 80 },
    { day: 'Sat', value: 75 },
    { day: 'Sun', value: 90 }
  ];

  const monthlyAchievements = [
    { language: 'Japanese', progress: 75, color: '#10b981' },
    { language: 'French', progress: 60, color: '#3b82f6' },
    { language: 'Spanish', progress: 45, color: '#f59e0b' }
  ];

  const recentAchievements = [
    {
      id: 1,
      title: 'Japanese Basics',
      subtitle: 'Completed on Jan 15',
      icon: <FaTrophy />,
      color: 'gold'
    },
    {
      id: 2,
      title: 'French Vocabulary',
      subtitle: 'Completed on Jan 12',
      icon: <FaBook />,
      color: 'blue'
    },
    {
      id: 3,
      title: 'Spanish Grammar',
      subtitle: 'In Progress',
      icon: <FaGraduationCap />,
      color: 'orange'
    }
  ];

  const enrolledCourses = [
    {
      id: 1,
      title: 'Japanese',
      subtitle: 'Beginner',
      progress: 75,
      nextLesson: 'Basic Conversations',
      image: '/images/japanese-course.jpg',
      color: '#10b981'
    },
    {
      id: 2,
      title: 'French',
      subtitle: 'Intermediate',
      progress: 60,
      nextLesson: 'Advanced Grammar',
      image: '/images/french-course.jpg',
      color: '#3b82f6'
    },
    {
      id: 3,
      title: 'Spanish',
      subtitle: 'Beginner',
      progress: 45,
      nextLesson: 'Common Phrases',
      image: '/images/spanish-course.jpg',
      color: '#f59e0b'
    }
  ];

  const upcomingSessions = [
    {
      id: 1,
      title: 'Japanese: Basic Conversations',
      time: 'Today, 2:00 PM',
      instructor: 'Ms. Tanaka',
      avatar: '👩‍🏫',
      canJoin: true
    },
    {
      id: 2,
      title: 'French: Grammar Practice',
      time: 'Tomorrow, 10:00 AM',
      instructor: 'Mr. Dubois',
      avatar: '👨‍🏫',
      canJoin: false
    }
  ];

  return (
    <div className="student-dashboard">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="welcome-header">
          <div className="welcome-content">
            <h1 className="welcome-title">Welcome back, Priya!</h1>
            <p className="welcome-subtitle">Ready to continue your language learning journey today?</p>
          </div>
          <div className="current-streak">
            <div className="streak-badge">
              <FaFire className="streak-icon" />
              <div className="streak-content">
                <div className="streak-number">5 days</div>
                <div className="streak-label">Current Streak</div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Weekly Progress */}
          <div className="dashboard-card weekly-progress">
            <div className="card-header">
              <h3 className="card-title">Weekly Progress</h3>
              <FaChartLine className="card-icon" />
            </div>
            <div className="progress-chart">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ height: `${day.value}%` }}
                  ></div>
                  <div className="day-label">{day.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Achievement */}
          <div className="dashboard-card monthly-achievement">
            <div className="card-header">
              <h3 className="card-title">Monthly Achievement</h3>
              <FaTrophy className="card-icon" />
            </div>
            <div className="achievement-list">
              {monthlyAchievements.map((achievement, index) => (
                <div key={index} className="achievement-item">
                  <div className="achievement-info">
                    <span className="achievement-language">{achievement.language}</span>
                    <span className="achievement-percentage">{achievement.progress}%</span>
                  </div>
                  <div className="achievement-bar">
                    <div 
                      className="achievement-fill"
                      style={{ 
                        width: `${achievement.progress}%`,
                        backgroundColor: achievement.color
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="dashboard-card recent-achievements">
            <div className="card-header">
              <h3 className="card-title">Recent Achievements</h3>
              <FaTrophy className="card-icon" />
            </div>
            <div className="achievements-list">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="achievement-card">
                  <div className={`achievement-icon ${achievement.color}`}>
                    {achievement.icon}
                  </div>
                  <div className="achievement-details">
                    <h4 className="achievement-title">{achievement.title}</h4>
                    <p className="achievement-subtitle">{achievement.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="courses-section">
          <div className="section-header">
            <h2 className="section-title">Enrolled Courses</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-image">
                  <div className="course-placeholder" style={{ backgroundColor: course.color }}>
                    <FaBook className="course-icon" />
                  </div>
                </div>
                <div className="course-content">
                  <div className="course-header">
                    <h3 className="course-title">{course.title}</h3>
                    <span className="course-level">{course.subtitle}</span>
                    <span className="course-progress-text">{course.progress}%</span>
                  </div>
                  <div className="course-progress-bar">
                    <div 
                      className="course-progress-fill"
                      style={{ 
                        width: `${course.progress}%`,
                        backgroundColor: course.color
                      }}
                    ></div>
                  </div>
                  <div className="course-next">
                    <span className="next-label">Next:</span>
                    <span className="next-lesson">{course.nextLesson}</span>
                  </div>
                  <button className="continue-btn" style={{ backgroundColor: course.color }}>
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="sessions-section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Sessions</h2>
            <FaCalendar className="section-icon" />
          </div>
          <div className="sessions-list">
            {upcomingSessions.map((session) => (
              <div key={session.id} className="session-card">
                <div className="session-icon">
                  <FaPlay />
                </div>
                <div className="session-details">
                  <h4 className="session-title">{session.title}</h4>
                  <p className="session-time">{session.time}</p>
                </div>
                <div className="session-instructor">
                  <div className="instructor-avatar">{session.avatar}</div>
                  <span className="instructor-name">{session.instructor}</span>
                </div>
                <button 
                  className={`join-btn ${session.canJoin ? 'active' : 'disabled'}`}
                  disabled={!session.canJoin}
                >
                  {session.canJoin ? 'Join Class' : 'Scheduled'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
