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
exports.TopologyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
let TopologyService = class TopologyService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getTopology(filters) {
        const stations = await this.prisma.station.findMany({
            where: {
                id: filters.stationId,
                city: filters.city ? { equals: filters.city, mode: 'insensitive' } : undefined,
            },
        });
        const stationIds = new Set(stations.map((s) => s.id));
        const equipments = await this.prisma.equipment.findMany({
            where: {
                stationId: { in: Array.from(stationIds) },
                typeId: filters.typeId,
                status: filters.status,
            },
            include: { station: true, type: true },
        });
        const equipmentIds = new Set(equipments.map((e) => e.id));
        const connections = await this.prisma.connection.findMany({
            where: {
                sourcePort: { equipmentId: { in: Array.from(equipmentIds) } },
                targetPort: { equipmentId: { in: Array.from(equipmentIds) } },
            },
            include: {
                sourcePort: true,
                targetPort: true,
            },
        });
        const stationNodes = stations.map((st) => ({
            data: {
                id: st.id,
                label: st.name,
                type: 'station',
                city: st.city,
                state: st.state,
                status: st.status,
            },
            position: st.mapPositionX != null && st.mapPositionY != null
                ? { x: st.mapPositionX, y: st.mapPositionY }
                : undefined,
        }));
        const equipmentNodes = equipments.map((eq) => ({
            data: {
                id: eq.id,
                label: eq.name,
                type: 'equipment',
                parent: eq.stationId,
                equipmentType: eq.type.name,
                stationId: eq.stationId,
                stationName: eq.station.name,
                city: eq.station.city,
                state: eq.station.state,
                status: eq.status,
                ip: eq.ip,
            },
        }));
        const edges = connections.map((conn) => ({
            data: {
                id: conn.id,
                source: conn.sourcePort.equipmentId,
                target: conn.targetPort.equipmentId,
                label: conn.name,
                status: conn.status,
                type: conn.type,
                isBackup: conn.isBackup,
            },
        }));
        return { nodes: [...stationNodes, ...equipmentNodes], edges };
    }
    async getFilterOptions() {
        const stations = await this.prisma.station.findMany({
            select: { id: true, name: true, city: true, state: true },
            orderBy: { name: 'asc' },
        });
        const types = await this.prisma.equipmentType.findMany({ orderBy: { name: 'asc' } });
        const cities = Array.from(new Set(stations.map((s) => s.city))).sort();
        return { stations, types, cities };
    }
    async getGeoTopology() {
        const stations = await this.prisma.station.findMany();
        const connections = await this.prisma.connection.findMany({
            include: {
                sourcePort: { include: { equipment: true } },
                targetPort: { include: { equipment: true } },
            },
        });
        const interStationLinks = connections
            .filter((conn) => conn.sourcePort.equipment.stationId !== conn.targetPort.equipment.stationId)
            .map((conn) => ({
            id: conn.id,
            name: conn.name,
            sourceStationId: conn.sourcePort.equipment.stationId,
            targetStationId: conn.targetPort.equipment.stationId,
            sourceEquipmentId: conn.sourcePort.equipmentId,
            sourceEquipmentName: conn.sourcePort.equipment.name,
            targetEquipmentId: conn.targetPort.equipmentId,
            targetEquipmentName: conn.targetPort.equipment.name,
            status: conn.status,
            type: conn.type,
            isBackup: conn.isBackup,
        }));
        return {
            stations: stations.map((s) => ({
                id: s.id,
                name: s.name,
                city: s.city,
                state: s.state,
                latitude: s.latitude,
                longitude: s.longitude,
                status: s.status,
                trechos: s.trechos ?? [],
            })),
            links: interStationLinks,
        };
    }
};
exports.TopologyService = TopologyService;
exports.TopologyService = TopologyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], TopologyService);
//# sourceMappingURL=topology.service.js.map