import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import progressService from '../../services/progressService';
import './TeacherDashboard.css';
import {
  FiUsers, FiBookOpen, FiClock, FiAward, FiBarChart,
  FiCalendar, FiMessageSquare, FiSettings, FiBell,
  FiPlus, FiFilter, FiSearch, FiMoreVertical
} from 'react-icons/fi';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      activeClasses: 0,
      upcomingLessons: 0,
      newMessages: 0
    },
    students: [],
    schedule: [],
    recentActivities: []
  });

  // Fallback data definitions
  const fallbackStudents = [
    {
      id: 1,
      name: 'Alex Thompson',
      avatar: 'AT',
      grade: '8th',
      course: 'French Advanced',
      progress: 85,
      lastActivity: '3h ago'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      avatar: 'PS',
      grade: '7th',
      course: 'French Beginner',
      progress: 72,
      lastActivity: '4h ago'
    },
    {
      id: 3,
      name: 'Raj Patel',
      avatar: 'RP',
      grade: '6th',
      course: 'French Intermediate',
      progress: 68,
      lastActivity: '1h ago'
    },
    {
      id: 4,
      name: 'Emma Wilson',
      avatar: 'EW',
      grade: '8th',
      course: 'French Advanced',
      progress: 92,
      lastActivity: '30m ago'
    }
  ];

  const fallbackSchedule = [
    {
      id: 1,
      time: '09:00 AM',
      title: 'French Advanced',
      subtitle: '8th Grade • 45 minutes',
      color: 'bg-green-100 text-green-800',
      date: new Date().toISOString()
    },
    {
      id: 2,
      time: '11:00 AM',
      title: 'French Beginner',
      subtitle: '6th Grade • 45 minutes',
      color: 'bg-green-100 text-green-800',
      date: new Date().toISOString()
    },
    {
      id: 3,
      time: '02:00 PM',
      title: 'French Intermediate',
      subtitle: '7th Grade • 45 minutes',
      color: 'bg-green-100 text-green-800',
      date: new Date().toISOString()
    }
  ];

  const fallbackActivities = [
    {
      id: 1,
      type: 'lesson',
      title: 'Lesson Completed',
      description: 'French Beginner • 2 hours ago',
      icon: '📚'
    },
    {
      id: 2,
      type: 'student',
      title: 'New Student Enrolled',
      description: 'Emma Wilson joined French Advanced',
      icon: '👤'
    },
    {
      id: 3,
      type: 'assignment',
      title: 'Assignment Submitted',
      description: '5 new submissions received',
      icon: '📝'
    }
  ];

  // Load teacher dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load teacher's data
        const studentsResponse = await userService.getTeacherStudents();
        const coursesResponse = await courseService.getTeacherCourses();
        const progressResponse = await progressService.getTeacherProgress();
        
        setDashboardData({
          stats: {
            totalStudents: studentsResponse.length || 156,
            activeClasses: coursesResponse.length || 8,
            upcomingLessons: coursesResponse.reduce((acc, course) => acc + (course.upcomingLessons || 0), 0) || 12,
            newMessages: 24 // This would come from chat service
          },
          students: studentsResponse || [],
          schedule: coursesResponse.flatMap(course => course.schedule || []) || [],
          recentActivities: progressResponse.recentActivities || []
        });
        
      } catch (err) {
        console.error('Error loading teacher dashboard data:', err);
        setError('Failed to load dashboard data');
        // Set fallback data
        setDashboardData({
          stats: {
            totalStudents: 156,
            activeClasses: 8,
            upcomingLessons: 12,
            newMessages: 24
          },
          students: fallbackStudents,
          schedule: fallbackSchedule,
          recentActivities: fallbackActivities
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Calendar helper functions
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           selectedMonth === today.getMonth() && 
           selectedYear === today.getFullYear();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Destructure dashboard data
  const { stats, students, schedule, recentActivities } = dashboardData;
  const todaySchedule = schedule.filter(lesson => {
    const today = new Date();
    const lessonDate = new Date(lesson.date);
    return lessonDate.toDateString() === today.toDateString();
  });

  // Loading state
  if (loading) {
    return (
      <div className="teacher-dashboard min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="loading-spinner"></div>
          <p className="ml-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="teacher-dashboard min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center min-h-96">
          <div className="error-state">
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="teacher-dashboard min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Sarah'}
            </h1>
            <p className="text-gray-600 mt-1">Here's what's happening in your classes today</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <i className="fas fa-search text-lg"></i>
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <i className="fas fa-bell text-lg"></i>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                SW
              </div>
              <span className="text-sm font-medium text-gray-700">Sarah Wilson</span>
              <span className="text-xs text-gray-500">French Teacher</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <i className="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <i className="fas fa-chalkboard-teacher text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <i className="fas fa-book text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Upcoming Lessons</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <i className="fas fa-envelope text-red-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">New Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newMessages}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Student Management */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Student Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                    <i className="fas fa-filter"></i>
                    <span>Filter</span>
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
                    More
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                      <th className="pb-3 font-medium">Student</th>
                      <th className="pb-3 font-medium">Grade</th>
                      <th className="pb-3 font-medium">Course</th>
                      <th className="pb-3 font-medium">Progress</th>
                      <th className="pb-3 font-medium">Last Activity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                              {student.avatar}
                            </div>
                            <span className="font-medium text-gray-900">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">{student.grade}</td>
                        <td className="py-4 text-gray-600">{student.course}</td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{student.progress}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">{student.lastActivity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Class Performance Overview */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Class Performance Overview</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-6 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Week 1</div>
                  <div className="space-y-1">
                    <div className="w-8 h-16 bg-blue-200 rounded mx-auto"></div>
                    <div className="w-8 h-12 bg-green-200 rounded mx-auto"></div>
                    <div className="w-8 h-10 bg-yellow-200 rounded mx-auto"></div>
                    <div className="w-8 h-8 bg-red-200 rounded mx-auto"></div>
                    <div className="w-8 h-6 bg-purple-200 rounded mx-auto"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Week 2</div>
                  <div className="space-y-1">
                    <div className="w-8 h-18 bg-blue-200 rounded mx-auto"></div>
                    <div className="w-8 h-14 bg-green-200 rounded mx-auto"></div>
                    <div className="w-8 h-12 bg-yellow-200 rounded mx-auto"></div>
                    <div className="w-8 h-10 bg-red-200 rounded mx-auto"></div>
                    <div className="w-8 h-8 bg-purple-200 rounded mx-auto"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Week 3</div>
                  <div className="space-y-1">
                    <div className="w-8 h-20 bg-blue-200 rounded mx-auto"></div>
                    <div className="w-8 h-16 bg-green-200 rounded mx-auto"></div>
                    <div className="w-8 h-14 bg-yellow-200 rounded mx-auto"></div>
                    <div className="w-8 h-12 bg-red-200 rounded mx-auto"></div>
                    <div className="w-8 h-10 bg-purple-200 rounded mx-auto"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Week 4</div>
                  <div className="space-y-1">
                    <div className="w-8 h-22 bg-blue-200 rounded mx-auto"></div>
                    <div className="w-8 h-18 bg-green-200 rounded mx-auto"></div>
                    <div className="w-8 h-16 bg-yellow-200 rounded mx-auto"></div>
                    <div className="w-8 h-14 bg-red-200 rounded mx-auto"></div>
                    <div className="w-8 h-12 bg-purple-200 rounded mx-auto"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Week 5</div>
                  <div className="space-y-1">
                    <div className="w-8 h-24 bg-blue-200 rounded mx-auto"></div>
                    <div className="w-8 h-20 bg-green-200 rounded mx-auto"></div>
                    <div className="w-8 h-18 bg-yellow-200 rounded mx-auto"></div>
                    <div className="w-8 h-16 bg-red-200 rounded mx-auto"></div>
                    <div className="w-8 h-14 bg-purple-200 rounded mx-auto"></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-2">Week 6</div>
                  <div className="space-y-1">
                    <div className="w-8 h-26 bg-blue-200 rounded mx-auto"></div>
                    <div className="w-8 h-22 bg-green-200 rounded mx-auto"></div>
                    <div className="w-8 h-20 bg-yellow-200 rounded mx-auto"></div>
                    <div className="w-8 h-18 bg-red-200 rounded mx-auto"></div>
                    <div className="w-8 h-16 bg-purple-200 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <span>Advanced</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-200 rounded"></div>
                  <span>Intermediate</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-200 rounded"></div>
                  <span>Basic</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-200 rounded"></div>
                  <span>Beginner</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-200 rounded"></div>
                  <span>Revision</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <i className="fas fa-plus-circle"></i>
                <span>New Lesson</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <i className="fas fa-calendar-alt"></i>
                <span>Schedule</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <i className="fas fa-chart-line"></i>
                <span>Report</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                <i className="fas fa-bell"></i>
                <span>Announcement</span>
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
            <div className="space-y-4">
              {todaySchedule.map((lesson) => (
                <div key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${lesson.color}`}>
                    <i className="fas fa-book text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-600">{lesson.subtitle}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{lesson.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <i className="fas fa-chevron-left text-gray-600"></i>
                </button>
                <button
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <i className="fas fa-chevron-right text-gray-600"></i>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {generateCalendar().map((day, index) => (
                <div key={index} className="aspect-square flex items-center justify-center">
                  {day && (
                    <button
                      className={`w-8 h-8 rounded-full text-sm flex items-center justify-center transition-colors ${
                        isToday(day)
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Average Rating */}
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <i className="fas fa-star text-yellow-400 text-3xl"></i>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">4.8</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{activity.title}</div>
                    <div className="text-xs text-gray-600">{activity.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
