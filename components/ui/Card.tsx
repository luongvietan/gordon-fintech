import { HTMLAttributes, forwardRef } from 'react';

type Variant = 'default' | 'accent' | 'dark' | 'mint' | 'canvas';
type Radius = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  radius?: Radius;
  padded?: boolean;
}

const variants: Record<Variant, string> = {
  default: 'bg-white shadow-[var(--shadow-ring)]',
  accent:
    'bg-[color:var(--color-wise-green)] text-[color:var(--color-dark-green)]',
  dark:
    'bg-[color:var(--color-near-black)] text-white',
  mint:
    'bg-[color:var(--color-light-mint)] text-[color:var(--color-near-black)]',
  canvas:
    'bg-[color:var(--color-off-white)] shadow-[var(--shadow-ring)]',
};

const radii: Record<Radius, string> = {
  sm: 'rounded-[var(--r-card-sm)]',
  md: 'rounded-[var(--r-card)]',
  lg: 'rounded-[var(--r-card-lg)]',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      radius = 'md',
      padded = true,
      className = '',
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={`
          ${variants[variant]}
          ${radii[radius]}
          ${padded ? 'p-6 md:p-8' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
export default Card;
