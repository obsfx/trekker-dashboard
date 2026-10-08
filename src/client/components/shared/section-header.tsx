'use client';

interface SectionCount {
  current: number;
  total: number;
}

interface SectionHeaderProps {
  children: React.ReactNode;
  count?: SectionCount;
}

export function SectionHeader({ children, count }: SectionHeaderProps) {
  return (
    <h4 className="text-xs uppercase text-muted-foreground font-semibold mb-3">
      {children}
      {count && ` (${count.current}/${count.total})`}
    </h4>
  );
}
