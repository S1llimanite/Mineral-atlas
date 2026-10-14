interface StatusBadgeProps {
  status: 'verified' | 'reviewed' | 'provisional' | 'schematic' | 'draft' | 'missing';
  small?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  verified: '已审核',
  reviewed: '已复核',
  provisional: '暂定',
  schematic: '示意',
  draft: '草稿',
  missing: '缺失',
};

const STATUS_CLASSES: Record<string, string> = {
  verified: 'badge-verified',
  reviewed: 'badge-reviewed',
  provisional: 'badge-provisional',
  schematic: 'badge-schematic',
  draft: 'badge-draft',
  missing: 'badge-missing',
};

export function StatusBadge({ status, small }: StatusBadgeProps) {
  return (
    <span
      className={[
        'badge',
        STATUS_CLASSES[status] || 'badge-missing',
        small ? 'text-[9px]' : '',
      ].join(' ')}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}