import { useEffect, useMemo, useState } from 'react';

function normalizeAssetPath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}

function getFileName(path: string) {
  return normalizeAssetPath(path).split('/').pop() ?? '';
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

export function getOfficialNFLLogoPath(logoAsset: string | null | undefined) {
  if (!logoAsset) return null;
  const fileName = getFileName(logoAsset);
  return fileName ? `logos/nfl-official/${fileName}` : null;
}

export function getFallbackNFLLogoPath(logoAsset: string | null | undefined) {
  return logoAsset ? normalizeAssetPath(logoAsset) : null;
}

export function NFLLogo({
  logoAsset,
  name,
  className = 'team-logo',
  placeholderClassName = 'team-logo-placeholder'
}: {
  logoAsset?: string | null;
  name: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const officialLogo = useMemo(() => getOfficialNFLLogoPath(logoAsset), [logoAsset]);
  const fallbackLogo = useMemo(() => getFallbackNFLLogoPath(logoAsset), [logoAsset]);
  const [src, setSrc] = useState(officialLogo ?? fallbackLogo ?? '');

  useEffect(() => {
    setSrc(officialLogo ?? fallbackLogo ?? '');
  }, [officialLogo, fallbackLogo]);

  if (!src) {
    return <span className={placeholderClassName}>{getInitials(name)}</span>;
  }

  return (
    <img
      className={className}
      src={src}
      alt=""
      onError={() => {
        if (fallbackLogo && src !== fallbackLogo) {
          setSrc(fallbackLogo);
          return;
        }

        setSrc('');
      }}
    />
  );
}
