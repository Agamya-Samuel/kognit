import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Hr,
  Font,
  Preview,
} from '@react-email/components';
import React from 'react';

export interface BaseTemplateProps {
  children: React.ReactNode;
  previewText?: string;
}

const BRAND_COLOR = '#4F46E5';
const DARK_TEXT = '#1e293b';
const MUTED_TEXT = '#64748b';
const BG_COLOR = '#f8fafc';

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  children,
  previewText,
}) => {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <Font
          fallbackFontFamily="sans-serif"
          fontFamily="System"
          fontStyle="normal"
          fontWeight={400}
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
        />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>{previewText ?? 'EduTech Notification'}</Preview>
      <Body
        style={{
          backgroundColor: BG_COLOR,
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          margin: 0,
          padding: '32px 16px',
        }}
      >
        <Container
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <Section
            style={{
              backgroundColor: BRAND_COLOR,
              padding: '20px 24px',
              textAlign: 'center',
            }}
          >
            <Text
              style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              EduTech
            </Text>
          </Section>

          <Section style={{ padding: '32px 24px' }}>{children}</Section>

          <Hr
            style={{
              borderColor: '#e2e8f0',
              margin: '0 24px',
            }}
          />

          <Section style={{ padding: '20px 24px', textAlign: 'center' }}>
            <Text
              style={{
                color: MUTED_TEXT,
                fontSize: '12px',
                margin: '0 0 8px 0',
              }}
            >
              &copy; {new Date().getFullYear()} EduTech. All rights reserved.
            </Text>
            <Text
              style={{
                color: MUTED_TEXT,
                fontSize: '12px',
                margin: 0,
              }}
            >
              <a
                href="#"
                style={{
                  color: MUTED_TEXT,
                  textDecoration: 'underline',
                }}
              >
                Unsubscribe
              </a>
              {' '}from these emails
            </Text>
          </Section>
        </Container>

        <Section style={{ padding: '24px 0 0 0', textAlign: 'center' }}>
          <Text
            style={{
              color: MUTED_TEXT,
              fontSize: '11px',
              margin: 0,
            }}
          >
            This email was sent by EduTech, 91 Springboard, Koramangala 5th Block, Bangalore, Karnataka 560095
          </Text>
        </Section>
      </Body>
    </Html>
  );
};

export default BaseTemplate;
