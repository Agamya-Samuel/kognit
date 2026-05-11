'use client';

import React from 'react';

const features = [
  {
    icon: '📚',
    title: 'Comprehensive Courses',
    description: 'Access thousands of expertly-crafted courses across diverse subjects and skill levels.'
  },
  {
    icon: '👥',
    title: 'Expert Instructors',
    description: 'Learn from industry professionals and experienced educators worldwide.'
  },
  {
    icon: '🎯',
    title: 'Personalized Learning',
    description: 'Get customized learning paths tailored to your goals and learning pace.'
  },
  {
    icon: '📊',
    title: 'Track Progress',
    description: 'Monitor your advancement with detailed analytics and performance insights.'
  },
  {
    icon: '🌍',
    title: 'Global Community',
    description: 'Connect with learners from around the world and collaborate on projects.'
  },
  {
    icon: '🏆',
    title: 'Earn Certificates',
    description: 'Complete courses and earn recognized certificates to boost your resume.'
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-background relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
            Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EduTech?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to learn, teach, and succeed in your educational journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-card/80 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="mb-4 text-4xl group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
