interface ChipGroupProps {
  name: string;
  options: string[];
  /** allow choosing more than one (checkboxes) instead of one (radios) */
  multi?: boolean;
  defaultValue?: string;
}

/**
 * Friendly pick-one / pick-a-few control. Uses native radio/checkbox inputs
 * so it submits through the form's FormData with no extra state wiring.
 */
export function ChipGroup({ name, options, multi, defaultValue }: ChipGroupProps) {
  return (
    <div className="chip-group">
      {options.map((o) => (
        <label className="chip" key={o}>
          <input
            type={multi ? 'checkbox' : 'radio'}
            name={name}
            value={o}
            defaultChecked={defaultValue === o}
          />
          <span>{o}</span>
        </label>
      ))}
    </div>
  );
}
