import { useState } from "react";

import "./fields.css";
import { useNavigate } from "react-router-dom";

export function SelectorButtonsField<T>({
  options,
  iconKey,
  viewKey,
  valueKey,
  initialValue,
  onChange,
}: {
  options: T[],
  viewKey?: keyof T,
  valueKey?: keyof T,
  iconKey?: keyof T,
  initialValue: T,
  onChange: (value: T) => void
}) {
  const [value, setValue] = useState( initialValue ? (
    valueKey ? initialValue[valueKey] : initialValue
  ) : initialValue );

  return (
    <div className="selector-buttons">
      {
        options.map(opt =>
          <label className="selector-button" aria-selected={ value == (valueKey ? opt[valueKey] : opt) }>
            <input type="radio" hidden checked={ value == (valueKey ? opt[valueKey] : opt) } onChange={ () => {
              setValue(opt);
              onChange(opt);
            } } />
            { iconKey ? <img src={ opt[iconKey] as string } /> : null }
            { viewKey ? opt[viewKey] : opt as any }
          </label>
        )
      }
    </div>
  )
}
