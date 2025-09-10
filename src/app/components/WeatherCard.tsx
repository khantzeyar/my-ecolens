'use client'

import React from 'react'

type WeatherDay = {
  date: string
  temp: number
  description: string
  icon: string // OpenWeather icon code, e.g. "10d"
}

interface WeatherProps {
  weather?: WeatherDay[]
}

const WeatherCard: React.FC<WeatherProps> = ({ weather = [] }) => {
  // Use default demo data if no weather is passed
  const safeWeather: WeatherDay[] =
    weather.length > 0
      ? weather
      : [
          {
            date: '2025/9/10',
            temp: 29.0,
            description: 'Light Rain',
            icon: '10d',
          },
          {
            date: '2025/9/11',
            temp: 30.9,
            description: 'Light Rain',
            icon: '10d',
          },
          {
            date: '2025/9/12',
            temp: 25.5,
            description: 'Moderate Rain',
            icon: '09d',
          },
          {
            date: '2025/9/13',
            temp: 23.4,
            description: 'Moderate Rain',
            icon: '09d',
          },
          {
            date: '2025/9/14',
            temp: 25.2,
            description: 'Overcast Clouds',
            icon: '04d',
          },
        ]

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-md">
      <h3 className="text-lg font-bold text-gray-800 mb-3">
        5-Day Weather Forecast
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {safeWeather.map((day, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center p-2 bg-white rounded-lg shadow"
          >
            <span className="text-sm font-medium">{day.date}</span>
            <img
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
              alt={day.description}
              className="w-12 h-12"
            />
            <span className="text-sm">{day.temp}°C</span>
            <span className="text-xs text-gray-500">{day.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeatherCard
