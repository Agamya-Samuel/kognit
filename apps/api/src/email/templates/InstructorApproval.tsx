import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface InstructorApprovalProps {
  userName: string;
  approvalDate: string;
  dashboardUrl: string;
}

export const InstructorApproval: React.FC<InstructorApprovalProps> = ({
  userName,
  approvalDate,
  dashboardUrl,
}) => {
  return (
    <BaseTemplate previewText="Your instructor application has been approved">
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Instructor Application Approved
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          Great news! Your instructor application has been approved on {approvalDate}.
          You can now start creating and publishing courses on EduTech.
        </Text>
      </Section>

      <Section
        style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          padding: '20px 24px',
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
          aria-label="Party popper"
        >
          &#127881;
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#0D9488', margin: 0 }}>
          Welcome to the EduTech Instructor Community!
        </Text>
      </Section>

      <Section style={{ marginBottom: '24px' }}>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Your instructor dashboard is ready. From there you can:
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0' }}>
          &bull; Create and manage your courses
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0' }}>
          &bull; Schedule live classes
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0' }}>
          &bull; View student analytics
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0' }}>
          &bull; Manage assignments and grades
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', padding: '16px 0' }}>
        <Button
          href={dashboardUrl}
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
          Go to Instructor Dashboard
        </Button>
      </Section>
    </BaseTemplate>
  );
};

export default InstructorApproval;
