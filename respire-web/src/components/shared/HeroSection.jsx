import React from 'react';

const HeroSection = ({ title, subtitle, icon: Icon }) => {
  return (
    <div className="hero-banner">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4">
          {Icon && <Icon className="w-8 h-8 text-blue-200" />}
          <div>
            <h1 className="text-white mb-2">{title}</h1>
            {subtitle && <p className="text-lg text-blue-200">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
