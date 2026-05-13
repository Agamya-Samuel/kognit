'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { RoomEvent, Track } from 'livekit-client';
import type { Room, ConnectionQuality } from 'livekit-client';

// ─── Types ──────────────────────────────────────────────────────────────────

export type LiveClassStatus = 'scheduled' | 'live' | 'ended';

export type ParticipantRole = 'instructor' | 'student';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface LiveKitTokenResponse {
  token: string;
  identity: string;
  roomName: string;
  expiresIn: number;
  livekitUrl: string;
}

export interface LiveClassStatusResponse {
  liveClassId: number;
  status: LiveClassStatus;
  roomName: string;
  participantCount?: number;
  maxParticipants?: number;
  recordingUrl?: string;
}

export interface ParticipantInfo {
  identity: string;
  name?: string;
  connectionQuality: ConnectionQuality;
  isSpeaking: boolean;
  isMuted: boolean;
  role: ParticipantRole;
}

export interface UseLiveKitOptions {
  /** Live class ID */
  liveClassId: number;
  /** Whether the current user is an instructor */
  isInstructor: boolean;
  /** Auto-connect when token is fetched (default: true) */
  autoConnect?: boolean;
  /** Token expiry in seconds (student only, default: 3600) */
  expiresIn?: number;
}

export interface UseLiveKitReturn {
  // Connection state
  connectionStatus: ConnectionStatus;
  error: string | null;
  token: string | null;
  livekitUrl: string | null;
  roomName: string | null;
  identity: string | null;

  // Live class state
  liveClassStatus: LiveClassStatus | null;
  participantCount: number;
  maxParticipants: number | null;
  participants: ParticipantInfo[];

  // Actions
  startClass: () => Promise<void>;
  joinClass: () => Promise<void>;
  endClass: (recordingUrl?: string) => Promise<void>;
  disconnect: () => void;
  refreshStatus: () => Promise<void>;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useLiveKit({
  liveClassId,
  isInstructor: _isInstructor,
  autoConnect = true,
  expiresIn,
}: UseLiveKitOptions): UseLiveKitReturn {
  // ── State ──────────────────────────────────────────────────────────────
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [identity, setIdentity] = useState<string | null>(null);

  const [liveClassStatus, setLiveClassStatus] = useState<LiveClassStatus | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [maxParticipants, setMaxParticipants] = useState<number | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);

  // ── Refs ───────────────────────────────────────────────────────────────
  const roomRef = useRef<Room | null>(null);

  // ── Helper: get auth token ─────────────────────────────────────────────
  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }, []);

  // ── Fetch live class status ────────────────────────────────────────────
  const refreshStatus = useCallback(async () => {
    try {
      const authToken = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/api/v1/live/status/${liveClassId}`,
        {
          headers: authToken
            ? { Authorization: `Bearer ${authToken}` }
            : {},
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const data: LiveClassStatusResponse = await response.json();
      setLiveClassStatus(data.status);
      setRoomName(data.roomName);
      setParticipantCount(data.participantCount ?? 0);
      setMaxParticipants(data.maxParticipants ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch live class status';
      setError(message);
    }
  }, [liveClassId, getAuthToken]);

  // ── Start class (instructor) ───────────────────────────────────────────
  const startClass = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/live/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ liveClassId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to start class (${response.status})`,
        );
      }

      const data: LiveKitTokenResponse = await response.json();
      setToken(data.token);
      setLivekitUrl(data.livekitUrl);
      setRoomName(data.roomName);
      setIdentity(data.identity);
      setLiveClassStatus('live');

      if (autoConnect && data.livekitUrl) {
        await connectToRoom(data.livekitUrl, data.token);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start class';
      setError(message);
      setConnectionStatus('error');
    }
  }, [liveClassId, getAuthToken, autoConnect]);

  // ── Join class (student) ───────────────────────────────────────────────
  const joinClass = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      const body: { liveClassId: number; expiresIn?: number } = { liveClassId };
      if (expiresIn) {
        body.expiresIn = expiresIn;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/live/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to join class (${response.status})`,
        );
      }

      const data: LiveKitTokenResponse = await response.json();
      setToken(data.token);
      setLivekitUrl(data.livekitUrl);
      setRoomName(data.roomName);
      setIdentity(data.identity);

      if (autoConnect && data.livekitUrl) {
        await connectToRoom(data.livekitUrl, data.token);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join class';
      setError(message);
      setConnectionStatus('error');
    }
  }, [liveClassId, expiresIn, getAuthToken, autoConnect]);

  // ── End class (instructor) ─────────────────────────────────────────────
  const endClass = useCallback(async (recordingUrl?: string) => {
    try {
      setError(null);

      const authToken = getAuthToken();
      if (!authToken) {
        throw new Error('Not authenticated');
      }

      // Disconnect from room first
      disconnectFromRoom();

      const body: { liveClassId: number; recordingUrl?: string } = { liveClassId };
      if (recordingUrl) {
        body.recordingUrl = recordingUrl;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/live/end`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to end class (${response.status})`,
        );
      }

      setLiveClassStatus('ended');
      setConnectionStatus('disconnected');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end class';
      setError(message);
    }
  }, [liveClassId, getAuthToken]);

  // ── Connect to LiveKit room ────────────────────────────────────────────
  const connectToRoom = useCallback(async (url: string, accessToken: string) => {
    try {
      // Dynamic import to avoid SSR issues
      const { Room } = await import('livekit-client');

      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: {
            width: 1280,
            height: 720,
            frameRate: 30,
          },
        },
      });

      // Set up event listeners
      room.on(
        RoomEvent.ParticipantConnected,
        () => {
          updateParticipants(room);
        },
      );

      room.on(
        RoomEvent.ParticipantDisconnected,
        () => {
          updateParticipants(room);
        },
      );

      room.on(RoomEvent.Connected, () => {
        setConnectionStatus('connected');
        updateParticipants(room);
      });

      room.on(RoomEvent.Reconnecting, () => {
        setConnectionStatus('reconnecting');
      });

      room.on(RoomEvent.Reconnected, () => {
        setConnectionStatus('connected');
        updateParticipants(room);
      });

      room.on(RoomEvent.Disconnected, () => {
        setConnectionStatus('disconnected');
        setParticipants([]);
        setParticipantCount(0);
      });

      room.on(RoomEvent.ConnectionQualityChanged, () => {
        updateParticipants(room);
      });

      // Connect
      await room.connect(url, accessToken);
      roomRef.current = room;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to room';
      setError(message);
      setConnectionStatus('error');
    }
  }, []);

  // ── Update participants list ───────────────────────────────────────────
  const updateParticipants = useCallback((room: Room) => {
    const allParticipants: ParticipantInfo[] = [];

    // Local participant
    const local = room.localParticipant;
    const localMic = local.getTrackPublication(Track.Source.Microphone);
    allParticipants.push({
      identity: local.identity,
      name: local.name,
      connectionQuality: local.connectionQuality,
      isSpeaking: local.isSpeaking,
      isMuted: localMic?.isMuted ?? true,
      role: local.identity.startsWith('instructor-') ? 'instructor' : 'student',
    });

    // Remote participants
    room.remoteParticipants.forEach((participant) => {
      const remoteMic = participant.getTrackPublication(Track.Source.Microphone);
      allParticipants.push({
        identity: participant.identity,
        name: participant.name,
        connectionQuality: participant.connectionQuality,
        isSpeaking: participant.isSpeaking,
        isMuted: remoteMic?.isMuted ?? true,
        role: participant.identity.startsWith('instructor-')
          ? 'instructor'
          : 'student',
      });
    });

    setParticipants(allParticipants);
    setParticipantCount(allParticipants.length);
  }, []);

  // ── Disconnect from room ───────────────────────────────────────────────
  const disconnectFromRoom = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    setConnectionStatus('disconnected');
    setParticipants([]);
    setParticipantCount(0);
  }, []);

  const disconnect = useCallback(() => {
    disconnectFromRoom();
  }, [disconnectFromRoom]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, []);

  return {
    connectionStatus,
    error,
    token,
    livekitUrl,
    roomName,
    identity,
    liveClassStatus,
    participantCount,
    maxParticipants,
    participants,
    startClass,
    joinClass,
    endClass,
    disconnect,
    refreshStatus,
  };
}

