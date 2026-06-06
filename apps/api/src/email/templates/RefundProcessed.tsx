import { Section, Text, Hr } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface RefundProcessedProps {
  userName: string;
  courseName: string;
  refundAmount: string;
  transactionId: string;
  refundDate: string;
  originalAmount: string;
}

export const RefundProcessed: React.FC<RefundProcessedProps> = ({
  userName,
  courseName,
  refundAmount,
  transactionId,
  refundDate,
  originalAmount,
}) => {
  return (
    <BaseTemplate previewText={`Refund processed for ${courseName}`}>
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Refund Processed
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          Your refund has been successfully processed. Here are the details:
        </Text>
      </Section>

      <Section
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <Hr style={{ borderColor: '#e2e8f0', margin: '0 0 16px 0' }} />
        {[
          { label: 'Course', value: courseName },
          { label: 'Original Amount', value: originalAmount },
          { label: 'Refund Amount', value: refundAmount },
          { label: 'Transaction ID', value: transactionId },
          { label: 'Refund Date', value: refundDate },
        ].map((row) => (
          <Section
            key={row.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 0',
            }}
          >
            <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              {row.label}
            </Text>
            <Text
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#1e293b',
                margin: 0,
                textAlign: 'right',
              }}
            >
              {row.value}
            </Text>
          </Section>
        ))}
        <Hr style={{ borderColor: '#e2e8f0', margin: '16px 0 0 0' }} />
      </Section>

      <Section style={{ padding: '8px 0' }}>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>
          The refund will reflect in your account within 5-7 business days, depending on your bank.
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          If you have any questions about this refund, please contact our support team.
        </Text>
      </Section>
    </BaseTemplate>
  );
};

export default RefundProcessed;
