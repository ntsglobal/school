import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';
import courseService from '../../services/courseService';
import progressService from '../../services/progressService';
import assessmentService from '../../services/assessmentService';
import lessonService from '../../services/lessonService';
import chatService from '../../services/chatService';
import liveClassService from '../../services/liveClassService';
import './TeacherDashboard.css';
import {
  FiUsers, FiBookOpen, FiClock, FiAward, FiBarChart,
  FiCalendar, FiMessageSquare, FiSettings, FiBell,
  FiPlus, FiFilter, FiSearch, FiMoreVertical, FiEdit,
  FiTrash, FiEye, FiDownload, FiUpload, FiMail,
  FiVideo, FiPlay, FiPause, FiCheckCircle, FiXCircle,
  FiTrendingUp, FiActivity, FiTarget, FiStar, FiExternalLink
} from 'react-icons/fi';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showLiveClassModal, setShowLiveClassModal] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      activeClasses: 0,
      upcomingLessons: 0,
      newMessages: 0,
      avgClassPerformance: 0,
      completedAssignments: 0,
      pendingGrading: 0,
      activeStreaks: 0
    },
    students: [],
    schedule: [],
    recentActivities: [],
    classes: [],
    assignments: [],
    announcements: [],
    liveClasses: [],
    performance: {
      weeklyProgress: [],
      classComparison: [],
      topPerformers: []
    }
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

  const fallbackClasses = [
    {
      id: 1,
      title: 'French Advanced',
      students: 28,
      level: 'A2',
      schedule: 'Mon, Wed, Fri 9:00 AM',
      progress: 78
    },
    {
      id: 2,
      title: 'French Beginner',
      students: 35,
      level: 'A1',
      schedule: 'Tue, Thu 11:00 AM',
      progress: 65
    }
  ];

  const fallbackAssignments = [
    {
      id: 1,
      title: 'French Vocabulary Quiz',
      dueDate: '2025-08-15',
      submissions: 23,
      totalStudents: 28,
      status: 'active'
    },
    {
      id: 2,
      title: 'Pronunciation Assessment',
      dueDate: '2025-08-20',
      submissions: 12,
      totalStudents: 35,
      status: 'pending'
    }
  ];

  const fallbackAnnouncements = [
    {
      id: 1,
      title: 'School Holiday Notice',
      content: 'Classes will be suspended on August 15th for Independence Day.',
      date: '2025-08-10',
      priority: 'high'
    }
  ];

  const fallbackLiveClasses = [
    {
      id: 1,
      title: 'French Conversation Practice',
      scheduledAt: '2025-08-14T10:00:00Z',
      duration: 60,
      participants: 15,
      status: 'scheduled'
    }
  ];

  const fallbackWeeklyProgress = [
    { week: 'Week 1', progress: 65 },
    { week: 'Week 2', progress: 72 },
    { week: 'Week 3', progress: 78 },
    { week: 'Week 4', progress: 82 }
  ];

  const fallbackClassComparison = [
    { class: 'French Advanced', avgScore: 78 },
    { class: 'French Beginner', avgScore: 65 },
    { class: 'French Intermediate', avgScore: 71 }
  ];

  // Load teacher dashboard data function
  const loadDashboardData = React.useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load all teacher data in parallel
      const [
        studentsResponse,
        coursesResponse,
        progressResponse,
        assessmentsResponse,
        lessonsResponse,
        chatResponse,
        liveClassesResponse
      ] = await Promise.allSettled([
        userService.getStudentsByTeacher(user?.id),
        courseService.getTeacherCourses(),
        progressService.getTeacherProgress(),
        assessmentService.getTeacherAssessments?.() || Promise.resolve({ data: [] }),
        lessonService.getTeacherLessons?.() || Promise.resolve({ data: [] }),
        chatService.getTeacherMessages?.() || Promise.resolve({ data: [] }),
        liveClassService.getTeacherLiveClasses?.() || Promise.resolve({ data: [] })
      ]);

      // Extract data from settled promises
      const students = studentsResponse.status === 'fulfilled' ? studentsResponse.value?.data?.students || [] : [];
      const courses = coursesResponse.status === 'fulfilled' ? coursesResponse.value?.data || [] : [];
      const progress = progressResponse.status === 'fulfilled' ? progressResponse.value?.data || {} : {};
      const assessments = assessmentsResponse.status === 'fulfilled' ? assessmentsResponse.value?.data || [] : [];
      const lessons = lessonsResponse.status === 'fulfilled' ? lessonsResponse.value?.data || [] : [];
      const messages = chatResponse.status === 'fulfilled' ? chatResponse.value?.data || [] : [];
      const liveClasses = liveClassesResponse.status === 'fulfilled' ? liveClassesResponse.value?.data || [] : [];

      // Calculate comprehensive stats
      const totalStudents = students.length;
      const activeClasses = courses.length;
      const upcomingLessons = lessons.filter(lesson => new Date(lesson.scheduledAt) > new Date()).length;
      const newMessages = messages.filter(msg => !msg.read).length;
      const avgClassPerformance = students.length > 0 ? 
        students.reduce((acc, student) => acc + (student.averageScore || 0), 0) / students.length : 0;
      const completedAssignments = assessments.filter(a => a.status === 'completed').length;
      const pendingGrading = assessments.filter(a => a.status === 'submitted').length;
      const activeStreaks = students.filter(s => s.currentStreak > 0).length;

      setDashboardData({
        stats: {
          totalStudents,
          activeClasses,
          upcomingLessons,
          newMessages,
          avgClassPerformance: Math.round(avgClassPerformance),
          completedAssignments,
          pendingGrading,
          activeStreaks
        },
        students: students.map(student => ({
          ...student,
          avatar: student.firstName?.charAt(0) + student.lastName?.charAt(0) || 'NA',
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unknown Student',
          grade: student.grade || 'N/A',
          course: student.currentCourse || 'No Course',
          progress: student.overallProgress || 0,
          lastActivity: student.lastActivity || 'Never'
        })),
        schedule: lessons.filter(lesson => {
          const lessonDate = new Date(lesson.scheduledAt);
          const today = new Date();
          return lessonDate.toDateString() === today.toDateString();
        }),
        recentActivities: [
          ...progress.recentActivities || [],
          ...assessments.slice(-5).map(a => ({
            id: `assessment-${a.id}`,
            type: 'assessment',
            title: 'Assessment Submitted',
            description: `${a.title} - ${a.studentName}`,
            icon: '📝'
          })),
          ...lessons.slice(-3).map(l => ({
            id: `lesson-${l.id}`,
            type: 'lesson',
            title: 'Lesson Completed',
            description: `${l.title} - ${l.duration} minutes`,
            icon: '📚'
          }))
        ].slice(0, 10),
        classes: courses,
        assignments: assessments,
        announcements: [], // Will be loaded separately
        liveClasses,
        performance: {
          weeklyProgress: progress.weeklyProgress || [],
          classComparison: progress.classComparison || [],
          topPerformers: students.sort((a, b) => (b.overallProgress || 0) - (a.overallProgress || 0)).slice(0, 5)
        }
      });
      
    } catch (err) {
      console.error('Error loading teacher dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Set comprehensive fallback data
      setDashboardData({
        stats: {
          totalStudents: 156,
          activeClasses: 8,
          upcomingLessons: 12,
          newMessages: 24,
          avgClassPerformance: 78,
          completedAssignments: 45,
          pendingGrading: 12,
          activeStreaks: 89
        },
        students: fallbackStudents,
        schedule: fallbackSchedule,
        recentActivities: fallbackActivities,
        classes: fallbackClasses,
        assignments: fallbackAssignments,
        announcements: fallbackAnnouncements,
        liveClasses: fallbackLiveClasses,
        performance: {
          weeklyProgress: fallbackWeeklyProgress,
          classComparison: fallbackClassComparison,
          topPerformers: fallbackStudents.slice(0, 5)
        }
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load teacher dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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

  // Handler functions for enhanced functionality
  const handleCreateAssignment = async (assignmentData) => {
    try {
      await assessmentService.createAssessment(assignmentData);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
    }
  };

  const handleStartLiveClass = async (classData) => {
    try {
      // First create the live class
      const createdClass = await liveClassService.createLiveClass(classData);
      console.log('Created class response:', createdClass);
      
      // Check if response has the expected structure
      if (!createdClass || !createdClass.data || !createdClass.data.liveClass) {
        console.error('Unexpected response structure:', createdClass);
        throw new Error('Invalid response structure from server');
      }
      
      // Then start it immediately
      const startResponse = await liveClassService.startLiveClass(createdClass.data.liveClass._id);
      
      // Close the modal first
      setShowLiveClassModal(false);
      
      // Check if we got a meeting URL
      if (startResponse?.meetingUrl) {
        // Show confirmation before opening video call
        const shouldJoin = window.confirm(
          `Live class "${classData.title}" has been started!\n\nWould you like to join the video call now?`
        );
        
        if (shouldJoin) {
          // Open video call in new window/tab
          window.open(startResponse.meetingUrl, '_blank', 'width=1200,height=800');
        }
      } else {
        console.warn('No meeting URL found in response');
      }
      
      // Refresh data to show the new live class
      await loadDashboardData();
    } catch (error) {
      console.error('Error starting live class:', error);
    }
  };

  const handleJoinLiveClass = async () => {
    try {
      // Get active live classes
      const activeLiveClasses = dashboardData.liveClasses?.filter(lc => lc.status === 'live') || [];
      
      if (activeLiveClasses.length === 0) {
        alert('No active live classes to join.');
        return;
      }
      
      if (activeLiveClasses.length === 1) {
        // If only one active class, join it directly
        const liveClass = activeLiveClasses[0];
        window.open(liveClass.meetingUrl, '_blank', 'width=1200,height=800');
      } else {
        // If multiple classes, show selection
        const classNames = activeLiveClasses.map((lc, index) => 
          `${index + 1}. ${lc.title}`
        ).join('\n');
        
        const selection = prompt(
          `Multiple active live classes found:\n\n${classNames}\n\nEnter the number of the class to join:`
        );
        
        const classIndex = parseInt(selection) - 1;
        if (classIndex >= 0 && classIndex < activeLiveClasses.length) {
          const selectedClass = activeLiveClasses[classIndex];
          window.open(selectedClass.meetingUrl, '_blank', 'width=1200,height=800');
        }
      }
    } catch (error) {
      console.error('Error joining live class:', error);
    }
  };

  const handleStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleSendMessage = async (studentId, message) => {
    try {
      await chatService.sendMessage({ recipientId: studentId, content: message });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleGradeAssignment = async (assignmentId, studentId, grade) => {
    try {
      await assessmentService.gradeAssessment(assignmentId, studentId, grade);
    } catch (error) {
      console.error('Error grading assignment:', error);
    }
  };

  const filteredStudents = dashboardData.students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedClass === 'all' || student.courseId === selectedClass)
  );

  // Destructure dashboard data
  const { 
    stats, 
    students, 
    schedule, 
    recentActivities, 
    classes, 
    assignments, 
    announcements, 
    liveClasses, 
    performance 
  } = dashboardData;
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FiUsers className="text-blue-600 text-xl" />
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
              <FiBookOpen className="text-green-600 text-xl" />
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
              <FiClock className="text-yellow-600 text-xl" />
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
              <FiMessageSquare className="text-red-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">New Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newMessages}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <FiBarChart className="text-purple-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Performance</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgClassPerformance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <FiCheckCircle className="text-indigo-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <FiClock className="text-orange-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-teal-100 rounded-full">
              <FiTrendingUp className="text-teal-600 text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Streaks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStreaks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Enhanced Student Management */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Student Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Classes</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.title}</option>
                    ))}
                  </select>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <FiPlus />
                    <span>Add Student</span>
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
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStudents.map((student) => (
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
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleStudentDetails(student)}
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <FiEye />
                            </button>
                            <button 
                              onClick={() => handleSendMessage(student.id, '')}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Send Message"
                            >
                              <FiMail />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-gray-800" title="More Options">
                              <FiMoreVertical />
                            </button>
                          </div>
                        </td>
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
          {/* Enhanced Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex flex-col items-center space-y-2 p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FiPlus className="text-xl" />
                <span className="text-sm font-medium">Create Assignment</span>
              </button>
              <button 
                onClick={() => setShowLiveClassModal(true)}
                className="flex flex-col items-center space-y-2 p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <FiVideo className="text-xl" />
                <span className="text-sm font-medium">Start Live Class</span>
              </button>
              <button 
                onClick={handleJoinLiveClass}
                className="flex flex-col items-center space-y-2 p-4 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                <FiExternalLink className="text-xl" />
                <span className="text-sm font-medium">Join Live Class</span>
              </button>
              <button className="flex flex-col items-center space-y-2 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <FiCalendar className="text-xl" />
                <span className="text-sm font-medium">Schedule Lesson</span>
              </button>
              <button className="flex flex-col items-center space-y-2 p-4 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
                <FiBell className="text-xl" />
                <span className="text-sm font-medium">Send Announcement</span>
              </button>
              <button className="flex flex-col items-center space-y-2 p-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                <FiBarChart className="text-xl" />
                <span className="text-sm font-medium">View Reports</span>
              </button>
              <button className="flex flex-col items-center space-y-2 p-4 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors">
                <FiDownload className="text-xl" />
                <span className="text-sm font-medium">Export Grades</span>
              </button>
            </div>
          </div>

          {/* Assignments & Grading */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Grading</h2>
            <div className="space-y-3">
              {assignments.filter(a => a.status === 'pending').slice(0, 5).map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{assignment.title}</div>
                    <div className="text-xs text-gray-600">
                      {assignment.submissions}/{assignment.totalStudents} submitted
                    </div>
                  </div>
                  <button 
                    onClick={() => handleGradeAssignment(assignment.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                  >
                    Grade
                  </button>
                </div>
              ))}
              {assignments.filter(a => a.status === 'pending').length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  No pending assignments to grade
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
            <div className="space-y-4">
              {schedule.map((lesson) => (
                <div key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${lesson.color || 'bg-green-100 text-green-800'}`}>
                    <FiBookOpen className="text-sm" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{lesson.title}</div>
                    <div className="text-sm text-gray-600">{lesson.subtitle || `${lesson.duration || 45} minutes`}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">{lesson.time}</div>
                  <button className="p-1 text-blue-600 hover:text-blue-800">
                    <FiPlay />
                  </button>
                </div>
              ))}
              {schedule.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-4">
                  No classes scheduled for today
                </div>
              )}
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

          {/* Active Live Classes */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Live Classes</h2>
            {dashboardData.liveClasses?.filter(liveClass => liveClass.status === 'live').length > 0 ? (
              <div className="space-y-3">
                {dashboardData.liveClasses
                  .filter(liveClass => liveClass.status === 'live')
                  .map((liveClass) => (
                    <div key={liveClass.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <div>
                          <div className="font-medium text-gray-900">{liveClass.title}</div>
                          <div className="text-sm text-gray-600">
                            Started {new Date(liveClass.actualStartTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(liveClass.meetingUrl, '_blank', 'width=1200,height=800')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                      >
                        <FiVideo />
                        <span>Join Call</span>
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <FiVideo className="mx-auto text-3xl mb-2 opacity-50" />
                <p>No active live classes</p>
              </div>
            )}
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

      {/* Modal Components */}
      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create Assignment</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle />
              </button>
            </div>
            <form onSubmit={(e) => {e.preventDefault(); handleCreateAssignment({});}}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Title
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter assignment title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>Select a class</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Student Details</h3>
              <button 
                onClick={() => setShowStudentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-lg font-medium text-blue-600">
                    {selectedStudent.avatar}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{selectedStudent.name}</h4>
                    <p className="text-sm text-gray-600">{selectedStudent.course}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Grade</label>
                    <p className="text-gray-900">{selectedStudent.grade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Progress</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${selectedStudent.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{selectedStudent.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Activity</label>
                    <p className="text-gray-900">{selectedStudent.lastActivity}</p>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Quick Actions</h5>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
                    <FiMail />
                    <span>Send Message</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
                    <FiBarChart />
                    <span>View Progress</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100">
                    <FiAward />
                    <span>Assign Badge</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Class Modal */}
      {showLiveClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Start Live Class</h3>
              <button 
                onClick={() => setShowLiveClassModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiXCircle />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const classData = {
                title: formData.get('title'),
                description: formData.get('title') + ' - Live Class Session',
                language: formData.get('language'),
                level: formData.get('level'),
                scheduledAt: new Date().toISOString(), // Start immediately
                duration: parseInt(formData.get('duration')),
                maxParticipants: 15, // Default capacity
                meetingUrl: `https://meet.example.com/${Date.now()}` // Generate meeting URL
              };
              handleStartLiveClass(classData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Title
                  </label>
                  <input 
                    type="text" 
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter class title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select 
                    name="language"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="japanese">Japanese</option>
                    <option value="french">French</option>
                    <option value="german">German</option>
                    <option value="spanish">Spanish</option>
                    <option value="korean">Korean</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level
                  </label>
                  <select 
                    name="level"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A1">Beginner (A1)</option>
                    <option value="A2">Elementary (A2)</option>
                    <option value="B1">Intermediate (B1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input 
                    type="number" 
                    name="duration"
                    defaultValue={60}
                    min="15"
                    max="180"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="button"
                    onClick={() => setShowLiveClassModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Start Class
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
