import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface InstructorInviteProps {
  userName: string;
  activationLink: string;
  invitedBy: string;
}

export const InstructorInvite: React.FC<InstructorInviteProps> = ({
  userName,
  activationLink,
  invitedBy,
}) => {
  return (
    <BaseTemplate previewText="You've been invited to join EduTech as an instructor">
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          You&apos;re Invited to Teach on EduTech
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          {invitedBy} has invited you to join EduTech as an instructor. We&apos;re excited to have
          you on board! To get started, please activate your account by clicking the button below.
        </Text>
      </Section>

      <Section
        style={{
          backgroundColor: '#eef2ff',
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
          aria-label="Graduation cap"
        >
          &#127891;
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#4F46E5', margin: 0 }}>
          Share your knowledge with thousands of students
        </Text>
      </Section>

      <Section style={{ marginBottom: '24px' }}>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Once you activate your account, you&apos;ll be able to:
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0' }}>
          &bull; Create and publish courses across multiple domains
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0' }}>
          &bull; Schedule and host live classes
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0' }}>
          &bull; Track student progress and analytics
        </Text>
        <Text style={{ fontSize: '14px', color: '#475569', margin: '0' }}>
          &bull; Manage assignments and assessments
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', padding: '16px 0' }}>
        <Button
          href={activationLink}
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
          Activate Your Account
        </Button>
      </Section>

      <Section style={{ marginTop: '24px' }}>
        <Text style={{ fontSize: '13px', color: '#64748b', margin: '0 0 8px 0' }}>
          This invitation link will expire in 30 days. If you did not expect this invitation,
          please ignore this email.
        </Text>
        <Text style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          If the button above doesn&apos;t work, copy and paste this link into your browser:{' '}
          {activationLink}
        </Text>
      </Section>
    </BaseTemplate>
  );
};

export default InstructorInvite;
