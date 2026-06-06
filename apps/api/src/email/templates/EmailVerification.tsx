import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
  expiryMinutes: number;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({
  userName,
  verificationUrl,
  expiryMinutes,
}) => {
  return (
    <BaseTemplate previewText="Verify your email address">
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Verify Your Email
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          Welcome to EduTech! Please verify your email address to get started:
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', padding: '16px 0 24px 0' }}>
        <Button
          href={verificationUrl}
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
          Verify Email Address
        </Button>
      </Section>

      <Section
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '16px',
        }}
      >
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          This verification link will expire in {expiryMinutes} minutes.
          If the button above does not work, copy and paste the following URL into your browser:
        </Text>
      </Section>

      <Section style={{ padding: '0 0 16px 0' }}>
        <Text
          style={{
            fontSize: '13px',
            color: '#4F46E5',
            wordBreak: 'break-all',
            margin: 0,
          }}
        >
          {verificationUrl}
        </Text>
      </Section>

      <Section style={{ padding: '8px 0' }}>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          If you did not create an account with EduTech, please ignore this email.
        </Text>
      </Section>
    </BaseTemplate>
  );
};

export default EmailVerification;
