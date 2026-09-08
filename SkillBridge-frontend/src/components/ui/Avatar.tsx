import { cn, colorFromString, initials } from '@/lib/utils';
import { resolveAssetUrl } from '@/api/axios';
import { useState } from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  ring?: boolean;
}

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-20 w-20 text-2xl',
};

export function Avatar({ name, src, size = 'md', className, ring }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const normalizedSrc = src ? resolveAssetUrl(src) : '';
  const showImage = Boolean(normalizedSrc) && !failed;
  const color = colorFromString(name);
  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white',
        sizes[size],
        ring && 'ring-2 ring-white ring-offset-2 ring-offset-ink-100',
        className,
      )}
      style={showImage ? undefined : { backgroundColor: color }}
    >
      {showImage ? <img src={normalizedSrc} alt={name} onError={() => setFailed(true)} className="h-full w-full rounded-full object-cover" /> : initials(name)}
    </div>
  );
}
