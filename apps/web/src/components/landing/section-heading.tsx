type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: Props) {
  return (
    <div
      className={`max-w-2xl
        ${align === "center" && "mx-auto text-center"}
        ${className}
      `}
    >
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-primary">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
