import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SimulationResult {
  simulationId: string;
  removedConnectionIds: string[];
  removedEquipmentIds: string[];
  unavailableStationPairs: Array<{
    linkId: string;
    stationAId: string;
    stationBId: string;
    stationAName: string;
    stationBName: string;
  }>;
  isolatedEquipmentIds: string[];
  isolatedEquipment: Array<{ id: string; name: string }>;
  impactedConnectionIds: string[];
  impactedConnections: Array<{ id: string; name: string }>;
}

export function useWebSocket(onSimulationResult: (result: SimulationResult) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Em dev, aponta para localhost:3000. Em produção, defina VITE_API_URL
    // (ex: https://sua-api.exemplo.com) no ambiente de build do frontend.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socket = io(`${apiUrl}/events`, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('simulation:result', onSimulationResult);

    return () => {
      socket.disconnect();
    };
  }, [onSimulationResult]);

  return socketRef;
}
