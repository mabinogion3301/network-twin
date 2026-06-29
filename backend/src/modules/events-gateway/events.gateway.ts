import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_URL || '*' }, namespace: '/events' })
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  /**
   * Disparado pelo SimulationsService sempre que uma simulação de falha é
   * executada. O frontend escuta esse evento para atualizar o mapa de TODOS
   * os usuários conectados, sem precisar de refresh.
   */
  broadcastSimulationResult(payload: unknown) {
    this.server.emit('simulation:result', payload);
  }

  /**
   * Disparado quando o status de uma entidade muda via CRUD comum (ex:
   * estação marcada como Manutenção manualmente) — mantém o mapa sincronizado
   * mesmo fora de uma simulação.
   */
  broadcastEntityUpdated(payload: { entityType: string; entityId: string; action: string }) {
    this.server.emit('entity:updated', payload);
  }
}
