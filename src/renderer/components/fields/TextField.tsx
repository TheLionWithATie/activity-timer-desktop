import { useState } from "react";
import "./fields.css";

export interface IFieldErrorMessage {
  message: string;
}


export function TextField({ value, onChange, validator, onCancel, onFocus }: {
  value?: string, 
  onChange: (value: string) => void,
  onCancel?: () => void,
  onFocus?: () => void,
  /**
   *
   * @param value - The value of the text field
   * @returns - An error message if the value is invalid or false if the value is valid
   */
  validator: (value: string) => string | undefined | false }
) {
  const [ innerValue, setInnerValue ] = useState(value);
  const [ isEditing, setIsEditing ] = useState(!value);
  const [ errorText, setErrorText ] = useState("");

  const onSubmit = () => {
    if (!errorText && innerValue != null) {
      setIsEditing(false);
      onChange(innerValue.trim());
    }
  }

  const onBlur = () => {
    setErrorText("");
    setIsEditing(false);
    setInnerValue(value);

    if (onCancel) onCancel();
  }

  return (
    <div className="field-container">
      {
        isEditing ? <input className="field-input"
            autoFocus
            type="text"
            onFocus={ onFocus }
            value={ innerValue }
            onBlur={ onBlur }
            onChange={(e: any) => {
              setInnerValue(e.target.value);
              setErrorText( (validator && validator(e.target.value)) || "" );
            }}
            onKeyDown={(e) => (e.key === "Enter" && onSubmit()) || (e.key === "Escape" && onBlur())}
          />
        : <span className="field-value" onClick={() => setIsEditing(true) }>{ value }</span>
      }
      {
          errorText ? <span className="field-error">{ errorText }</span> : null
      }
    </div>
  );
}
