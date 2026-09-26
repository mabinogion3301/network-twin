import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface FailureImpactState {
  failures: Failure[];
  removedConnectionIds: string[];
  stationFailures: Array<{ stationId: string; type: string; failureId: string; severity: string; status: string }>;
}

export interface Failure {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  targetName: string;
  severity: string;
  status: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  restoredAt?: string;
  restoredBy?: string;
}

export interface SimulationResult {
  simulationId: string;
  notes?: string;
  connectionNotes?: Record<string, string>;
  removedConnectionIds: string[];
  failedStationIds?: string[];
  overheatStationIds?: string[];
  stationStates?: Record<string, 'NORMAL' | 'DEGRADING' | 'IMPACTED' | 'ISOLATED'>;
  isolatedStationIds?: string[];
  degradingStationIds?: string[];
  impactedStationIds?: string[];
  coreStationIds?: string[];
  stats?: {
    total: number;
    normal: number;
    degrading: number;
    impacted: number;
    isolated: number;
  };
}

type TopologyChangedCallback = () => void;

export function useWebSocket(
  onSimulationResult: (result: SimulationResult) => void,
  onTopologyChanged?: () => void,
  onFailureUpdate?: (state: FailureImpactState) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socket = io(`${apiUrl}/events`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('simulation:result', onSimulationResult);
    if (onTopologyChanged) socket.on('topology:changed', onTopologyChanged);
    if (onFailureUpdate) socket.on('failure:update', onFailureUpdate);

    return () => { socket.disconnect(); };
  }, [onSimulationResult, onTopologyChanged, onFailureUpdate]);

  return socketRef;
}
