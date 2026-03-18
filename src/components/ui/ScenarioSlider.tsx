import { useState, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import type { ScenarioLever } from '../../types';

interface ScenarioSliderProps {
  lever: ScenarioLever;
  onChange: (value: number) => void;
  onReset?: () => void;
}

export function ScenarioSlider({ lever, onChange, onReset }: ScenarioSliderProps) {
  const [localValue, setLocalValue] = useState(lever.value);

  const handleChange = useCallback(
    (value: number) => {
      setLocalValue(value);
      onChange(value);
    },
    [onChange]
  );

  const formatValue = (value: number) => {
    if (lever.unit === '%') {
      return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
    } else if (lever.unit === '$') {
      return `$${value.toFixed(0)}`;
    } else {
      return value.toFixed(2);
    }
  };

  const isModified = localValue !== lever.min && localValue !== (lever.type === 'fill' ? lever.max : 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{lever.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Range: {formatValue(lever.min)} to {formatValue(lever.max)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-semibold ${
              localValue > 0 ? 'text-green-600' : localValue < 0 ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {formatValue(localValue)}
          </span>
          {isModified && onReset && (
            <button
              onClick={onReset}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Reset to default"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={lever.min}
          max={lever.max}
          step={lever.step}
          value={localValue}
          onChange={(e) => handleChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, 
              ${localValue < 0 ? '#ef4444' : '#10b981'} 0%, 
              ${localValue < 0 ? '#ef4444' : '#10b981'} ${((localValue - lever.min) / (lever.max - lever.min)) * 100}%, 
              #e5e7eb ${((localValue - lever.min) / (lever.max - lever.min)) * 100}%, 
              #e5e7eb 100%)`,
          }}
        />
        
        {lever.min < 0 && lever.max > 0 && (
          <div
            className="absolute top-1/2 w-0.5 h-4 bg-gray-400 -translate-y-1/2"
            style={{
              left: `${((0 - lever.min) / (lever.max - lever.min)) * 100}%`,
            }}
          />
        )}
      </div>

      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-400">{formatValue(lever.min)}</span>
        <span className="text-xs text-gray-400">{formatValue(lever.max)}</span>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: white;
          border: 2px solid #3b82f6;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

interface ScenarioBuilderProps {
  levers: ScenarioLever[];
  onLeverChange: (id: string, value: number) => void;
  onResetAll?: () => void;
}

export function ScenarioBuilder({ levers, onLeverChange, onResetAll }: ScenarioBuilderProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Scenario Levers</h3>
        {onResetAll && (
          <button
            onClick={onResetAll}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <RotateCcw size={12} />
            Reset all
          </button>
        )}
      </div>
      
      {levers.map((lever) => (
        <ScenarioSlider
          key={lever.id}
          lever={lever}
          onChange={(value) => onLeverChange(lever.id, value)}
          onReset={() => {
            const defaultValue = lever.type === 'fill' ? 85 : lever.type === 'sports' ? 1 : 0;
            onLeverChange(lever.id, defaultValue);
          }}
        />
      ))}
    </div>
  );
}
