import { forwardRef } from 'react';
import { clsx } from 'clsx';
import type { TextareaProps } from './types';
import { styles } from './styles';

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  placeholder = '',
  disabled = false,
  error = false,
  className = '',
  label,
  helperText,
  errorMessage,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
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

Textarea.displayName = 'Textarea';

export default Textarea;
