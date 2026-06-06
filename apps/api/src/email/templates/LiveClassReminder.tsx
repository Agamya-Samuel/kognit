import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface LiveClassReminderProps {
  userName: string;
  className: string;
  scheduledDate: string;
  scheduledTime: string;
  courseName: string;
  joinUrl: string;
  timeLabel: string;
}

export const LiveClassReminder: React.FC<LiveClassReminderProps> = ({
  userName,
  className,
  scheduledDate,
  scheduledTime,
  courseName,
  joinUrl,
  timeLabel,
}) => {
  return (
    <BaseTemplate previewText={`Reminder: ${className} starts ${timeLabel}`}>
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Live Class Reminder
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          This is a reminder that your live class is starting soon. Here are the details:
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
          Date &amp; Time
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0' }}>
          {scheduledDate} at {scheduledTime} ({timeLabel})
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', padding: '16px 0' }}>
        <Button
          href={joinUrl}
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
          Join Live Class
        </Button>
      </Section>
    </BaseTemplate>
  );
};

export default LiveClassReminder;
