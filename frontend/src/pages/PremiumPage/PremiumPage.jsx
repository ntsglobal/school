import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PremiumPage.css';

const PremiumPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);

  // Pricing plans
  const pricingPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      annualPrice: 0,
      currency: '₹',
      period: 'month',
      description: 'Perfect for getting started',
      popular: false,
      features: [
        'Access to basic lessons',
        'Limited vocabulary exercises',
        'Basic pronunciation practice',
        'Community forum access',
        'Mobile app access',
        'Progress tracking (basic)'
      ],
      limitations: [
        'Limited to 5 lessons per month',
        'No offline access',
        'No live classes',
        'No AI tutoring',
        'No certificates'
      ],
      ctaText: 'Get Started Free',
      ctaAction: 'signup'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 999,
      annualPrice: 9990,
      currency: '₹',
      period: 'month',
      description: 'Most popular choice for serious learners',
      popular: true,
      badge: 'MOST POPULAR',
      features: [
        'Unlimited access to all lessons',
        'Advanced vocabulary builder',
        'AI-powered pronunciation coaching',
        'Live classes with native speakers',
        'Personalized learning path',
        'Offline lesson downloads',
        'Progress analytics & insights',
        'Priority community support',
        'Cultural immersion content',
        'Speaking practice sessions',
        'Grammar correction AI',
        'Achievement certificates'
      ],
      limitations: [],
      ctaText: 'Start Premium',
      ctaAction: 'subscribe'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      annualPrice: 'Custom',
      currency: '',
      period: '',
      description: 'Tailored solutions for organizations',
      popular: false,
      features: [
        'Everything in Premium',
        'Custom learning paths',
        'Team management dashboard',
        'Advanced analytics & reporting',
        'API integrations',
        'Dedicated account manager',
        'Custom branding options',
        'Bulk user management',
        'SSO integration',
        'Priority technical support',
        'Custom content creation',
        'Training workshops'
      ],
      limitations: [],
      ctaText: 'Contact Sales',
      ctaAction: 'contact'
    }
  ];

  // Feature comparison data
  const comparisonFeatures = [
    { feature: 'Access to lessons', free: '5/month', premium: 'Unlimited', enterprise: 'Unlimited' },
    { feature: 'Vocabulary exercises', free: 'Basic', premium: 'Advanced', enterprise: 'Advanced + Custom' },
    { feature: 'Live classes', free: false, premium: true, enterprise: true },
    { feature: 'AI tutoring', free: false, premium: true, enterprise: true },
    { feature: 'Offline access', free: false, premium: true, enterprise: true },
    { feature: 'Progress analytics', free: 'Basic', premium: 'Advanced', enterprise: 'Enterprise-grade' },
    { feature: 'Mobile app', free: true, premium: true, enterprise: true },
    { feature: 'Community support', free: true, premium: 'Priority', enterprise: 'Dedicated' },
    { feature: 'Certificates', free: false, premium: true, enterprise: true },
    { feature: 'Custom content', free: false, premium: false, enterprise: true },
    { feature: 'Team management', free: false, premium: false, enterprise: true },
    { feature: 'API access', free: false, premium: false, enterprise: true }
  ];

  // Student testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: '/images/users/student1.jpg',
      rating: 5,
      text: 'NTS Green School transformed my language learning experience. The AI tutoring is incredibly helpful!',
      course: 'Japanese for Beginners',
      timeframe: '3 months ago'
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: '/images/users/student2.jpg',
      rating: 5,
      text: 'The live classes with native speakers are amazing. I can now confidently speak French!',
      course: 'Advanced French',
      timeframe: '2 months ago'
    },
    {
      id: 3,
      name: 'Priya Sharma',
      avatar: '/images/users/student3.jpg',
      rating: 5,
      text: 'Best investment I made for my career. The German course helped me land my dream job.',
      course: 'Business German',
      timeframe: '1 month ago'
    },
    {
      id: 4,
      name: 'David Kim',
      avatar: '/images/users/student4.jpg',
      rating: 5,
      text: 'The cultural immersion content makes learning so much more engaging and fun.',
      course: 'Korean Culture & Language',
      timeframe: '2 weeks ago'
    }
  ];

  // FAQ data
  const faqs = [
    {
      id: 1,
      question: 'How long do I have access to courses?',
      answer: 'With Premium subscription, you have unlimited access to all courses as long as your subscription is active. Free users get access to basic content indefinitely.'
    },
    {
      id: 2,
      question: 'Can I switch between plans?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      id: 3,
      question: 'Is there a money-back guarantee?',
      answer: 'We offer a 30-day money-back guarantee for Premium subscriptions. If you\'re not satisfied, contact our support team for a full refund.'
    },
    {
      id: 4,
      question: 'Do you offer student discounts?',
      answer: 'Yes! We offer 50% discount for verified students. Contact our support team with your student ID for verification.'
    },
    {
      id: 5,
      question: 'Can I use the platform offline?',
      answer: 'Premium subscribers can download lessons for offline access through our mobile app. This feature is not available for free users.'
    },
    {
      id: 6,
      question: 'How do live classes work?',
      answer: 'Live classes are conducted via video conference with certified native speakers. Premium users can book up to 4 sessions per month.'
    }
  ];

  const handlePlanSelection = (planId, action) => {
    setSelectedPlan(planId);
    
    switch (action) {
      case 'signup':
        navigate('/signup');
        break;
      case 'subscribe':
        // In real implementation, this would integrate with payment processor
        handleSubscription(planId);
        break;
      case 'contact':
        navigate('/contact');
        break;
      default:
        break;
    }
  };

  const handleSubscription = (planId) => {
    // In real implementation, this would integrate with Stripe/Razorpay
    alert(`Redirecting to payment for ${planId} plan...`);
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const renderFeatureValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? (
        <i className="fas fa-check text-green-500"></i>
      ) : (
        <i className="fas fa-times text-red-500"></i>
      );
    }
    return <span>{value}</span>;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`star ${i < rating ? 'filled' : 'empty'}`}>★</span>
    ));
  };

  const calculateAnnualSavings = (monthlyPrice) => {
    const annualPrice = monthlyPrice * 10; // 2 months free
    const savings = (monthlyPrice * 12) - annualPrice;
    return savings;
  };

  return (
    <div className="premium-page">
      <div className="container">
        {/* Header Section */}
        <div className="pricing-header">
          <h1>Choose Your Learning Journey</h1>
          <p className="pricing-subtitle">
            Select the perfect plan to accelerate your language learning goals
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="billing-toggle">
            <span className={`toggle-label ${!isAnnual ? 'active' : ''}`}>Monthly</span>
            <button 
              className={`toggle-switch ${isAnnual ? 'annual' : 'monthly'}`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <div className="toggle-slider"></div>
            </button>
            <span className={`toggle-label ${isAnnual ? 'active' : ''}`}>
              Annual <span className="savings-badge">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="pricing-plans">
          {pricingPlans.map(plan => (
            <div 
              key={plan.id} 
              className={`pricing-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
            >
              {plan.badge && (
                <div className="plan-badge">{plan.badge}</div>
              )}
              
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  {plan.price !== 'Custom' ? (
                    <>
                      <span className="currency">{plan.currency}</span>
                      <span className="amount">
                        {isAnnual && plan.annualPrice !== 'Custom' 
                          ? Math.floor(plan.annualPrice / 12)
                          : plan.price
                        }
                      </span>
                      <span className="period">/{plan.period}</span>
                      {isAnnual && plan.id === 'premium' && (
                        <div className="annual-savings">
                          Save ₹{calculateAnnualSavings(plan.price)} annually
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="custom-price">Custom</span>
                  )}
                </div>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="plan-features">
                <ul>
                  {plan.features.map((feature, index) => (
                    <li key={index}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {plan.limitations.length > 0 && (
                  <div className="plan-limitations">
                    <h4>Limitations:</h4>
                    <ul>
                      {plan.limitations.map((limitation, index) => (
                        <li key={index}>
                          <i className="fas fa-times"></i>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button 
                className={`plan-cta ${plan.popular ? 'primary' : 'outline'}`}
                onClick={() => handlePlanSelection(plan.id, plan.ctaAction)}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="feature-comparison">
          <h2>Compare Plans</h2>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Features</th>
                  <th>Free</th>
                  <th>Premium</th>
                  <th>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index}>
                    <td className="feature-name">{item.feature}</td>
                    <td className="feature-value">{renderFeatureValue(item.free)}</td>
                    <td className="feature-value premium">{renderFeatureValue(item.premium)}</td>
                    <td className="feature-value">{renderFeatureValue(item.enterprise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Social Proof */}
        <div className="social-proof">
          <h2>Trusted by 10,000+ Students</h2>
          <div className="testimonials">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-header">
                  <img 
                    src={testimonial.avatar || '/images/users/default-avatar.png'} 
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-info">
                    <h4>{testimonial.name}</h4>
                    <p className="course-taken">{testimonial.course}</p>
                    <div className="rating">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <span className="testimonial-time">{testimonial.timeframe}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button 
                  className={`faq-question ${expandedFAQ === faq.id ? 'expanded' : ''}`}
                  onClick={() => toggleFAQ(faq.id)}
                >
                  <span>{faq.question}</span>
                  <i className={`fas fa-chevron-${expandedFAQ === faq.id ? 'up' : 'down'}`}></i>
                </button>
                <div className={`faq-answer ${expandedFAQ === faq.id ? 'expanded' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="bottom-cta">
          <div className="cta-content">
            <h2>Start Your Language Learning Journey Today</h2>
            <p>Join thousands of successful language learners and unlock your potential</p>
            <div className="cta-buttons">
              <button 
                className="btn-primary large"
                onClick={() => handlePlanSelection('premium', 'subscribe')}
              >
                Start Premium Trial
              </button>
              <button 
                className="btn-outline large"
                onClick={() => handlePlanSelection('free', 'signup')}
              >
                Try Free Version
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
