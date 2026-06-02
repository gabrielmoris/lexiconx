interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggler({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative cursor-pointer inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
          ${checked ? 'bg-secondary focus-visible:outline-secondary' : 'bg-theme-fg-dark focus-visible:outline-theme-fg-dark'}`}
      >
        <span className="sr-only">{label ?? 'Toggle'}</span>
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200
            ${checked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </label>
  );
}
