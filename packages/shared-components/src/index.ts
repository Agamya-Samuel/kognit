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

// Dashboard Components
export {
  DashboardShell,
  DashboardSidebar,
  DashboardHeader,
  MobileSidebar,
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
  ActivityItem,
  QuickAction,
  StatusVariant,
} from './components/dashboard';

// State Components
export { EmptyState } from './components/EmptyState';

export { ErrorState } from './components/ErrorState';

// Hooks
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
