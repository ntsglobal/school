import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CultureExploration.css';

const CultureExploration = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [featuredContent, setFeaturedContent] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [culturalActivities, setCulturalActivities] = useState([]);

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Cultures', icon: '🌍' },
    { id: 'asian', name: 'Asian', icon: '🏮' },
    { id: 'european', name: 'European', icon: '🏰' },
    { id: 'american', name: 'American', icon: '🗽' },
    { id: 'african', name: 'African', icon: '🌍' },
    { id: 'festivals', name: 'Festivals', icon: '🎉' },
    { id: 'traditions', name: 'Traditions', icon: '🎭' }
  ];

  // Popular Cultural Experiences
  const culturalExperiences = [
    {
      id: 1,
      title: 'Japanese Tea Ceremony',
      description: 'Learn the art and philosophy behind the traditional Japanese tea ceremony',
      image: '/images/classroom.png',
      category: 'asian',
      duration: '45 min',
      difficulty: 'Beginner',
      participants: 156,
      rating: 4.8,
      culturalTips: [
        'Bow before entering the tea room',
        'Remove shoes and jewelry',
        'Sit in seiza position',
        'Appreciate the utensils'
      ]
    },
    {
      id: 2,
      title: 'German Oktoberfest',
      description: 'Discover the traditions and customs of German beer culture',
      image: '/images/classroom.png',
      category: 'european',
      duration: '60 min',
      difficulty: 'Intermediate',
      participants: 203,
      rating: 4.9,
      culturalTips: [
        'Learn traditional toasts',
        'Understand beer types',
        'Practice folk dances',
        'Try authentic foods'
      ]
    },
    {
      id: 3,
      title: 'Korean Hanbok Day',
      description: 'Experience the elegance of traditional Korean clothing and customs',
      image: '/images/classroom.png',
      category: 'asian',
      duration: '50 min',
      difficulty: 'Beginner',
      participants: 178,
      rating: 4.7,
      culturalTips: [
        'Proper way to wear hanbok',
        'Traditional greetings',
        'Color significance',
        'Seasonal variations'
      ]
    }
  ];

  // Featured content
  const featuredContents = [
    {
      id: 1,
      title: 'French Table Manners',
      subtitle: 'Dining Etiquette Essentials',
      description: 'Master the art of French dining with proper table manners, conversation etiquette, and cultural nuances that will make you feel confident in any French social setting.',
      image: '/images/classroom.png',
      videoUrl: null,
      audioUrl: null,
      category: 'european',
      keyPoints: [
        'Proper cutlery usage',
        'Bread etiquette',
        'Wine appreciation',
        'Conversation topics'
      ],
      culturalContext: 'French dining is considered an art form that emphasizes quality time with family and friends.',
      practiceActivities: [
        'Virtual dinner simulation',
        'Pronunciation practice',
        'Cultural quiz',
        'Interactive scenarios'
      ]
    }
  ];

  // Calendar events
  const mockCalendarEvents = [
    {
      id: 1,
      title: 'Cherry Blossom Festival',
      date: 'Apr 15',
      time: '10:00 AM',
      type: 'Cultural Event',
      description: 'Experience the beauty of Japanese cherry blossom season',
      participants: 45,
      isVirtual: true
    },
    {
      id: 2,
      title: 'German Conversation Club',
      date: 'Apr 22',
      time: '7:00 PM',
      type: 'Language Practice',
      description: 'Practice German in cultural context',
      participants: 23,
      isVirtual: false
    },
    {
      id: 3,
      title: 'International Dance Day',
      date: 'Apr 30',
      time: '3:00 PM',
      type: 'Cultural Celebration',
      description: 'Learn traditional dances from around the world',
      participants: 67,
      isVirtual: true
    }
  ];

  // Cultural activities
  const mockCulturalActivities = [
    {
      id: 1,
      title: 'Online Dating Etiquette',
      description: 'Cultural norms in digital romance',
      icon: '💕',
      difficulty: 'Intermediate',
      duration: '20 min',
      completed: false
    },
    {
      id: 2,
      title: 'Social Media Rules',
      description: 'Cultural differences in social platforms',
      icon: '📱',
      difficulty: 'Beginner',
      duration: '15 min',
      completed: true
    },
    {
      id: 3,
      title: 'Business Meeting Protocols',
      description: 'Professional etiquette across cultures',
      icon: '💼',
      difficulty: 'Advanced',
      duration: '30 min',
      completed: false
    },
    {
      id: 4,
      title: 'Practice Self-Introduction',
      description: 'Cultural approaches to introductions',
      icon: '👋',
      difficulty: 'Beginner',
      duration: '10 min',
      completed: true
    }
  ];

  // Learning resources
  const learningResources = [
    {
      id: 1,
      title: 'Cultural Guides',
      description: 'Comprehensive guides for each culture',
      icon: '📚',
      type: 'PDF',
      downloadUrl: '/resources/cultural-guides'
    },
    {
      id: 2,
      title: 'Gallery Lessons',
      description: 'Learn through cultural imagery',
      icon: '🎨',
      type: 'Interactive',
      downloadUrl: '/resources/gallery-lessons'
    },
    {
      id: 3,
      title: 'Live Performances',
      description: 'Watch cultural performances',
      icon: '🎭',
      type: 'Video',
      downloadUrl: '/resources/live-performances'
    },
    {
      id: 4,
      title: 'Social Etiquette',
      description: 'Master social interactions',
      icon: '🤝',
      type: 'Interactive',
      downloadUrl: '/resources/social-etiquette'
    }
  ];

  useEffect(() => {
    setFeaturedContent(featuredContents[0]);
    setCalendarEvents(mockCalendarEvents);
    setCulturalActivities(mockCulturalActivities);
  }, []);

  const filteredExperiences = culturalExperiences.filter(
    experience => selectedCategory === 'all' || experience.category === selectedCategory
  );

  const handleExperienceClick = (experience) => {
    setFeaturedContent({
      ...experience,
      keyPoints: experience.culturalTips,
      culturalContext: `Immerse yourself in the rich traditions of ${experience.title}`,
      practiceActivities: [
        'Interactive simulation',
        'Cultural quiz',
        'Virtual experience',
        'Practice scenarios'
      ]
    });
  };

  const handleActivityStart = (activity) => {
    // In real implementation, this would navigate to activity page
    alert(`Starting ${activity.title}...`);
  };

  const handleEventRegister = (event) => {
    // In real implementation, this would handle event registration
    alert(`Registering for ${event.title}...`);
  };

  const handleResourceAccess = (resource) => {
    // In real implementation, this would open or download the resource
    alert(`Accessing ${resource.title}...`);
  };

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

  return (
    <div className="culture-exploration">
      <div className="container">
        {/* Header Section */}
        <div className="culture-header">
          <h1>Cultural Immersion</h1>
          <p className="culture-subtitle">Explore Language through Culture</p>
          <p className="culture-description">
            Discover the rich tapestry of world cultures while enhancing your language skills. 
            Experience authentic traditions, customs, and social practices that bring language to life.
          </p>
        </div>

        {/* Category Navigation */}
        <div className="category-navigation">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <span className="category-icon">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="main-content">
          {/* Left Column */}
          <div className="left-column">
            {/* Popular Cultural Experiences */}
            <section className="cultural-experiences">
              <h2>Popular Cultural Experiences</h2>
              <div className="experiences-grid">
                {filteredExperiences.map(experience => (
                  <div 
                    key={experience.id} 
                    className="experience-card"
                    onClick={() => handleExperienceClick(experience)}
                  >
                    <div className="experience-image">
                      <img src={experience.image} alt={experience.title} />
                      <div className="experience-badge">{experience.difficulty}</div>
                    </div>
                    <div className="experience-content">
                      <h3>{experience.title}</h3>
                      <p>{experience.description}</p>
                      <div className="experience-meta">
                        <div className="rating">
                          {renderStars(experience.rating)}
                          <span className="rating-value">{experience.rating}</span>
                        </div>
                        <div className="participants">
                          <i className="fas fa-users"></i>
                          <span>{experience.participants}</span>
                        </div>
                      </div>
                      <div className="experience-footer">
                        <span className="duration">
                          <i className="fas fa-clock"></i>
                          {experience.duration}
                        </span>
                        <button className="btn-primary explore-btn">
                          Explore
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Content */}
            {featuredContent && (
              <section className="featured-content">
                <div className="featured-layout">
                  <div className="featured-media">
                    <img src={featuredContent.image || '/images/classroom.png'} alt={featuredContent.title} />
                    <div className="media-controls">
                      <button className="btn-play">
                        <i className="fas fa-play"></i>
                      </button>
                    </div>
                  </div>
                  <div className="featured-info">
                    <h2>{featuredContent.title}</h2>
                    <p className="featured-subtitle">{featuredContent.subtitle}</p>
                    <p className="featured-description">{featuredContent.description}</p>
                    
                    {featuredContent.keyPoints && (
                      <div className="key-points">
                        <h4>Key Learning Points:</h4>
                        <ul>
                          {featuredContent.keyPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {featuredContent.culturalContext && (
                      <div className="cultural-context">
                        <h4>Cultural Context:</h4>
                        <p>{featuredContent.culturalContext}</p>
                      </div>
                    )}

                    <div className="featured-actions">
                      <button className="btn-primary start-experience">
                        Start Experience
                      </button>
                      <button className="btn-outline bookmark">
                        <i className="fas fa-bookmark"></i>
                        Bookmark
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Cultural Calendar */}
            <section className="cultural-calendar">
              <h2>Cultural Calendar</h2>
              <div className="calendar-events">
                {calendarEvents.map(event => (
                  <div key={event.id} className="calendar-event">
                    <div className="event-date">
                      <div className="date-day">{event.date.split(' ')[1]}</div>
                      <div className="date-month">{event.date.split(' ')[0]}</div>
                    </div>
                    <div className="event-info">
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                      <div className="event-meta">
                        <span className="event-time">
                          <i className="fas fa-clock"></i>
                          {event.time}
                        </span>
                        <span className="event-type">{event.type}</span>
                        <span className="event-format">
                          <i className={`fas ${event.isVirtual ? 'fa-video' : 'fa-map-marker-alt'}`}></i>
                          {event.isVirtual ? 'Virtual' : 'In-person'}
                        </span>
                      </div>
                    </div>
                    <div className="event-action">
                      <span className="participants">{event.participants} joined</span>
                      <button 
                        className="btn-outline register-btn"
                        onClick={() => handleEventRegister(event)}
                      >
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            {/* Cultural Activities */}
            <section className="cultural-activities">
              <h3>Cultural Activities</h3>
              <div className="activities-list">
                {culturalActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">{activity.icon}</div>
                    <div className="activity-info">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <div className="activity-meta">
                        <span className="difficulty">{activity.difficulty}</span>
                        <span className="duration">{activity.duration}</span>
                      </div>
                    </div>
                    <div className="activity-action">
                      {activity.completed ? (
                        <span className="completed-badge">
                          <i className="fas fa-check"></i>
                          Completed
                        </span>
                      ) : (
                        <button 
                          className="btn-outline start-btn"
                          onClick={() => handleActivityStart(activity)}
                        >
                          Start
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Learning Resources */}
        <section className="learning-resources">
          <h2>Learning Resources</h2>
          <div className="resources-grid">
            {learningResources.map(resource => (
              <div key={resource.id} className="resource-card">
                <div className="resource-icon">{resource.icon}</div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="resource-meta">
                  <span className="resource-type">{resource.type}</span>
                </div>
                <button 
                  className="btn-outline access-btn"
                  onClick={() => handleResourceAccess(resource)}
                >
                  <i className="fas fa-external-link-alt"></i>
                  Access
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CultureExploration;
