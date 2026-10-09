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
exports.FailuresService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const events_gateway_1 = require("../events-gateway/events.gateway");
let FailuresService = class FailuresService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    async create(dto, userId) {
        const failure = await this.prisma.failure.create({
            data: {
                type: dto.type,
                targetType: dto.targetType,
                targetId: dto.targetId,
                targetName: dto.targetName,
                severity: (dto.severity ?? 'HIGH'),
                note: dto.note,
                createdBy: userId,
            },
        });
        await this.broadcastImpact();
        return failure;
    }
    findActive() {
        return this.prisma.failure.findMany({
            where: { status: { not: 'RESTORED' } },
            orderBy: { createdAt: 'desc' },
        });
    }
    findHistory() {
        return this.prisma.failure.findMany({
            where: { status: 'RESTORED' },
            orderBy: { restoredAt: 'desc' },
            take: 200,
        });
    }
    findAll() {
        return this.prisma.failure.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
    }
    findOne(id) {
        return this.prisma.failure.findUnique({ where: { id } });
    }
    async acknowledge(id, userId) {
        const failure = await this.prisma.failure.update({
            where: { id },
            data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date(), acknowledgedBy: userId },
        });
        await this.broadcastImpact();
        return failure;
    }
    async restore(id, userId) {
        const failure = await this.prisma.failure.update({
            where: { id },
            data: { status: 'RESTORED', restoredAt: new Date(), restoredBy: userId },
        });
        await this.broadcastImpact();
        return failure;
    }
    async updateNote(id, note) {
        const failure = await this.prisma.failure.update({ where: { id }, data: { note } });
        await this.broadcastImpact();
        return failure;
    }
    async getActiveRemovedConnectionIds() {
        const active = await this.prisma.failure.findMany({
            where: { status: { not: 'RESTORED' } },
        });
        const removed = new Set();
        const connFailures = active.filter((f) => f.targetType === 'CONNECTION' &&
            (f.type === 'NODE_RUPTURE' || f.type === 'NODE_ATTENUATION'));
        for (const f of connFailures)
            removed.add(f.targetId);
        const mgmtFailures = active.filter((f) => f.targetType === 'STATION' && f.type === 'MANAGEMENT_FAILURE');
        if (mgmtFailures.length > 0) {
            const stationIds = mgmtFailures.map((f) => f.targetId);
            const connections = await this.prisma.connection.findMany({
                include: {
                    sourcePort: { include: { equipment: true } },
                    targetPort: { include: { equipment: true } },
                },
            });
            for (const conn of connections) {
                const srcStation = conn.sourcePort.equipment.stationId;
                const tgtStation = conn.targetPort.equipment.stationId;
                if (stationIds.includes(srcStation) || stationIds.includes(tgtStation)) {
                    removed.add(conn.id);
                }
            }
        }
        return [...removed];
    }
    async getCurrentImpactState() {
        const active = await this.findActive();
        const removedConnectionIds = await this.getActiveRemovedConnectionIds();
        return {
            failures: active,
            removedConnectionIds,
            stationFailures: active.filter((f) => f.targetType === 'STATION').map((f) => ({
                stationId: f.targetId,
                type: f.type,
                failureId: f.id,
                severity: f.severity,
                status: f.status,
            })),
        };
    }
    async broadcastImpact() {
        const state = await this.getCurrentImpactState();
        this.eventsGateway.broadcastFailureUpdate(state);
    }
};
exports.FailuresService = FailuresService;
exports.FailuresService = FailuresService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        events_gateway_1.EventsGateway])
], FailuresService);
//# sourceMappingURL=failures.service.js.map