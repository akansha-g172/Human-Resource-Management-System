import React, { useState, useEffect } from 'react';
import Input from './Input';
import { Check, X } from 'lucide-react';

export default function PasswordInput({ 
  value, 
  onChange, 
  error, 
  label = "Password", 
  placeholder = "••••••••", 
  showCriteria = true, 
  ...props 
}) {
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    symbol: false,
  });

  useEffect(() => {
    setCriteria({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      symbol: /[#@%&*!]/.test(value),
    });
  }, [value]);

  const criteriaList = [
    { key: 'length', text: 'At least 8 characters' },
    { key: 'uppercase', text: 'At least one uppercase letter' },
    { key: 'number', text: 'At least one number' },
    { key: 'symbol', text: 'At least one special symbol (#@%&*!)' },
  ];

  return (
    <div className="space-y-1.5 w-full">
      <Input
        label={label}
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        error={error}
        {...props}
      />
      {showCriteria && value.length > 0 && (
        <div className="bg-neutral-50/50 p-2.5 rounded-lg border border-neutral-100 space-y-1 mt-1 animate-fade-in text-[10px] [&_svg]:inline-block">
          <p className="font-bold text-neutral-500 uppercase tracking-wide mb-1">Complexity Requirements:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
            {criteriaList.map((item) => {
              const met = criteria[item.key];
              return (
                <div 
                  key={item.key} 
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    met ? 'text-emerald-600' : 'text-neutral-400'
                  }`}
                >
                  {met ? (
                    <Check className="w-3 h-3 shrink-0 text-emerald-500" />
                  ) : (
                    <X className="w-3 h-3 shrink-0 text-neutral-300" />
                  )}
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
