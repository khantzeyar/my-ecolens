'use client'

import React from 'react'

type WeatherDay = {
  date: string
  temp: number
  description: string
  icon: string
}

interface WeatherProps {
  weather: WeatherDay[]
}

const WeatherCard: React.FC<WeatherProps> = ({ weather }) => {
  if (weather.length === 0) return null

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-3">5-Day Weather Forecast</h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {weather.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center p-2 bg-white rounded-lg shadow">
            <span className="text-sm font-medium">{day.date}</span>
            <img src={day.icon} alt={day.description} className="w-10 h-10" />
            <span className="text-sm">{day.temp}°C</span>
            <span className="text-xs text-gray-500">{day.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeatherCard
