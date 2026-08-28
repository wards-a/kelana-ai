"use client";

import { Trip } from "@/app/services/tripService";
import Link from "next/link";
import { getCategoryBadgeStyle } from "@/lib/categoryStyles";
import { getCountryFlag } from "@/lib/countryFlags";
import { formatBudget } from "@/lib/formatters";

interface TripCardProps {
  trip: Trip;
  onClick?: (trip: Trip) => void;
}

export default function TripCard({ trip, onClick }: TripCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(trip);
    }
  };

  // Format date
  const formattedDate = new Date(trip.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const badgeStyle = getCategoryBadgeStyle(trip.category);

  return (
    <Link href={`/trips/${trip.id}`}>
      <div
        onClick={handleClick}
        className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
      >
        {/* Card Header with Category Badge */}
        <div
          className={`relative h-32 bg-gradient-to-r ${badgeStyle.headerGradient} flex items-center justify-center`}
        >
          <div className="absolute top-3 right-3">
            <span
              className={`inline-block px-3 py-1 ${badgeStyle.bgColor} ${badgeStyle.textColor} text-xs font-bold rounded-full`}
            >
              {trip.category}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{getCountryFlag(trip.destination)}</span>
            <h3 className="text-2xl font-bold text-white text-center px-4">
              {trip.destination}
            </h3>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3">
          {/* Travel Style */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Travel Style:</span>
            <span className="font-semibold text-gray-800 capitalize">
              {trip.travel_style}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Duration:</span>
            <span className="font-semibold text-gray-800">{trip.days} days</span>
          </div>

          {/* Budget Information */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Total Budget:</span>
              <span className="font-bold text-gray-800">
                {formatBudget(trip.budget)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Daily Budget:</span>
              <span className="font-semibold text-blue-600">
                {formatBudget(trip.daily_budget)}/day
              </span>
            </div>
          </div>

          {/* Created Date */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-200">
            Created on {formattedDate}
          </div>
        </div>

        {/* Card Footer CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 text-center">
          <span className="text-blue-600 font-semibold text-sm">
            View Itinerary →
          </span>
        </div>
      </div>
    </Link>
  );
}
