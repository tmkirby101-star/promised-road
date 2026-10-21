/** Approved board emblem. Assets share scripts/build-brand.py geometry. */
export default function BrandMark({ tone = 'onDark', size = 48, className, title = 'The Promised Road' }: {
  tone?: 'onDark' | 'onLight'; size?: number; className?: string; title?: string;
}) {
  return <img className={className ? `brand-symbol ${className}` : 'brand-symbol'}
    src={`/assets/brand/${tone === 'onDark' ? 'mark-gold' : 'mark'}.svg`}
    width={size} height={Math.round(size * 224 / 328)} alt={title} aria-hidden={title === '' ? true : undefined} />;
}
