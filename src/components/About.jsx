/**
 * ==========================================================================
 * About Section
 * ==========================================================================
 */
import { profile as profileData, experience, education } from '../data/profile';
import { Row, Card, CardBody, Badge } from './Row';
import { useInView } from '../hooks/useInView';

export function About() {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <section id="about" className="section" ref={ref} aria-labelledby="about-title">
      <div className="container">
        <header className="section__header">
          <h2 id="about-title" className="section__title">About Me</h2>
          <p className="section__subtitle">Full-stack developer passionate about cloud-native applications and scalable systems.</p>
        </header>

        <Row className="section__content" align="start">
          {/* Profile Card */}
          <Card variant="glass" className={inView ? 'animate-slide-up' : ''} delay={1}>
            <CardBody>
              <h3 className="font-display text-2xl text-primary mb-4">Profile</h3>
              <p className="text-secondary mb-6 leading-relaxed">{profileData.bio}</p>

              <div className="flex flex-wrap gap-3 mb-6">
                <Badge variant="terminal">AWS Student Builder</Badge>
                <Badge variant="primary">Full Stack</Badge>
                <Badge variant="cyan">Cloud Native</Badge>
                <Badge variant="neutral">Open Source</Badge>
              </div>

              <div className="grid grid-responsive gap-4">
                <div>
                  <p className="font-mono text-xs text-tertiary text-transform-uppercase tracking-wider mb-1">Location</p>
                  <p className="text-primary">{profileData.location}</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-tertiary text-transform-uppercase tracking-wider mb-1">Timezone</p>
                  <p className="text-primary">UTC+5:30</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-tertiary text-transform-uppercase tracking-wider mb-1">Availability</p>
                  <p className="text-primary">Open to opportunities</p>
                </div>
                <div>
                  <p className="font-mono text-xs text-tertiary text-transform-uppercase tracking-wider mb-1">Pronouns</p>
                  <p className="text-primary">{profileData.pronoun}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Experience & Education */}
          <div className="flex-1 flex-col gap-6" style={{ minWidth: 0 }}>
            <Card variant="glass" className={inView ? 'animate-slide-up delay-2' : ''}>
              <CardBody>
                <h3 className="font-display text-2xl text-primary mb-6 flex items-center gap-3">
                  <span className="text-terminal">{'>'}</span> Experience
                </h3>
                {experience.map((exp, i) => (
                  <div key={exp.id} className="mb-6 last:mb-0 pb-6 last:pb-0 last:border-0 border-b border-border-subtle">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                      <div>
                        <h4 className="text-xl text-primary font-semibold">{exp.role}</h4>
                        <p className="text-tertiary">{exp.company} • {exp.location}</p>
                      </div>
                      <Badge variant={exp.featured ? 'primary' : 'neutral'}>{exp.period}</Badge>
                    </div>
                    <p className="text-secondary mb-4 leading-relaxed">{exp.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map(t => <Badge key={t} variant="neutral" className="text-xs">{t}</Badge>)}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>

            <Card variant="glass" className={inView ? 'animate-slide-up delay-3' : ''}>
              <CardBody>
                <h3 className="font-display text-2xl text-primary mb-6 flex items-center gap-3">
                  <span className="text-terminal">{'>'}</span> Education
                </h3>
                {education.map((edu, i) => (
                  <div key={edu.id} className="mb-6 last:mb-0">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                      <div>
                        <h4 className="text-xl text-primary font-semibold">{edu.degree} in {edu.field}</h4>
                        <p className="text-tertiary">{edu.institution} • {edu.location}</p>
                      </div>
                      <Badge variant="cyan">{edu.period}</Badge>
                    </div>
                    {edu.gpa && <p className="text-secondary mb-3">GPA: <span className="text-primary font-mono">{edu.gpa}</span></p>}
                    {edu.honors.length > 0 && (
                      <div className="mb-3">
                        <p className="font-mono text-xs text-tertiary text-transform-uppercase tracking-wider mb-2">Honors</p>
                        <ul className="list-disc list-inside text-secondary space-y-1">
                          {edu.honors.map(h => <li key={h}>{h}</li>)}
                        </ul>
                      </div>
                    )}
                    <div>
                      <p className="font-mono text-xs text-tertiary text-transform-uppercase tracking-wider mb-2">Relevant Coursework</p>
                      <div className="flex flex-wrap gap-2">
                        {edu.relevantCoursework.map(c => <Badge key={c} variant="neutral" className="text-xs">{c}</Badge>)}
                      </div>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </Row>
      </div>
    </section>
  );
}