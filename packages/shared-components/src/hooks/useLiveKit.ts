'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { RoomEvent, Track } from 'livekit-client';
import type { Room, ConnectionQuality } from 'livekit-client';
import { liveClassesService } from '@edutech/api-client';
import type { LiveKitTokenResponse, LiveClassStatusResponse } from '@edutech/api-client';
export type { LiveKitTokenResponse, LiveClassStatusResponse };

export type LiveClassStatus = 'scheduled' | 'live' | 'ended';

export type ParticipantRole = 'instructor' | 'student';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export interface ParticipantInfo {
  identity: string;
  name?: string;
  connectionQuality: ConnectionQuality;
  isSpeaking: boolean;
  isMuted: boolean;
  role: ParticipantRole;
}

export interface UseLiveKitOptions {
  liveClassId: number;
  isInstructor: boolean;
  autoConnect?: boolean;
  expiresIn?: number;
}

export interface UseLiveKitReturn {
  connectionStatus: ConnectionStatus;
  error: string | null;
  token: string | null;
  livekitUrl: string | null;
  roomName: string | null;
  identity: string | null;
  liveClassStatus: LiveClassStatus | null;
  participantCount: number;
  maxParticipants: number | null;
  participants: ParticipantInfo[];
  startClass: () => Promise<void>;
  joinClass: () => Promise<void>;
  endClass: (recordingUrl?: string) => Promise<void>;
  disconnect: () => void;
  refreshStatus: () => Promise<void>;
}

export function useLiveKit({
  liveClassId,
  autoConnect = true,
  expiresIn,
}: UseLiveKitOptions): UseLiveKitReturn {
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

  const roomRef = useRef<Room | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await liveClassesService.getStatus(liveClassId);
      setLiveClassStatus(data.status);
      setRoomName(data.roomName);
      setParticipantCount(data.participantCount ?? 0);
      setMaxParticipants(data.maxParticipants ?? null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch live class status';
      setError(message);
    }
  }, [liveClassId]);

  const startClass = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      const data = await liveClassesService.startClass(liveClassId);
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
  }, [liveClassId, autoConnect]);

  const joinClass = useCallback(async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');

      const data = await liveClassesService.joinClass(liveClassId, expiresIn);
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
  }, [liveClassId, expiresIn, autoConnect]);

  const endClass = useCallback(async (recordingUrl?: string) => {
    try {
      setError(null);

      disconnectFromRoom();

      await liveClassesService.endClass(liveClassId, recordingUrl);

      setLiveClassStatus('ended');
      setConnectionStatus('disconnected');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to end class';
      setError(message);
    }
  }, [liveClassId]);

  const connectToRoom = useCallback(async (url: string, accessToken: string) => {
    try {
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

      await room.connect(url, accessToken);
      roomRef.current = room;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect to room';
      setError(message);
      setConnectionStatus('error');
    }
  }, []);

  const updateParticipants = useCallback((room: Room) => {
    const allParticipants: ParticipantInfo[] = [];

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
