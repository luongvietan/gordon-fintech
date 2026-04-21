'use client';

import Link, { LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics';

interface Props extends LinkProps {
  children: ReactNode;
  className?: string;
  event?: AnalyticsEvent;
  params?: Record<string, unknown>;
  ariaLabel?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export default function TrackedLink({
  children,
  className,
  event,
  params,
  ariaLabel,
  onClick,
  ...props
}: Props) {
  return (
    <Link
      {...props}
      aria-label={ariaLabel}
      className={className}
      onClick={(e) => {
        if (event) {
          track(event, params);
        }
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
