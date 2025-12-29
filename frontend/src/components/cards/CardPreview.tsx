import { Link } from 'react-router-dom';
import type { PunchCard } from '../../types';

interface CardPreviewProps {
  card: PunchCard;
}

export function CardPreview({ card }: CardPreviewProps) {
  const progress = (card.currentPunches / card.totalSlots) * 100;
  const isComplete = card.currentPunches >= card.totalSlots;

  return (
    <Link
      to={`/cards/${card.id}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div
        className="h-32 p-4 flex flex-col justify-between"
        style={{ backgroundColor: card.cardStyle.backgroundColor }}
      >
        <h3
          className="text-lg font-bold truncate"
          style={{ color: card.cardStyle.textColor }}
        >
          {card.title}
        </h3>
        <div className="flex justify-between items-end">
          <span
            className="text-sm"
            style={{ color: card.cardStyle.textColor }}
          >
            {card.reward}
          </span>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: isComplete ? '#22c55e' : 'rgba(255,255,255,0.3)',
              color: isComplete ? 'white' : card.cardStyle.textColor,
            }}
          >
            {card.currentPunches}/{card.totalSlots}
          </span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {card.description && (
          <p className="mt-2 text-sm text-gray-600 truncate">
            {card.description}
          </p>
        )}
      </div>
    </Link>
  );
}
