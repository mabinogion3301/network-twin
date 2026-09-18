"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const roles_module_1 = require("./modules/roles/roles.module");
const stations_module_1 = require("./modules/stations/stations.module");
const equipment_types_module_1 = require("./modules/equipment-types/equipment-types.module");
const manufacturers_module_1 = require("./modules/manufacturers/manufacturers.module");
const models_module_1 = require("./modules/models/models.module");
const equipments_module_1 = require("./modules/equipments/equipments.module");
const ports_module_1 = require("./modules/ports/ports.module");
const connections_module_1 = require("./modules/connections/connections.module");
const station_links_module_1 = require("./modules/station-links/station-links.module");
const audit_log_module_1 = require("./modules/audit-log/audit-log.module");
const topology_module_1 = require("./modules/topology/topology.module");
const graph_module_1 = require("./modules/graph/graph.module");
const simulations_module_1 = require("./modules/simulations/simulations.module");
const events_gateway_module_1 = require("./modules/events-gateway/events-gateway.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const search_module_1 = require("./modules/search/search.module");
const audit_log_interceptor_1 = require("./common/interceptors/audit-log.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            stations_module_1.StationsModule,
            equipment_types_module_1.EquipmentTypesModule,
            manufacturers_module_1.ManufacturersModule,
            models_module_1.ModelsModule,
            equipments_module_1.EquipmentsModule,
            ports_module_1.PortsModule,
            connections_module_1.ConnectionsModule,
            station_links_module_1.StationLinksModule,
            audit_log_module_1.AuditLogModule,
            topology_module_1.TopologyModule,
            graph_module_1.GraphModule,
            simulations_module_1.SimulationsModule,
            events_gateway_module_1.EventsGatewayModule,
            dashboard_module_1.DashboardModule,
            search_module_1.SearchModule,
        ],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_log_interceptor_1.AuditLogInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map