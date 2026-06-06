import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface PasswordResetProps {
  userName: string;
  resetUrl: string;
  expiryMinutes: number;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({
  userName,
  resetUrl,
  expiryMinutes,
}) => {
  return (
    <BaseTemplate previewText="Reset your EduTech password">
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Reset Your Password
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          We received a request to reset your password. Click the button below to choose a new one:
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', padding: '16px 0 24px 0' }}>
        <Button
          href={resetUrl}
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
          Reset Password
        </Button>
      </Section>

      <Section
        style={{
          backgroundColor: '#fefce8',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '16px',
        }}
      >
        <Text style={{ fontSize: '14px', color: '#854d0e', margin: 0 }}>
          This link will expire in {expiryMinutes} minutes. If you did not request a password reset,
          please ignore this email or contact support if you have concerns.
        </Text>
      </Section>

      <Section style={{ padding: '8px 0' }}>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          For security reasons, do not share this link with anyone.
        </Text>
      </Section>
    </BaseTemplate>
  );
};

export default PasswordReset;
