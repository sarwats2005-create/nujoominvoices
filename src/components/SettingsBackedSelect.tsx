import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useBLPresets, PresetType } from '@/hooks/useBLPresets';

interface SettingsBackedSelectProps {
  /** The preset type to look up from bl_presets */
  presetType: PresetType;
  /** Current selected value */
  value: string;
  /** Called when value changes (from dropdown or custom input) */
  onChange: (value: string) => void;
  /** Placeholder text for the select trigger */
  placeholder?: string;
  /** Additional options to merge with presets (e.g. from unused_bl_settings) */
  extraOptions?: string[];
  /** Whether to auto-save new custom values to presets DB */
  autoSave?: boolean;
  /** Variant: 'default' has borders, 'inline' is borderless for form rows */
  variant?: 'default' | 'inline';
  /** Custom class for the wrapper */
  className?: string;
}

const SettingsBackedSelect: React.FC<SettingsBackedSelectProps> = ({
  presetType,
  value,
  onChange,
  placeholder = 'Select...',
  extraOptions = [],
  autoSave = true,
  variant = 'default',
  className,
}) => {
  const { getByType, addPreset } = useBLPresets();
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const presetOptions = getByType(presetType);
  // Merge preset + extra options, deduplicate case-insensitively
  const allOptions = React.useMemo(() => {
    const merged = new Map<string, string>();
    [...presetOptions, ...extraOptions].forEach(o => {
      if (o.trim()) merged.set(o.toUpperCase(), o.toUpperCase());
    });
    return [...merged.values()].sort();
  }, [presetOptions, extraOptions]);

  const handleCustomConfirm = () => {
    const trimmed = customValue.trim().toUpperCase();
    if (!trimmed) return;
    onChange(trimmed);
    if (autoSave && !allOptions.includes(trimmed)) {
      addPreset(presetType, trimmed);
    }
    setCustomValue('');
    setShowCustom(false);
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustomConfirm();
    }
  };

  const isInline = variant === 'inline';
  const inputClass = isInline
    ? 'border-0 shadow-none focus-visible:ring-0 h-8 uppercase'
    : 'uppercase';
  const selectTriggerClass = isInline
    ? 'border-0 shadow-none focus:ring-0 h-8'
    : '';

  if (showCustom) {
    return (
      <div className={`flex items-center gap-1 ${className || ''}`}>
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value.toUpperCase())}
          onKeyDown={handleCustomKeyDown}
          onBlur={handleCustomConfirm}
          placeholder={`Type ${placeholder.toLowerCase().replace('select ', '')}...`}
          className={inputClass}
          autoFocus
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => { setShowCustom(false); setCustomValue(''); }}
          type="button"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={`flex-1 ${selectTriggerClass}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {allOptions.map(o => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant={isInline ? 'ghost' : 'outline'}
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={() => setShowCustom(true)}
        title="Add new"
        type="button"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default SettingsBackedSelect;
