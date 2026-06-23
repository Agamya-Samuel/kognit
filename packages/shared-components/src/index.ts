'use client';

// Components
export { CourseCard } from './components/CourseCard';
export type { CourseCardProps } from './components/CourseCard';

export { SearchBar } from './components/SearchBar';
export type { SearchBarProps } from './components/SearchBar';

export { default as VideoPlayer } from './components/VideoPlayer';
export type { VideoPlayerProps } from './components/VideoPlayer';

export { LiveClassRoom } from './components/LiveClassRoom';
export type { LiveClassRoomProps } from './components/LiveClassRoom';

export { ConnectionQualityIndicator } from './components/ConnectionQualityIndicator';
export type { ConnectionQualityIndicatorProps } from './components/ConnectionQualityIndicator';

export { LoginForm } from './components/LoginForm';
export type { LoginFormProps } from './components/LoginForm';

export { SignupForm } from './components/SignupForm';
export type { SignupFormProps } from './components/SignupForm';

export { AuthLayout } from './components/AuthLayout';
export type { AuthLayoutProps } from './components/AuthLayout';

export { ForgotPasswordForm } from './components/ForgotPasswordForm';
export type { ForgotPasswordFormProps } from './components/ForgotPasswordForm';

export { ResetPasswordForm } from './components/ResetPasswordForm';
export type { ResetPasswordFormProps } from './components/ResetPasswordForm';

// Dashboard Components
export {
  DashboardShell,
  AppSidebar,
  DashboardSiteHeader,
  NavSection,
  UserMenu,
  MetricCard,
  MetricCardGrid,
  ActivityList,
  QuickActions,
  StatusBadge,
  StudentDashboard,
} from './components/dashboard';

export type {
  DashboardShellProps,
  NavItem,
  NavGroup,
  FooterLink,
  ActivityItem,
  QuickAction,
  StatusVariant,
} from './components/dashboard';

// State Components
export { EmptyState } from './components/EmptyState';

export { ErrorState } from './components/ErrorState';

// Hooks
export { useAuth, AuthProvider } from './hooks/useAuth';
export type { AuthContextType, User } from './hooks/useAuth';

export { usePlaybackUrl } from './hooks/usePlaybackUrl';
export type { PlaybackUrlState, VideoStatusResponse } from './hooks/usePlaybackUrl';

export { useLiveKit } from './hooks/useLiveKit';
export type {
  UseLiveKitOptions,
  UseLiveKitReturn,
  LiveKitTokenResponse,
  LiveClassStatusResponse,
  ParticipantInfo,
  ConnectionStatus as LiveConnectionStatus,
  LiveClassStatus as LiveClassStatusType,
  ParticipantRole as LiveParticipantRole,
} from './hooks/useLiveKit';

// Store
export { authAtom, accessTokenAtom, sidebarOpenAtom, themeAtom } from './store/atoms';

// Performance Monitoring
export { WebVitalsReporter } from './components/WebVitalsReporter';
export type { WebVitalsOptions } from './components/WebVitalsReporter';
