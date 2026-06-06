import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface LiveClassCancelledProps {
  userName: string;
  className: string;
  scheduledDate: string;
  courseName: string;
  cancellationReason?: string;
}

export const LiveClassCancelled: React.FC<LiveClassCancelledProps> = ({
  userName,
  className,
  scheduledDate,
  courseName,
  cancellationReason,
}) => {
  return (
    <BaseTemplate previewText={`${className} has been cancelled`}>
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Class Cancelled
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          We regret to inform you that the following live class has been cancelled:
        </Text>
      </Section>

      <Section
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          padding: '20px 24px',
          marginBottom: '24px',
        }}
      >
        <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>
          Course
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 16px 0' }}>
          {courseName}
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>
          Class
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 16px 0' }}>
          {className}
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>
          Scheduled Date
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0' }}>
          {scheduledDate}
        </Text>
      </Section>

      {cancellationReason && (
        <Section style={{ marginBottom: '24px' }}>
          <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>
            Reason
          </Text>
          <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0' }}>
            {cancellationReason}
          </Text>
        </Section>
      )}

      <Section style={{ marginBottom: '24px' }}>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          We apologise for the inconvenience. A rescheduled class will be communicated to you soon.
          In the meantime, you can access other course materials on the course page.
        </Text>
        <Button
          href="#"
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
          Go to Course
        </Button>
      </Section>
    </BaseTemplate>
  );
};

export default LiveClassCancelled;
