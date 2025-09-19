import type { FC, PropsWithChildren } from 'react';
import { clsx } from 'clsx';
import type { ButtonProps } from './types';
import { styles } from './styles';

const Button: FC<PropsWithChildren<ButtonProps>> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={clsx(
        styles.base,
        styles.variants[variant],
        styles.sizes[size],
        disabled && styles.disabled,
        loading && styles.loading,
        className
      )}
      {...props}
    >
      {loading && (
        <div className={styles.spinner} />
      )}
      <span className={loading ? styles.loadingText : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;
