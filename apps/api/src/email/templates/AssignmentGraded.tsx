import { Section, Text, Button, Hr } from '@react-email/components';
import React from 'react';
import BaseTemplate from './BaseTemplate';

export interface AssignmentGradedProps {
  userName: string;
  assignmentName: string;
  courseName: string;
  grade: string;
  maxGrade: string;
  feedback?: string;
  viewUrl: string;
}

export const AssignmentGraded: React.FC<AssignmentGradedProps> = ({
  userName,
  assignmentName,
  courseName,
  grade,
  maxGrade,
  feedback,
  viewUrl,
}) => {
  return (
    <BaseTemplate previewText={`Your ${assignmentName} has been graded`}>
      <Section style={{ padding: '0 0 24px 0' }}>
        <Text
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#1e293b',
            margin: '0 0 16px 0',
          }}
        >
          Assignment Graded
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>
          Hi {userName},
        </Text>
        <Text style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 24px 0' }}>
          Your assignment has been graded. Here are the results:
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
          Assignment
        </Text>
        <Text style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 16px 0' }}>
          {assignmentName}
        </Text>
      </Section>

      <Section
        style={{
          textAlign: 'center',
          padding: '24px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          marginBottom: '24px',
        }}
      >
        <Text
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: '#0D9488',
            margin: '0 0 4px 0',
          }}
        >
          {grade}<span style={{ fontSize: '24px', color: '#64748b' }}>/{maxGrade}</span>
        </Text>
        <Text style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
          Your Score
        </Text>
      </Section>

      {feedback && (
        <>
          <Hr style={{ borderColor: '#e2e8f0', margin: '0 0 24px 0' }} />
          <Section style={{ marginBottom: '24px' }}>
            <Text
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b',
                margin: '0 0 8px 0',
              }}
            >
              Instructor Feedback
            </Text>
            <Text style={{ fontSize: '15px', color: '#475569', margin: 0, lineHeight: '1.6' }}>
              {feedback}
            </Text>
          </Section>
        </>
      )}

      <Section style={{ textAlign: 'center', padding: '16px 0' }}>
        <Button
          href={viewUrl}
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
          View Assignment Details
        </Button>
      </Section>
    </BaseTemplate>
  );
};

export default AssignmentGraded;
