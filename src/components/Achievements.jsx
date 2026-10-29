/**
 * ==========================================================================
 * Achievements Section
 * ==========================================================================
 */
import { achievements } from '../data/profile';
import { Card, CardBody, Badge, Row } from './Row';
import { useInView } from '../hooks/useInView';

export function Achievements() {
  const [ref, inView] = useInView({ triggerOnce: true });
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  const rarityColors = {
    common: 'var(--color-border-default)',
    rare: 'var(--color-info)',
    epic: 'var(--color-primary)',
    legendary: 'var(--color-warning)',
    mythic: 'var(--color-terminal)'
  };

  return (
    <section id="achievements" className="section" ref={ref} aria-labelledby="achievements-title">
      <div className="container">
        <header className="section__header">
          <h2 id="achievements-title" className="section__title">Achievements</h2>
          <p className="section__subtitle">{unlocked.length} of {achievements.length} unlocked</p>
        </header>

        {/* Progress Bar */}
        <Card variant="terminal" className={inView ? 'animate-slide-up' : ''} style={{ maxWidth: '600px', marginBottom: 'var(--space-12)' }}>
          <CardBody>
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-sm text-terminal">Overall Progress</span>
              <span className="font-mono text-sm text-primary">{Math.round((unlocked.length / achievements.length) * 100)}%</span>
            </div>
            <div className="skill-bar" style={{ height: '8px' }}>
              <div
                className="skill-bar__fill"
                style={{ width: `${(unlocked.length / achievements.length) * 100}%`, background: 'var(--gradient-terminal)' }}
              ></div>
            </div>
            <div className="flex justify-between mt-3 text-xs text-tertiary">
              <span>{unlocked.length} unlocked</span>
              <span>{achievements.reduce((sum, a) => sum + (a.unlocked ? a.xpReward : 0), 0).toLocaleString()} XP earned</span>
            </div>
          </CardBody>
        </Card>

        {/* Unlocked Achievements */}
        <div className="mb-12">
          <h3 className="font-display text-2xl text-terminal mb-6 flex items-center gap-3">
            <span>{'>'} </span> Unlocked ({unlocked.length})
          </h3>
          <Row className="achievements-grid">
            {unlocked.map((achievement, index) => (
              <Card
                key={achievement.id}
                variant="glass"
                className={`achievement-card achievement-card--${achievement.rarity} ${inView ? 'animate-slide-up' : ''}`}
                style={{ animationDelay: `${(index + 1) * 50}ms` }}
              >
                <CardBody>
                  <div className="achievement-card__icon" style={{ borderColor: rarityColors[achievement.rarity] }} aria-hidden="true">
                    {achievement.icon}
                  </div>
                  <h4 className="achievement-card__title">{achievement.title}</h4>
                  <p className="achievement-card__description">{achievement.description}</p>
                  <div className="achievement-card__meta">
                    <span className="achievement-card__rarity badge badge--neutral">{achievement.rarity}</span>
                    <span className="achievement-card__xp font-mono">+{achievement.xpReward} XP</span>
                  </div>
                  {achievement.unlockedAt && (
                    <p className="font-mono text-xs text-tertiary mt-3">Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}</p>
                  )}
                </CardBody>
              </Card>
            ))}
          </Row>
        </div>

        {/* Locked Achievements */}
        {locked.length > 0 && (
          <div>
            <h3 className="font-display text-2xl text-tertiary mb-6 flex items-center gap-3">
              <span className="text-muted">{'>'} </span> Locked ({locked.length})
            </h3>
            <Row className="achievements-grid">
              {locked.map((achievement, index) => (
                <Card
                  key={achievement.id}
                  variant="glass"
                  className={`achievement-card achievement-card--locked achievement-card--${achievement.rarity} ${inView ? 'animate-slide-up' : ''}`}
                  style={{ animationDelay: `${(index + 1) * 50}ms` }}
                >
                  <CardBody>
                    <div className="achievement-card__icon" aria-hidden="true">🔒</div>
                    <h4 className="achievement-card__title">{achievement.secret ? '???' : achievement.title}</h4>
                    <p className="achievement-card__description">{achievement.secret ? 'Hidden achievement' : achievement.description}</p>
                    <div className="achievement-card__meta">
                      <span className="achievement-card__rarity badge badge--neutral">{achievement.rarity}</span>
                      <span className="achievement-card__xp font-mono">+{achievement.xpReward} XP</span>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Row>
          </div>
        )}
      </div>
    </section>
  );
}