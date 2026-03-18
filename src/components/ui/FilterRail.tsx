import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterSectionProps {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiSelect?: boolean;
}

function FilterSection({
  title,
  options,
  selected,
  onChange,
  multiSelect = true,
}: FilterSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const handleToggle = (id: string) => {
    if (multiSelect) {
      if (selected.includes(id)) {
        onChange(selected.filter((s) => s !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange(selected.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {expanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {expanded && (
        <div className="mt-2 space-y-1">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900"
            >
              <input
                type={multiSelect ? 'checkbox' : 'radio'}
                checked={selected.includes(option.id)}
                onChange={() => handleToggle(option.id)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterRailProps {
  sections: {
    id: string;
    title: string;
    options: FilterOption[];
    multiSelect?: boolean;
  }[];
  values: Record<string, string[]>;
  onChange: (sectionId: string, selected: string[]) => void;
  onClearAll?: () => void;
}

export function FilterRail({ sections, values, onChange, onClearAll }: FilterRailProps) {
  const totalSelected = Object.values(values).flat().length;

  return (
    <div className="w-56 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {totalSelected > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {totalSelected > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {Object.entries(values).map(([sectionId, selectedIds]) =>
            selectedIds.map((id) => {
              const section = sections.find((s) => s.id === sectionId);
              const option = section?.options.find((o) => o.id === id);
              return (
                <span
                  key={`${sectionId}-${id}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full"
                >
                  {option?.label || id}
                  <button
                    onClick={() =>
                      onChange(
                        sectionId,
                        selectedIds.filter((s) => s !== id)
                      )
                    }
                    className="hover:text-primary-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })
          )}
        </div>
      )}

      {sections.map((section) => (
        <FilterSection
          key={section.id}
          title={section.title}
          options={section.options}
          selected={values[section.id] || []}
          onChange={(selected) => onChange(section.id, selected)}
          multiSelect={section.multiSelect}
        />
      ))}
    </div>
  );
}
