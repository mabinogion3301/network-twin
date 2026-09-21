import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export type StationImpactState = 'NORMAL' | 'DEGRADING' | 'IMPACTED' | 'ISOLATED';

export interface SimulationResult {
  simulationId: string;
  notes?: string;
  connectionNotes?: Record<string, string>;
  removedConnectionIds: string[];
  failedStationIds?: string[];
  stationStates?: Record<string, StationImpactState>;
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
  onTopologyChanged?: TopologyChangedCallback,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socket = io(`${apiUrl}/events`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('simulation:result', onSimulationResult);
    if (onTopologyChanged) socket.on('topology:changed', onTopologyChanged);

    return () => { socket.disconnect(); };
  }, [onSimulationResult, onTopologyChanged]);

  return socketRef;
}
