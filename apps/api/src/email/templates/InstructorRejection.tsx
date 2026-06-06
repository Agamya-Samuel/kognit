import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface InstructorRejectionProps {
  userName: string;
  rejectionReason?: string;
  supportUrl: string;
}

export const InstructorRejection: React.FC<InstructorRejectionProps> = ({
  userName,
  rejectionReason,
  supportUrl,
}) => {
  return (
    <BaseTemplate previewText="Update on your instructor application">
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Instructor Application Update
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          Thank you for your interest in becoming an instructor on EduTech. After careful review,
          we are unable to approve your application at this time.
        </Text>
      </Section>

      {rejectionReason && (
        <Section
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '20px 24px',
            marginBottom: '24px',
          }}
        >
          <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
            Reason
          </Text>
          <Text style={{ fontSize: '15px', color: '#1e293b', margin: 0, lineHeight: '1.6' }}>
            {rejectionReason}
          </Text>
        </Section>
      )}

      <Section style={{ marginBottom: '24px' }}>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          This decision does not reflect your abilities or potential. We encourage you to strengthen
          your application and reapply in the future. If you have questions or need more clarity,
          our support team is happy to help.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', padding: '16px 0' }}>
        <Button
          href={supportUrl}
          style={{
            backgroundColor: '#4F46E5',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Contact Support
        </Button>
      </Section>
    </BaseTemplate>
  );
};

export default InstructorRejection;
