import { useEffect, useState } from "react";


import "./infiniteSelector.css";

const getKeyValue = <T, >(value: T, viewKey?: keyof T): string => (viewKey ? value[viewKey] : value) as string;

export function InfiniteSelector<T>({
  initialValue,
  getPrevValue,
  getNextValue,
  viewKey,
  onChange,
}: {
  initialValue: T,
  getPrevValue: (currentValue: T) => T,
  getNextValue: (currentValue: T) => T,
  viewKey?: keyof T,
  valueKey?: keyof T,
  onChange: (value: T) => void
}) {

  const [ value, setValue ] = useState(initialValue);
  const [ valueSwitchAnimation, setValueSwitchAnimation ] = useState("");

  useEffect(() => {
    if (getKeyValue(initialValue, viewKey) == getPrevValue(value)) {
      setValueSwitchAnimation("infinite-selector-switch-to-prev")
    } else if (getKeyValue(initialValue, viewKey) == getNextValue(value)) {
      setValueSwitchAnimation("infinite-selector-switch-to-next")
    } else {
      setValue(initialValue);
    }
  }, [ initialValue ]);

  return (
    <div className={ "infinite-selector flex-row " + valueSwitchAnimation }>
      <button type="button" onClick={ () => setValueSwitchAnimation("infinite-selector-switch-to-prev") } className="btn-no-background">{ getKeyValue( getPrevValue(value), viewKey) }</button>
      <button type="button" className="btn-no-background" onAnimationEnd={() => {
        const newValue = valueSwitchAnimation == "infinite-selector-switch-to-next" ? getNextValue(value) : getPrevValue(value);
        onChange(newValue);
        setValue(newValue);
        setValueSwitchAnimation("");
      }}>{ getKeyValue(value, viewKey) }</button>
      <button type="button" onClick={ () => setValueSwitchAnimation("infinite-selector-switch-to-next") } className="btn-no-background">{ getKeyValue( getNextValue(value), viewKey) }</button>
    </div>
  )
}
