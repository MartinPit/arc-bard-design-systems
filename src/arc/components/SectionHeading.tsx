export function SectionHeading({
  number,
  eyebrow,
  title,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  children: string;
}) {
  const id = `section-${number}`;
  return (
    <header className="arc-section-heading">
      <div className="arc-section-heading__number" aria-hidden="true">{number}</div>
      <div>
        <p className="arc-eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
        <p className="arc-section-heading__intro">{children}</p>
      </div>
      <span className="arc-section-heading__rule" aria-hidden="true" />
    </header>
  );
}
