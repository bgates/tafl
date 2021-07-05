import React from "react";

export const Input = ({
  name,
  placeholder,
  value,
  onChange,
}: Pick<HTMLInputElement, "name" | "placeholder" | "value"> & {
  onChange: React.ChangeEventHandler;
}) => (
  <input
    autoComplete="off"
    type="text"
    name={name}
    id={name}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
  />
);
