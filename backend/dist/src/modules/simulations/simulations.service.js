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
        const failedStationIds = dto.failedStationIds ?? [];
        const resolvedConnections = connectionIds.length
            ? await this.prisma.connection.findMany({
                where: { OR: [{ id: { in: connectionIds } }, { name: { in: connectionIds } }] },
                select: { id: true, name: true },
            })
            : [];
        const resolvedConnectionIds = resolvedConnections.map((c) => c.id);
        const [allStations, allConnections] = await Promise.all([
            this.prisma.station.findMany({ select: { id: true, name: true, isCore: true } }),
            this.prisma.connection.findMany({
                where: { status: { not: 'DISABLED' } },
                include: {
                    sourcePort: { include: { equipment: true } },
                    targetPort: { include: { equipment: true } },
                },
            }),
        ]);
        const stationConnections = allConnections
            .map((conn) => ({
            id: conn.id,
            stationAId: conn.sourcePort?.equipment?.stationId ?? '',
            stationBId: conn.targetPort?.equipment?.stationId ?? '',
        }))
            .filter((c) => c.stationAId && c.stationBId && c.stationAId !== c.stationBId);
        const allStationIds = allStations.map((s) => s.id);
        const coreStationIds = allStations.filter((s) => s.isCore).map((s) => s.id);
        const stationFailureConnIds = failedStationIds.length > 0
            ? stationConnections
                .filter((c) => failedStationIds.includes(c.stationAId) || failedStationIds.includes(c.stationBId))
                .map((c) => c.id)
            : [];
        const allFailedConnectionIds = [...new Set([...resolvedConnectionIds, ...stationFailureConnIds])];
        console.log(`[Impact] ${allStations.length} estações, ${stationConnections.length} conexões inter-estação, ${allFailedConnectionIds.length} falhas, ${coreStationIds.length} COREs`);
        const impact = this.graphService.computeImpact({
            stationConnections,
            allStationIds,
            coreStationIds,
            failedConnectionIds: allFailedConnectionIds,
        });
        const overheatStationIds = dto.overheatStationIds ?? [];
        const result = {
            removedConnectionIds: resolvedConnectionIds,
            failedStationIds,
            overheatStationIds,
            stationStates: impact.stationStates,
            isolatedStationIds: impact.isolatedStationIds,
            degradingStationIds: impact.degradingStationIds,
            impactedStationIds: impact.impactedStationIds,
            normalStationIds: impact.normalStationIds,
            stats: impact.stats,
            coreStationIds,
        };
        const simulation = await this.prisma.failureSimulation.create({
            data: {
                triggeredByUserId,
                removedConnectionIds: resolvedConnectionIds,
                removedEquipmentIds: [],
                resultJson: result,
            },
        });
        const fullResult = { simulationId: simulation.id, ...result };
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
        return { simulationId: latest.id, notes: latest.notes ?? '', ...latest.resultJson };
    }
    async updateNotes(id, notes) {
        const updated = await this.prisma.failureSimulation.update({ where: { id }, data: { notes } });
        const result = { simulationId: updated.id, notes: updated.notes ?? '', ...updated.resultJson };
        this.eventsGateway.broadcastSimulationResult(result);
        return result;
    }
    async updateConnectionNote(simulationId, connectionId, note) {
        const simulation = await this.prisma.failureSimulation.findUnique({ where: { id: simulationId } });
        if (!simulation)
            return null;
        const result = simulation.resultJson;
        const connectionNotes = result.connectionNotes ?? {};
        connectionNotes[connectionId] = note;
        const updated = await this.prisma.failureSimulation.update({
            where: { id: simulationId },
            data: { resultJson: { ...result, connectionNotes } },
        });
        const fullResult = { simulationId: updated.id, notes: updated.notes ?? '', ...updated.resultJson };
        this.eventsGateway.broadcastSimulationResult(fullResult);
        return fullResult;
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