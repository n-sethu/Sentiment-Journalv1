import { forwardRef } from 'react';
import { clsx } from 'clsx';
import type { InputProps } from './types';
import { styles } from './styles';

const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  placeholder = '',
  disabled = false,
  error = false,
  className = '',
  label,
  helperText,
  errorMessage,
  ...props
}, ref) => {
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={clsx(
          styles.base,
          error && styles.error,
          disabled && styles.disabled,
          className
        )}
        {...props}
      />
      {error && errorMessage && (
        <p className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}
      {!error && helperText && (
        <p className={styles.helperText}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
