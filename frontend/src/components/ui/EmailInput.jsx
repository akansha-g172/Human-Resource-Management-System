import React, { useState } from 'react';
import Input from './Input';

export default function EmailInput({ value, onChange, error, onErrorCleared, ...props }) {
  const [localError, setLocalError] = useState('');

  const handleBlur = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      setLocalError('Invalid email format (e.g. name@company.com)');
    } else {
      setLocalError('');
      if (onErrorCleared) onErrorCleared();
    }
  };

  const handleChange = (e) => {
    if (localError) {
      setLocalError('');
      if (onErrorCleared) onErrorCleared();
    }
    if (onChange) onChange(e);
  };

  return (
    <Input
      label="Email Address"
      type="email"
      placeholder="e.g. name@company.com"
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error || localError}
      {...props}
    />
  );
}
