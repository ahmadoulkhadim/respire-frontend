import React from 'react';

const DetailCard = ({ icon: Icon, label, value }) => {
  return (
    <div className="card border-l-4 border-respire-500">
      <div className="p-5 flex items-start gap-3">
        {Icon && <Icon className="w-5 h-5 text-respire-600 mt-0.5" />}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-base font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default DetailCard;
