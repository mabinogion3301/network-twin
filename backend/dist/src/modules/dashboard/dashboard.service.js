"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getOverview() {
        const [stationsCount, equipmentsCount, connectionsCount, offlineConnections, offlineStations, offlineEquipments, recentSimulations, latestSimulation,] = await Promise.all([
            this.prisma.station.count(),
            this.prisma.equipment.count(),
            this.prisma.connection.count(),
            this.prisma.connection.count({ where: { status: 'OFFLINE' } }),
            this.prisma.station.count({ where: { status: 'OFFLINE' } }),
            this.prisma.equipment.count({ where: { status: 'OFFLINE' } }),
            this.prisma.failureSimulation.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
            this.prisma.failureSimulation.findFirst({ orderBy: { createdAt: 'desc' } }),
        ]);
        const activeResult = latestSimulation?.resultJson;
        const linksInFailure = activeResult?.removedConnectionIds?.length ?? 0;
        const equipmentInFailure = activeResult?.isolatedEquipmentIds?.length ?? 0;
        const stationsInFailure = new Set((activeResult?.unavailableStationPairs ?? []).flatMap((p) => [p.stationAId, p.stationBId])).size;
        return {
            stationsCount,
            equipmentsCount,
            connectionsCount,
            offlineConnections,
            offlineStations,
            offlineEquipments,
            linksInFailure,
            equipmentInFailure,
            stationsInFailure,
            hasActiveSimulation: linksInFailure > 0 || equipmentInFailure > 0,
            recentSimulations,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map