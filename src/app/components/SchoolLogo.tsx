import { useEffect, useMemo, useState } from 'react';

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getInitials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

export function getSchoolLogoFileName(schoolName: string, mascot: string) {
  return `${slugify(`${schoolName}-${mascot}`)}.png`;
}

export function getOfficialSchoolLogoPath(schoolName: string, mascot: string) {
  return `logos/school-official/${getSchoolLogoFileName(schoolName, mascot)}`;
}

export function getFallbackSchoolLogoPath(schoolName: string, mascot: string) {
  return `logos/school/${getSchoolLogoFileName(schoolName, mascot)}`;
}

export function SchoolLogo({
  schoolName,
  mascot,
  name,
  className = 'school-logo',
  placeholderClassName = 'team-logo-placeholder'
}: {
  schoolName: string;
  mascot: string;
  name: string;
  className?: string;
  placeholderClassName?: string;
}) {
  const officialLogo = useMemo(() => getOfficialSchoolLogoPath(schoolName, mascot), [schoolName, mascot]);
  const fallbackLogo = useMemo(() => getFallbackSchoolLogoPath(schoolName, mascot), [schoolName, mascot]);
  const [src, setSrc] = useState(officialLogo);

  useEffect(() => {
    setSrc(officialLogo);
  }, [officialLogo]);

  if (!src) {
    return <span className={placeholderClassName}>{getInitials(name)}</span>;
  }

  return (
    <img
      className={className}
      src={src}
      alt=""
      onError={() => {
        if (src !== fallbackLogo) {
          setSrc(fallbackLogo);
          return;
        }

        setSrc('');
      }}
    />
  );
}
