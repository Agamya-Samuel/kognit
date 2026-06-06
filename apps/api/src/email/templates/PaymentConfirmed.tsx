import { Section, Text, Hr, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface PaymentConfirmedProps {
  userName: string;
  courseName: string;
  amount: string;
  transactionId: string;
  paymentDate: string;
  invoiceUrl?: string;
}

export const PaymentConfirmed: React.FC<PaymentConfirmedProps> = ({
  userName,
  courseName,
  amount,
  transactionId,
  paymentDate,
  invoiceUrl,
}) => {
  return (
    <BaseTemplate previewText={`Payment confirmed for ${courseName}`}>
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Payment Confirmed
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          Your payment has been successfully processed. Here is your receipt:
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
          { label: 'Amount Paid', value: amount },
          { label: 'Transaction ID', value: transactionId },
          { label: 'Payment Date', value: paymentDate },
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

      {invoiceUrl && (
        <Section style={{ textAlign: 'center', padding: '16px 0' }}>
          <Button
            href={invoiceUrl}
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
            Download Invoice
          </Button>
        </Section>
      )}

      <Section style={{ padding: '8px 0 0 0' }}>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          You can now access all course materials from your dashboard.
        </Text>
      </Section>
    </BaseTemplate>
  );
};

export default PaymentConfirmed;
