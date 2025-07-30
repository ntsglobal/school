import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminDashboard.css';
import {
  FiHome, FiUsers, FiBookOpen, FiBarChart, FiBell, FiSettings,
  FiPlus, FiFileText, FiSend, FiTrendingUp, FiCalendar, FiClock,
  FiUser, FiBook, FiDollarSign, FiActivity
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock data - replace with actual API calls
  const dashboardStats = {
    totalStudents: 2543,
    activeTeachers: 127,
    totalCourses: 48,
    revenue: 45678
  };

  const enrollmentData = [
    { month: 'Jan', value: 70 },
    { month: 'Feb', value: 140 },
    { month: 'Mar', value: 210 },
    { month: 'Apr', value: 280 }
  ];

  const completionRates = [
    { language: 'Japanese', rate: 85, color: '#10B981' },
    { language: 'German', rate: 78, color: '#10B981' },
    { language: 'French', rate: 82, color: '#10B981' },
    { language: 'Spanish', rate: 75, color: '#10B981' }
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'John Smith',
      action: 'Completed Japanese Level 1',
      time: '2 hours ago',
      status: 'Active'
    },
    {
      id: 2,
      user: 'Sarah Wilson',
      action: 'Enrolled in German Course',
      time: '3 hours ago',
      status: 'Pending'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      action: 'Submitted Assignment',
      time: '4 hours ago',
      status: 'Active'
    },
    {
      id: 4,
      user: 'Emma Davis',
      action: 'Requested Course Transfer',
      time: '5 hours ago',
      status: 'Inactive'
    }
  ];

  const upcomingSchedule = [
    {
      id: 1,
      title: 'Japanese Beginner',
      time: '09:00 AM',
      instructor: 'Ms. Tanaka',
      type: 'class'
    },
    {
      id: 2,
      title: 'German Advanced',
      time: '10:30 AM',
      instructor: 'Mr. Schmidt',
      type: 'class'
    },
    {
      id: 3,
      title: 'French Intermediate',
      time: '01:00 PM',
      instructor: 'Madame Dubois',
      type: 'class'
    },
    {
      id: 4,
      title: 'Spanish Basics',
      time: '02:30 PM',
      instructor: 'Señor Rodriguez',
      type: 'class'
    }
  ];

  const notifications = [
    {
      id: 1,
      type: 'urgent',
      title: 'Urgent',
      message: 'Server maintenance scheduled',
      icon: '🔴'
    },
    {
      id: 2,
      type: 'important',
      title: 'Important',
      message: 'New course materials available',
      icon: '🟡'
    },
    {
      id: 3,
      type: 'normal',
      title: 'Normal',
      message: 'System update completed',
      icon: '🟢'
    }
  ];

  const quickActions = [
    { id: 1, title: 'Add New User', icon: FiPlus, color: 'bg-green-100 text-green-600' },
    { id: 2, title: 'Create Course', icon: FiBook, color: 'bg-blue-100 text-blue-600' },
    { id: 3, title: 'Send Notification', icon: FiSend, color: 'bg-yellow-100 text-yellow-600' },
    { id: 4, title: 'Generate Report', icon: FiFileText, color: 'bg-purple-100 text-purple-600' }
  ];

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NTS</span>
            </div>
            <span className="font-bold text-gray-800">NTS Green School</span>
          </div>
          
          <nav className="space-y-2">
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-green-600 bg-green-50 rounded-lg">
              <FiHome size={20} />
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FiUsers size={20} />
              <span>Users Management</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FiBookOpen size={20} />
              <span>Courses</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FiBarChart size={20} />
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FiBell size={20} />
              <span>Notifications</span>
            </a>
            <a href="#" className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <FiSettings size={20} />
              <span>Settings</span>
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, Admin</h1>
            <p className="text-gray-600 mt-1">Here's what's happening with your platform today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiBell className="w-6 h-6 text-gray-600 cursor-pointer" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <span className="font-medium text-gray-700">Admin User</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStudents.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiUsers className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeTeachers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiUser className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalCourses}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiBook className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue</p>
                <p className="text-2xl font-bold text-green-600">${dashboardStats.revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Enrollment Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Enrollment</h3>
              <div className="h-64 flex items-end justify-between space-x-4">
                {enrollmentData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-lg transition-all duration-500"
                      style={{ height: `${(item.value / 280) * 100}%` }}
                    ></div>
                    <span className="text-sm text-gray-600 mt-2">{item.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Completion Rate */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Completion Rate</h3>
              <div className="space-y-4">
                {completionRates.map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{course.language}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${course.rate}%`, 
                            backgroundColor: course.color 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{course.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {recentActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-gray-50">
                        <td className="py-3 text-sm font-medium text-gray-900">{activity.user}</td>
                        <td className="py-3 text-sm text-gray-600">{activity.action}</td>
                        <td className="py-3 text-sm text-gray-500">{activity.time}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            activity.status === 'Active' ? 'bg-green-100 text-green-800' :
                            activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Schedule & Notifications */}
          <div className="space-y-6">
            {/* Upcoming Schedule */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Schedule</h3>
              <div className="space-y-3">
                {upcomingSchedule.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600">{item.time}</p>
                      <p className="text-xs text-gray-500">{item.instructor}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Notifications */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Notifications</h3>
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-lg">{notification.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    className={`p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 text-center ${action.color}`}
                  >
                    <action.icon className="w-6 h-6 mx-auto mb-2" />
                    <span className="text-xs font-medium">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
