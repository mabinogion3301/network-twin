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
exports.ConnectionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const events_gateway_1 = require("../events-gateway/events.gateway");
let ConnectionsService = class ConnectionsService {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    findAll(query) {
        return this.prisma.connection.findMany({
            where: {
                status: query.status,
                type: query.type,
                name: query.search ? { contains: query.search, mode: 'insensitive' } : undefined,
            },
            include: {
                sourcePort: { include: { equipment: { include: { station: true } } } },
                targetPort: { include: { equipment: { include: { station: true } } } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const connection = await this.prisma.connection.findUnique({
            where: { id },
            include: {
                sourcePort: { include: { equipment: { include: { station: true } } } },
                targetPort: { include: { equipment: { include: { station: true } } } },
            },
        });
        if (!connection)
            throw new common_1.NotFoundException('Conexão não encontrada');
        return connection;
    }
    async create(dto) {
        if (dto.sourcePortId === dto.targetPortId) {
            throw new common_1.BadRequestException('Uma porta não pode se conectar a ela mesma');
        }
        const [sourcePort, targetPort] = await Promise.all([
            this.prisma.port.findUnique({ where: { id: dto.sourcePortId } }),
            this.prisma.port.findUnique({ where: { id: dto.targetPortId } }),
        ]);
        if (!sourcePort)
            throw new common_1.NotFoundException('Porta de origem não encontrada');
        if (!targetPort)
            throw new common_1.NotFoundException('Porta de destino não encontrada');
        await this.ensurePortFree(dto.sourcePortId);
        await this.ensurePortFree(dto.targetPortId);
        const result = await this.prisma.connection.create({ data: dto });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async update(id, dto) {
        await this.ensureExists(id);
        const result = await this.prisma.connection.update({ where: { id }, data: dto });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async remove(id) {
        await this.ensureExists(id);
        const result = await this.prisma.connection.delete({ where: { id } });
        this.events.broadcastTopologyChanged();
        return result;
    }
    async ensurePortFree(portId) {
        const existing = await this.prisma.connection.findFirst({
            where: { OR: [{ sourcePortId: portId }, { targetPortId: portId }] },
        });
        if (existing) {
            throw new common_1.ConflictException(`Porta já está em uso pela conexão "${existing.name}"`);
        }
    }
    async ensureExists(id) {
        const exists = await this.prisma.connection.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Conexão não encontrada');
    }
};
exports.ConnectionsService = ConnectionsService;
exports.ConnectionsService = ConnectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService, events_gateway_1.EventsGateway])
], ConnectionsService);
//# sourceMappingURL=connections.service.js.map