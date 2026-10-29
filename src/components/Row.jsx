/**
 * ==========================================================================
 * Row — Flexible grid row wrapper
 * ==========================================================================
 */
export function Row({ children, className = '', align = 'stretch', justify = 'start', ...props }) {
  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between'
  };

  return (
    <div
      className={`row ${alignClasses[align]} ${justifyClasses[justify]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * ==========================================================================
 * Card — Base card component with variants
 * ==========================================================================
 */
export function Card({
  children,
  className = '',
  variant = 'default',
  hover = true,
  ...props
}) {
  const variants = {
    default: 'card',
    glass: 'card card--glass',
    terminal: 'card card--terminal'
  };

  return (
    <article className={`${variants[variant]} ${hover ? '' : 'card--no-hover'} ${className}`} {...props}>
      {children}
    </article>
  );
}

export function CardMedia({ children, ...props }) {
  return <div className="card__media" {...props}>{children}</div>;
}

export function CardBody({ children, ...props }) {
  return <div className="card__body" {...props}>{children}</div>;
}

export function CardFooter({ children, ...props }) {
  return <div className="card__footer" {...props}>{children}</div>;
}

/**
 * ==========================================================================
 * Badge — Status/label badge
 * ==========================================================================
 */
export function Badge({ children, variant = 'neutral', className = '', ...props }) {
  const variants = {
    primary: 'badge badge--primary',
    terminal: 'badge badge--terminal',
    cyan: 'badge badge--cyan',
    neutral: 'badge badge--neutral',
    success: 'badge badge--success',
    warning: 'badge badge--warning'
  };

  return (
    <span className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}