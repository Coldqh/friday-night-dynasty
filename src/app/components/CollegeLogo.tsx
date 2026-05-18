import { useEffect, useMemo, useState } from 'react';

function normalizeAssetPath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}

function getFileName(path: string) {
  return normalizeAssetPath(path).split('/').pop() ?? '';
}

function getInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function getOfficialCollegeLogoPath(logoAsset: string | null | undefined) {
  if (!logoAsset) {
    return null;
  }

  const fileName = getFileName(logoAsset);

  return fileName ? `logos/college-official/${fileName}` : null;
}

export function getFallbackCollegeLogoPath(logoAsset: string | null | undefined) {
  return logoAsset ? normalizeAssetPath(logoAsset) : null;
}

export function CollegeLogo({
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
  const officialLogo = useMemo(() => getOfficialCollegeLogoPath(logoAsset), [logoAsset]);
  const fallbackLogo = useMemo(() => getFallbackCollegeLogoPath(logoAsset), [logoAsset]);
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
