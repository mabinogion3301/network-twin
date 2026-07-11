import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { StationsModule } from './modules/stations/stations.module';
import { EquipmentTypesModule } from './modules/equipment-types/equipment-types.module';
import { ManufacturersModule } from './modules/manufacturers/manufacturers.module';
import { ModelsModule } from './modules/models/models.module';
import { EquipmentsModule } from './modules/equipments/equipments.module';
import { PortsModule } from './modules/ports/ports.module';
import { ConnectionsModule } from './modules/connections/connections.module';
import { StationLinksModule } from './modules/station-links/station-links.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { TopologyModule } from './modules/topology/topology.module';
import { GraphModule } from './modules/graph/graph.module';
import { SimulationsModule } from './modules/simulations/simulations.module';
import { EventsGatewayModule } from './modules/events-gateway/events-gateway.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SearchModule } from './modules/search/search.module';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    StationsModule,
    EquipmentTypesModule,
    ManufacturersModule,
    ModelsModule,
    EquipmentsModule,
    PortsModule,
    ConnectionsModule,
    StationLinksModule,
    AuditLogModule,
    TopologyModule,
    GraphModule,
    SimulationsModule,
    EventsGatewayModule,
    DashboardModule,
    SearchModule,
  ],
  providers: [
    // Registra o AuditLogInterceptor globalmente — assim ele tem acesso a
    // PrismaService (global) e EventsGateway (via EventsGatewayModule acima)
    // sem precisar ser declarado em cada módulo individualmente.
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
