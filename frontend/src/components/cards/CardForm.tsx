import { useState } from 'react';
import type { CreatePunchCardRequest, CardStyle, PunchShape } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface CardFormProps {
  initialData?: Partial<CreatePunchCardRequest>;
  onSubmit: (data: CreatePunchCardRequest) => void;
  loading?: boolean;
  submitLabel?: string;
}

const PUNCH_SHAPES: { value: PunchShape; label: string }[] = [
  { value: 'CIRCLE', label: 'Circle' },
  { value: 'STAR', label: 'Star' },
  { value: 'HEART', label: 'Heart' },
];

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export function CardForm({
  initialData,
  onSubmit,
  loading,
  submitLabel = 'Create Card',
}: CardFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [totalSlots, setTotalSlots] = useState(initialData?.totalSlots || 10);
  const [reward, setReward] = useState(initialData?.reward || '');
  const [cardStyle, setCardStyle] = useState<Partial<CardStyle>>({
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    punchShape: 'CIRCLE',
    ...initialData?.cardStyle,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description: description || undefined,
      totalSlots,
      reward,
      cardStyle,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Card Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Coffee Loyalty Card"
        required
        maxLength={100}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Earn a free coffee after 10 purchases"
          rows={3}
          maxLength={500}
        />
      </div>

      <Input
        label="Reward"
        value={reward}
        onChange={(e) => setReward(e.target.value)}
        placeholder="Free Coffee"
        required
        maxLength={255}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Total Punches Needed
        </label>
        <input
          type="range"
          min={1}
          max={20}
          value={totalSlots}
          onChange={(e) => setTotalSlots(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center text-lg font-semibold text-gray-900">
          {totalSlots}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Color
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                cardStyle.backgroundColor === color
                  ? 'border-gray-900 scale-110'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
              onClick={() =>
                setCardStyle((prev) => ({
                  ...prev,
                  backgroundColor: color,
                  textColor: '#FFFFFF',
                }))
              }
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Punch Shape
        </label>
        <div className="flex gap-2">
          {PUNCH_SHAPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`px-4 py-2 rounded-lg border transition-colors ${
                cardStyle.punchShape === value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() =>
                setCardStyle((prev) => ({ ...prev, punchShape: value }))
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
