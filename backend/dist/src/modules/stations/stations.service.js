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
exports.StationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const prisma_errors_util_1 = require("../../common/utils/prisma-errors.util");
const events_gateway_1 = require("../events-gateway/events.gateway");
let StationsService = class StationsService {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    findAll(query) {
        return this.prisma.station.findMany({
            where: {
                city: query.city ? { equals: query.city, mode: 'insensitive' } : undefined,
                state: query.state ? { equals: query.state, mode: 'insensitive' } : undefined,
                status: query.status,
                name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const station = await this.prisma.station.findUnique({
            where: { id },
            include: { equipments: { include: { ports: true, type: true } } },
        });
        if (!station)
            throw new common_1.NotFoundException('Estação não encontrada');
        return station;
    }
    async create(dto) {
        const result = await this.prisma.station.create({ data: dto });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const result = await this.prisma.station.update({ where: { id }, data: dto });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async remove(id) {
        await this.ensureExists(id);
        try {
            const result = await this.prisma.$transaction(async (tx) => {
                await tx.stationLink.deleteMany({
                    where: { OR: [{ stationAId: id }, { stationBId: id }] },
                });
                return tx.station.delete({ where: { id } });
            });
            this.events.broadcastTopologyChanged();
            return result;
        }
        catch (error) {
            (0, prisma_errors_util_1.handlePrismaDeleteError)(error, 'estação');
        }
    }
    async ensureExists(id) {
        const exists = await this.prisma.station.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Estação não encontrada');
    }
};
exports.StationsService = StationsService;
exports.StationsService = StationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService, events_gateway_1.EventsGateway])
], StationsService);
//# sourceMappingURL=stations.service.js.map