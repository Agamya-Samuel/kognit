import { Section, Text, Button } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface CourseModerationProps {
  userName: string;
  courseName: string;
  action: 'approved' | 'rejected' | 'suspended';
  reason?: string;
  dashboardUrl: string;
}

const actionConfig = {
  approved: {
    title: 'Course Approved',
    message: 'Your course has been approved and is now live on the platform. Students can now discover and enroll in your course.',
    accentColor: '#0D9488',
    bgColor: '#f0fdf4',
  },
  rejected: {
    title: 'Course Not Approved',
    message: 'After review, your course did not meet our quality guidelines. Please review the feedback below and make the necessary changes before resubmitting.',
    accentColor: '#dc2626',
    bgColor: '#fef2f2',
  },
  suspended: {
    title: 'Course Suspended',
    message: 'Your course has been temporarily suspended pending further review. Please check the reason below and contact support if you need assistance.',
    accentColor: '#d97706',
    bgColor: '#fffbeb',
  },
};

export const CourseModeration: React.FC<CourseModerationProps> = ({
  userName,
  courseName,
  action,
  reason,
  dashboardUrl,
}) => {
  const config = actionConfig[action];

  return (
    <BaseTemplate previewText={`Your course "${courseName}" has been ${action}`}>
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          {config.title}
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          {config.message}
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
          Course Name
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 16px 0' }}>
          {courseName}
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: '0 0 4px 0' }}>
          Status
        </Text>
        <Text
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: config.accentColor,
            margin: 0,
            textTransform: 'capitalize',
          }}
        >
          {action}
        </Text>
      </Section>

      {reason && (
        <Section
          style={{
            backgroundColor: config.bgColor,
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}
        >
          <Text
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: config.accentColor,
              margin: '0 0 8px 0',
            }}
          >
            Reason
          </Text>
          <Text style={{ fontSize: '15px', color: '#1e293b', margin: 0, lineHeight: '1.6' }}>
            {reason}
          </Text>
        </Section>
      )}

      <Section style={{ textAlign: 'center', padding: '16px 0' }}>
        <Button
          href={dashboardUrl}
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
          Go to Dashboard
        </Button>
      </Section>
    </BaseTemplate>
  );
};

export default CourseModeration;
