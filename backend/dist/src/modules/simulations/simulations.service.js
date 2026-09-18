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
exports.SimulationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const graph_service_1 = require("../graph/graph.service");
const events_gateway_1 = require("../events-gateway/events.gateway");
let SimulationsService = class SimulationsService {
    constructor(prisma, graphService, eventsGateway) {
        this.prisma = prisma;
        this.graphService = graphService;
        this.eventsGateway = eventsGateway;
    }
    async run(dto, triggeredByUserId) {
        const connectionIds = dto.connectionIds ?? [];
        const equipmentIds = dto.equipmentIds ?? [];
        const resolvedConnections = connectionIds.length
            ? await this.prisma.connection.findMany({
                where: { OR: [{ id: { in: connectionIds } }, { name: { in: connectionIds } }] },
                select: { id: true, name: true },
            })
            : [];
        const resolvedConnectionIds = resolvedConnections.map((c) => c.id);
        const [allEquipments, allConnections, allStationLinks] = await Promise.all([
            this.prisma.equipment.findMany({ select: { id: true, stationId: true } }),
            this.prisma.connection.findMany({
                where: { status: { not: 'DISABLED' } },
                include: { sourcePort: true, targetPort: true },
            }),
            this.prisma.stationLink.findMany(),
        ]);
        const equipmentToStation = {};
        for (const eq of allEquipments)
            equipmentToStation[eq.id] = eq.stationId;
        const allEdges = allConnections.map((conn) => ({
            connectionId: conn.id,
            equipmentA: conn.sourcePort.equipmentId,
            equipmentB: conn.targetPort.equipmentId,
        }));
        const directStationLinks = allStationLinks.map((link) => ({
            linkId: link.id,
            stationAId: link.stationAId,
            stationBId: link.stationBId,
        }));
        const result = this.graphService.simulateFailure({
            allEquipmentIds: allEquipments.map((e) => e.id),
            equipmentToStation,
            allEdges,
            directStationLinks,
            removedConnectionIds: resolvedConnectionIds,
            removedEquipmentIds: equipmentIds,
        });
        const [stationsById, equipmentsById] = await Promise.all([
            this.prisma.station.findMany({ select: { id: true, name: true } }).then((rows) => Object.fromEntries(rows.map((r) => [r.id, r.name]))),
            this.prisma.equipment.findMany({ select: { id: true, name: true } }).then((rows) => Object.fromEntries(rows.map((r) => [r.id, r.name]))),
        ]);
        const enrichedResult = {
            ...result,
            removedConnectionIds: resolvedConnectionIds,
            removedEquipmentIds: equipmentIds,
            unavailableStationPairs: result.unavailableStationPairs.map((pair) => ({
                ...pair,
                stationAName: stationsById[pair.stationAId],
                stationBName: stationsById[pair.stationBId],
            })),
            isolatedEquipment: result.isolatedEquipmentIds.map((id) => ({ id, name: equipmentsById[id] })),
            impactedConnections: resolvedConnections.filter((c) => result.impactedConnectionIds.includes(c.id)),
        };
        const simulation = await this.prisma.failureSimulation.create({
            data: {
                triggeredByUserId,
                removedConnectionIds: resolvedConnectionIds,
                removedEquipmentIds: equipmentIds,
                resultJson: enrichedResult,
            },
        });
        const fullResult = { simulationId: simulation.id, ...enrichedResult };
        this.eventsGateway.broadcastSimulationResult(fullResult);
        return fullResult;
    }
    findHistory() {
        return this.prisma.failureSimulation.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
    }
    async findOne(id) {
        return this.prisma.failureSimulation.findUnique({ where: { id } });
    }
    async getCurrentState() {
        const latest = await this.prisma.failureSimulation.findFirst({ orderBy: { createdAt: 'desc' } });
        if (!latest)
            return null;
        return {
            simulationId: latest.id,
            notes: latest.notes ?? '',
            ...latest.resultJson,
        };
    }
    async updateNotes(id, notes) {
        const updated = await this.prisma.failureSimulation.update({
            where: { id },
            data: { notes },
        });
        const result = {
            simulationId: updated.id,
            notes: updated.notes ?? '',
            ...updated.resultJson,
        };
        this.eventsGateway.broadcastSimulationResult(result);
        return result;
    }
};
exports.SimulationsService = SimulationsService;
exports.SimulationsService = SimulationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        graph_service_1.GraphService,
        events_gateway_1.EventsGateway])
], SimulationsService);
//# sourceMappingURL=simulations.service.js.map