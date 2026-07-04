import React, { useState, useEffect } from 'react';
import { Check, X, Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({ 
  value, 
  onChange, 
  error, 
  label = "Password", 
  placeholder = "••••••••", 
  showCriteria = true, 
  className = "",
  ...props 
}) {
  const [showPassword, setShowPassword] = useState(false);
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
    <div className={`space-y-1.5 w-full ${className}`}>
      {label && (
        <label htmlFor={props.id} className="text-xs font-semibold text-neutral-700 block">
          {label}
          {props.required && <span className="text-danger-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={props.id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full rounded-lg border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm transition-colors py-2 pl-3 pr-10 disabled:bg-neutral-50 disabled:text-neutral-400 ${
            error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : ''
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600 focus:outline-none"
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <span className="text-xs text-danger-600 font-medium leading-4 mt-0.5 block">
          {error}
        </span>
      )}
      
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
