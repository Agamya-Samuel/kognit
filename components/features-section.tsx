'use client';

import React from 'react';

const features = [
  {
    icon: '🎓',
    title: 'Interactive Live Classes',
    description: 'Join real-time sessions with expert instructors and fellow learners for engaging discussions.'
  },
  {
    icon: '🎯',
    title: 'Personalized Learning Paths',
    description: 'Get customized courses tailored to your proficiency level and learning objectives.'
  },
  {
    icon: '📝',
    title: 'Assignment Feedback',
    description: 'Receive detailed feedback on assignments from certified instructors to accelerate your progress.'
  },
  {
    icon: '🏆',
    title: 'Flexible Schedule',
    description: 'Learn at your own pace with recorded sessions available anytime, anywhere.'
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    description: 'Monitor your advancement with comprehensive analytics and performance reports.'
  },
  {
    icon: '🌟',
    title: 'Certification Programs',
    description: 'Earn industry-recognized certificates upon course completion to boost your career.'
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Why Choose <span className="text-primary">EduTech?</span>
          </h2>
          <p className="text-base sm:text-lg text-foreground/70 max-w-2xl mx-auto text-balance">
            Everything you need to master English and achieve fluency with confidence and support.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 sm:p-8 rounded-2xl border border-border hover:border-primary/50 bg-white hover:bg-primary/5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="mb-4 text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-foreground/70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20">
          <p className="text-foreground/70 mb-6 text-balance">Ready to start your learning journey?</p>
          <a
            href="/auth/register"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-full font-bold transition-all transform hover:scale-105"
          >
            Enroll Now
          </a>
        </div>
      </div>
    </section>
  );
}
