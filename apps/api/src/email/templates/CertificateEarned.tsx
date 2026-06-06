import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface CertificateEarnedProps {
  userName: string;
  courseName: string;
  certificateUrl: string;
  completionDate: string;
}

export const CertificateEarned: React.FC<CertificateEarnedProps> = ({
  userName,
  courseName,
  certificateUrl,
  completionDate,
}) => {
  return (
    <BaseTemplate previewText={`Congratulations! You earned a certificate for ${courseName}`}>
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Congratulations! Certificate Earned
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          You have successfully completed the course and earned your certificate. We are proud of your achievement!
        </Text>
      </Section>

      <Section
        style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <Text
          style={{
            fontSize: '36px',
            margin: '0 0 8px 0',
          }}
          role="img"
          aria-label="Trophy"
        >
          &#127942;
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#0D9488', margin: '0 0 16px 0' }}>
          Certificate of Completion
        </Text>
        <Text style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
          {courseName}
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>
          Awarded to {userName}
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Completed on {completionDate}
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', padding: '16px 0' }}>
        <Button
          href={certificateUrl}
          style={{
            backgroundColor: '#4F46E5',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 600,
            padding: '14px 32px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Download Certificate
        </Button>
      </Section>

      <Section style={{ textAlign: 'center', padding: '8px 0 0 0' }}>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Share your achievement on{' '}
          <a
            href="#"
            style={{ color: '#4F46E5', textDecoration: 'underline' }}
          >
            LinkedIn
          </a>
        </Text>
      </Section>
    </BaseTemplate>
  );
};

export default CertificateEarned;
