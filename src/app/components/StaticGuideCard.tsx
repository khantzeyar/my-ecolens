
/**
 * This is the static guide card component.
 * - Used to display a single environmental guide tip in a card format.
 * - Shows icon, title, description, importance, difficulty, and impact.
 * - Used in the Environmental Guide page for each tip.
 */
'use client';

interface StaticGuideCardProps {
  icon: string;
  title: string;
  description: string;
  importance: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  stats?: string;
  color: string;
}

export default function StaticGuideCard({ 
  icon, 
  title, 
  description, 
  importance, 
  difficulty, 
  stats, 
  color 
}: StaticGuideCardProps) {
  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-700',
    'Medium': 'bg-yellow-100 text-yellow-700', 
    'Hard': 'bg-red-100 text-red-700'
  };

  return (
    // Guide Card
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      {/* Top section: Main Info */}
      <div className="flex items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mr-4 bg-gradient-to-br ${color} group-hover:scale-110 transition-transform`}>
          <i className={`${icon} text-2xl text-white`}></i>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${difficultyColors[difficulty]}`}> 
              {difficulty}
            </span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-3">{description}</p>
        </div>
      </div>
      
      {/* Importance section */}
      <div className="bg-blue-50 rounded-xl p-4 mb-4">
        <div className="text-xs font-medium text-blue-700 mb-1">Why This Matters</div>
        <div className="text-sm text-blue-800 font-medium">{importance}</div>
      </div>
      
      {/* Environmental impact section */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Environmental Impact</div>
          <div className="text-sm font-semibold text-gray-700">{stats}</div>
        </div>
      )}
    </div>
  );
}
