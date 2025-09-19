import type { FC, PropsWithChildren } from 'react';
import { clsx } from 'clsx';
import type { CardProps } from './types';
import { styles } from './styles';

const Card: FC<PropsWithChildren<CardProps>> = ({
  children,
  variant = 'default',
  padding = 'medium',
  className = '',
  ...props
}) => {
  return (
    <div
      className={clsx(
        styles.base,
        styles.variants[variant],
        styles.padding[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
