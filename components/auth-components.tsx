'use client';

import React, { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export function InputField({
  label,
  error,
  icon,
  helperText,
  type = 'text',
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <div className="relative">
        {icon && <div className="absolute left-3 top-3 text-muted-foreground">{icon}</div>}
        <input
          type={inputType}
          className={`w-full px-4 py-3 ${icon ? 'pl-10' : ''} border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
            error ? 'border-destructive focus:ring-destructive' : 'border-input focus:ring-primary focus:ring-offset-background'
          }`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      {helperText && !error && <p className="text-sm text-muted-foreground mt-1">{helperText}</p>}
    </div>
  );
}

interface PasswordStrengthMeterProps {
  strength: 'weak' | 'fair' | 'strong';
  score: number;
}

export function PasswordStrengthMeter({ strength, score }: PasswordStrengthMeterProps) {
  const colors = {
    weak: 'bg-destructive',
    fair: 'bg-amber-500',
    strong: 'bg-secondary',
  };

  const labels = {
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
  };

  const percentage = (score / 6) * 100;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">Password strength</span>
        <span className={`text-xs font-semibold ${strength === 'weak' ? 'text-destructive' : strength === 'fair' ? 'text-amber-600' : 'text-secondary'}`}>
          {labels[strength]}
        </span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[strength]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary focus:ring-offset-background',
    secondary:
      'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary focus:ring-offset-background',
    outline: 'border border-input bg-background text-foreground hover:bg-muted focus:ring-primary',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-card text-card-foreground rounded-lg border border-border shadow-sm p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
