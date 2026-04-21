interface Props {
  source: string;
  title?: string;
  compact?: boolean;
}

export default function DataSourceBadge({
  source,
  title,
  compact = false,
}: Props) {
  return (
    <span
      title={title ?? `Source: ${source}`}
      className={`
        inline-flex items-center rounded-[var(--r-pill)] font-bold
        bg-[color:var(--color-light-mint)] text-[color:var(--color-dark-green)]
        ring-1 ring-inset ring-[color:var(--color-wise-green)]/30
        ${compact
          ? 'px-2 py-0.5 text-[10px] uppercase tracking-[0.08em]'
          : 'px-2.5 py-1 text-[10.5px] uppercase tracking-[0.10em]'}
      `}
    >
      via {source}
    </span>
  );
}
