// src/components/MatchCard.tsx

import React from 'react';

// Define the shape of a single trip's data
export interface Trip {
  id: string;
  type: string;
  details: string;
  bufferTime: number;
  status: string;
  // We can add more fields like author name later
}

interface MatchCardProps {
  trip: Trip;
}

const MatchCard: React.FC<MatchCardProps> = ({ trip }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-4 flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{trip.type}</p>
        <h3 className="text-lg font-bold">{trip.details}</h3>
        <p className="text-sm text-gray-600">Can wait for: {trip.bufferTime} minutes</p>
      </div>
      <button className="bg-green-500 text-white font-bold py-2 px-4 rounded hover:bg-green-600">
        Accept
      </button>
    </div>
  );
};

export default MatchCard;