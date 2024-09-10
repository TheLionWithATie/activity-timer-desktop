import { useState } from "react";


export interface IFieldErrorMessage {
  message: string;
}

export function TextField({ value, onChange, validator }: { value: string, onChange: (value: string) => void, validator: (value: string) => string | undefined }) {
  const [ innerValue, setInnerValue ] = useState(value);
  const [ isEditing, setIsEditing ] = useState(false);
  const [ errorText, setErrorText ] = useState("");

  function onSubmit() {
    if (!errorText) {
      setIsEditing(false);
      onChange(innerValue.trim());
    }
  }

  return (
    isEditing ?
      (
        <div>
          <input
            autoFocus
            type="text"
            value={ innerValue }
            onBlur={() => {
              setErrorText("");
              setIsEditing(false);
              setInnerValue(value);
            }}
            onChange={(e: any) => {
              setInnerValue(e.target.value);
              setErrorText( (validator && validator(e.target.value)) || "" );
            }}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          />
          <span>{ errorText }</span>
        </div>
      ) : (
        <div>
          <span onClick={() => setIsEditing(true) }>{ value }</span>
        </div>
      )
  );
}
