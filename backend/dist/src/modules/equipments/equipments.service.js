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
exports.EquipmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const events_gateway_1 = require("../events-gateway/events.gateway");
let EquipmentsService = class EquipmentsService {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    findAll(query) {
        return this.prisma.equipment.findMany({
            where: {
                stationId: query.stationId,
                typeId: query.typeId,
                status: query.status,
                OR: query.search
                    ? [
                        { name: { contains: query.search, mode: 'insensitive' } },
                        { ip: { contains: query.search, mode: 'insensitive' } },
                    ]
                    : undefined,
            },
            include: { station: true, type: true, model: { include: { manufacturer: true } }, ports: true },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const equipment = await this.prisma.equipment.findUnique({
            where: { id },
            include: { station: true, type: true, model: { include: { manufacturer: true } }, ports: true },
        });
        if (!equipment)
            throw new common_1.NotFoundException('Equipamento não encontrado');
        return equipment;
    }
    async create(dto) {
        const { portCount, ...data } = dto;
        const result = await this.prisma.$transaction(async (tx) => {
            const equipment = await tx.equipment.create({ data: { ...data, portCount: portCount ?? 0 } });
            if (portCount && portCount > 0) {
                await tx.port.createMany({
                    data: Array.from({ length: portCount }, (_, i) => ({
                        equipmentId: equipment.id, number: i + 1, type: 'RJ45',
                    })),
                });
            }
            return tx.equipment.findUnique({ where: { id: equipment.id }, include: { ports: true } });
        });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const result = await this.prisma.equipment.update({ where: { id }, data: dto });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async remove(id) {
        await this.ensureExists(id);
        const result = await this.prisma.$transaction(async (tx) => {
            const ports = await tx.port.findMany({ where: { equipmentId: id }, select: { id: true } });
            const portIds = ports.map((p) => p.id);
            if (portIds.length > 0) {
                await tx.connection.deleteMany({ where: { OR: [{ sourcePortId: { in: portIds } }, { targetPortId: { in: portIds } }] } });
                await tx.port.deleteMany({ where: { equipmentId: id } });
            }
            return tx.equipment.delete({ where: { id } });
        });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async ensureExists(id) {
        const exists = await this.prisma.equipment.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Equipamento não encontrado');
    }
};
exports.EquipmentsService = EquipmentsService;
exports.EquipmentsService = EquipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService, events_gateway_1.EventsGateway])
], EquipmentsService);
//# sourceMappingURL=equipments.service.js.map