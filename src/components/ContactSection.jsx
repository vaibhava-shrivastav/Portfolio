/**
 * ==========================================================================
 * ContactSection — Minimal placeholder (full implementation in later stage)
 * ==========================================================================
 */
export function ContactSection() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <header className="section__header">
          <h2 id="contact-title" className="section__title">Contact</h2>
          <p className="section__subtitle">Get in touch for collaborations or opportunities.</p>
        </header>
        <div className="contact-placeholder">
          <p className="text-tertiary text-center py-12">Contact section component — full implementation in later stage</p>
        </div>
      </div>
    </section>
  );
}