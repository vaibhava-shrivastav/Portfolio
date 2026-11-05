/**
 * ==========================================================================
 * AwsServicesRow — AWS Cloud Infrastructure Services Shelf
 * ==========================================================================
 * Built STRICTLY from real resume facts (EduCloud AWS Stack):
 * - AWS EC2, S3, IAM, VPC, Terraform IaC
 * - Resume EduCloud AWS Stack (NO Amplify, CloudFront, Lambda, API Gateway, SES)
 * ==========================================================================
 */
import { Row } from './Row';
import { useUI, useGame } from '../context/GameContext';
import { useInView } from '../hooks/useInView';
import { useEffect, useRef } from 'react';
import { projects } from '../data/profile';

export function AwsServicesRow() {
  const { openProjectModal } = useUI();
  const { actions } = useGame();
  const [rowRef, inView] = useInView({ threshold: 0.1, triggerOnce: false });
  const awardedRef = useRef(false);

  useEffect(() => {
    if (inView && !awardedRef.current) {
      awardedRef.current = true;
      if (actions.awardAction) {
        actions.awardAction('aws_services_view', 0, 'AWS Services Shelf Viewed');
      }
    }
  }, [inView, actions]);
  const eduCloud = projects[1];

  const awsCards = [
    {
      id: 'aws-ec2',
      service: 'Amazon EC2',
      tag: 'COMPUTE',
      role: 'Virtual Server Clusters',
      desc: 'Fault-tolerant compute instances hosting isolated student container development workspaces at scale.',
      gradient: 'linear-gradient(135deg, #FF9900 0%, #232F3E 100%)'
    },
    {
      id: 'aws-s3',
      service: 'Amazon S3',
      tag: 'OBJECT STORAGE',
      role: 'Durable Artifact Store',
      desc: 'Scalable cloud object storage for student workspace files, persistence snapshots, and project data.',
      gradient: 'linear-gradient(135deg, #569A31 0%, #172B11 100%)'
    },
    {
      id: 'aws-iam',
      service: 'AWS IAM',
      tag: 'SECURITY & ACCESS',
      role: 'IAM Role-Based Access Control',
      desc: 'Designed IAM role-based access control for multitenant environments, ensuring security and resource separation.',
      gradient: 'linear-gradient(135deg, #DD344C 0%, #2B0A11 100%)'
    },
    {
      id: 'aws-vpc',
      service: 'Amazon VPC',
      tag: 'NETWORKING',
      role: 'VPC Network Isolation',
      desc: 'VPC network isolation for multitenant environments, ensuring security and resource separation across concurrent student workspaces.',
      gradient: 'linear-gradient(135deg, #8C4FFF 0%, #1A0D33 100%)'
    },
    {
      id: 'aws-terraform',
      service: 'HashiCorp Terraform',
      tag: 'INFRASTRUCTURE AS CODE',
      role: 'Declarative IaC Blueprints',
      desc: 'Modular, version-controlled IaC templates delivering 100% reproducible cloud infrastructure stacks.',
      gradient: 'linear-gradient(135deg, #844FBA 0%, #160B24 100%)'
    }
  ];

  return (
    <div id="aws-services" ref={rowRef} className="aws-services-section">
      <Row
        title="AWS Cloud Architecture · EduCloud"
        subtitle="Terraform Orchestration & Infrastructure as Code"
        badgeText="JUDGE VIEW"
        items={awsCards}
        renderItem={(item) => (
          <div
            role="button"
            tabIndex={0}
            onClick={() => eduCloud && openProjectModal(eduCloud)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (eduCloud) openProjectModal(eduCloud);
              }
            }}
            className="aws-card group"
            aria-label={`${item.service}: ${item.role}. Click to inspect EduCloud architecture`}
          >
            <div className="aws-card__media">
              <div
                className="aws-card__gradient"
                style={{ background: item.gradient }}
              />
              <div className="aws-card__scrim" />
              <div className="aws-card__badge-top-left font-mono">
                {item.tag}
              </div>
            </div>

            <div className="aws-card__body">
              <div className="aws-card__header-line">
                <h3 className="aws-card__title">
                  {item.service}
                </h3>
                <span className="aws-card__role font-mono">
                  {item.role}
                </span>
              </div>

              <p className="aws-card__desc">
                {item.desc}
              </p>

              <div className="aws-card__footer font-mono">
                <span className="aws-card__cta-text">
                  Inspect EduCloud Project
                </span>
                <span className="aws-card__cta-arrow" aria-hidden="true">➔</span>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}
