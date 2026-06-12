import React from 'react';

const StatCard = ({ icon: Icon, label, value, subtext, color = "text-blue-600" }) => {
  return (
    <div className="card-hover">
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          {Icon && <Icon className={`w-6 h-6 ${color}`} />}
        </div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtext && <p className="text-sm text-gray-400 font-medium">{subtext}</p>}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
