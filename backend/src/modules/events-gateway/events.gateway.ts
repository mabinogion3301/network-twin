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

  broadcastSimulationResult(payload: unknown) {
    this.server.emit('simulation:result', payload);
  }

  /**
   * Disparado sempre que Estação, Equipamento ou Conexão é criado/editado/
   * excluído — faz o mapa e o dashboard de todos os usuários recarregarem.
   */
  broadcastTopologyChanged() {
    this.server.emit('topology:changed');
  }
}
