import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CoursesPage.css';
import courseService from '../../services/courseService';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [featuredCourse, setFeaturedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [email, setEmail] = useState('');

  // Mock data for demonstration
  const mockFeaturedCourse = {
    id: 1,
    title: "Advanced English Communication",
    description: "Master English communication skills with our advanced course designed for intermediate and advanced learners. Perfect for improving speaking and writing skills.",
    instructor: {
      name: "Sarah Johnson",
      avatar: "/images/users/instructor1.jpg",
      rating: 4.9
    },
    image: "/images/classroom.png",
    rating: 4.8,
    studentsCount: 1250,
    duration: "12 weeks",
    level: "Advanced",
    price: 149,
    lessons: 48,
    category: "advanced"
  };

  const mockCourses = [
    {
      id: 2,
      title: "English for Beginners",
      description: "Start your English learning journey with our comprehensive beginner course.",
      instructor: "John Smith",
      image: "/images/classroom.png",
      rating: 4.7,
      studentsCount: 890,
      duration: "8 weeks",
      level: "Beginner",
      price: 99,
      lessons: 24,
      category: "general"
    },
    {
      id: 3,
      title: "Elementary English",
      description: "Build on your basic English skills with our elementary level course.",
      instructor: "Maria Garcia",
      image: "/images/classroom.png",
      rating: 4.6,
      studentsCount: 756,
      duration: "10 weeks",
      level: "Elementary",
      price: 119,
      lessons: 32,
      category: "elementary"
    },
    {
      id: 4,
      title: "Intermediate English",
      description: "Take your English to the next level with our intermediate course.",
      instructor: "David Lee",
      image: "/images/classroom.png",
      rating: 4.8,
      studentsCount: 623,
      duration: "12 weeks",
      level: "Intermediate",
      price: 139,
      lessons: 40,
      category: "intermediate"
    },
    {
      id: 5,
      title: "Business English",
      description: "Professional English skills for the workplace and business communication.",
      instructor: "Emma Wilson",
      image: "/images/classroom.png",
      rating: 4.9,
      studentsCount: 445,
      duration: "14 weeks",
      level: "Advanced",
      price: 199,
      lessons: 56,
      category: "advanced"
    },
    {
      id: 6,
      title: "English Grammar Fundamentals",
      description: "Master English grammar with our comprehensive fundamentals course.",
      instructor: "Robert Brown",
      image: "/images/classroom.png",
      rating: 4.5,
      studentsCount: 1150,
      duration: "6 weeks",
      level: "Elementary",
      price: 79,
      lessons: 18,
      category: "elementary"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Courses', icon: '📚' },
    { id: 'general', name: 'General Courses', icon: '🎯' },
    { id: 'elementary', name: 'Elementary Courses', icon: '📖' },
    { id: 'intermediate', name: 'Intermediate Courses', icon: '📈' },
    { id: 'advanced', name: 'Advanced Courses', icon: '🎓' }
  ];

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      // In real implementation, this would fetch from API
      setFeaturedCourse(mockFeaturedCourse);
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
      // Use mock data as fallback
      setFeaturedCourse(mockFeaturedCourse);
      setCourses(mockCourses);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  };

  const handleEnrollment = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      alert('Thank you for subscribing to our newsletter!');
      setEmail('');
    }
  };

  if (loading) {
    return (
      <div className="courses-loading">
        <div className="loading-spinner"></div>
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="courses-page">
      {/* Featured Course Section */}
      {featuredCourse && (
        <section className="featured-course-section">
          <div className="container">
            <div className="featured-course">
              <div className="course-image">
                <img src={featuredCourse.image} alt={featuredCourse.title} />
                <div className="course-badge">BEST PICK</div>
              </div>
              <div className="course-details">
                <h1 className="course-title">{featuredCourse.title}</h1>
                <p className="course-description">{featuredCourse.description}</p>
                
                <div className="course-meta">
                  <div className="instructor-info">
                    <img src={featuredCourse.instructor.avatar || '/images/users/default-avatar.png'} 
                         alt={featuredCourse.instructor.name} className="instructor-avatar" />
                    <span className="instructor-name">{featuredCourse.instructor.name}</span>
                  </div>
                  
                  <div className="course-stats">
                    <div className="rating">
                      {renderStars(featuredCourse.rating)}
                      <span className="rating-value">{featuredCourse.rating}</span>
                    </div>
                    <div className="students-count">
                      <i className="fas fa-users"></i>
                      <span>{featuredCourse.studentsCount.toLocaleString()} students</span>
                    </div>
                    <div className="duration">
                      <i className="fas fa-clock"></i>
                      <span>{featuredCourse.duration}</span>
                    </div>
                  </div>
                </div>

                <div className="course-actions">
                  <button 
                    className="btn-primary start-learning"
                    onClick={() => handleEnrollment(featuredCourse.id)}
                  >
                    Start Learning
                  </button>
                  <div className="price">
                    <span className="price-value">${featuredCourse.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Available Courses Section */}
      <section className="available-courses-section">
        <div className="container">
          <div className="section-header">
            <h2>Available Courses</h2>
            <div className="courses-controls">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="courses-grid">
            {filteredCourses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-image">
                  <img src={course.image} alt={course.title} />
                  <div className="course-level">{course.level}</div>
                </div>
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-description">{course.description}</p>
                  
                  <div className="course-instructor">
                    <span>by {course.instructor}</span>
                  </div>
                  
                  <div className="course-stats">
                    <div className="rating">
                      {renderStars(course.rating)}
                      <span className="rating-value">{course.rating}</span>
                    </div>
                    <div className="students">
                      <i className="fas fa-users"></i>
                      <span>{course.studentsCount} students</span>
                    </div>
                  </div>
                  
                  <div className="course-footer">
                    <div className="price">
                      <span className="price-value">${course.price}</span>
                    </div>
                    <button 
                      className="btn-outline view-course"
                      onClick={() => handleEnrollment(course.id)}
                    >
                      View Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Categories Section */}
      <section className="course-categories-section">
        <div className="container">
          <h2>Course Categories</h2>
          <div className="categories-grid">
            {categories.slice(1).map(category => (
              <div 
                key={category.id} 
                className="category-card"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="category-icon">{category.icon}</div>
                <h3 className="category-name">{category.name}</h3>
                <p className="category-description">
                  {category.id === 'general' && 'Perfect for those starting their English learning journey'}
                  {category.id === 'elementary' && 'Build strong foundations in English language skills'}
                  {category.id === 'intermediate' && 'Advance your English communication abilities'}
                  {category.id === 'advanced' && 'Master advanced English for professional success'}
                </p>
                <div className="category-count">
                  {courses.filter(course => course.category === category.id).length} courses
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay Updated with New Courses</h2>
            <p>Subscribe to our newsletter and get notified about new courses, special offers, and learning tips.</p>
            
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary">
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;
