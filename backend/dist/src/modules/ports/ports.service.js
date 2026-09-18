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
exports.PortsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const prisma_errors_util_1 = require("../../common/utils/prisma-errors.util");
let PortsService = class PortsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(query) {
        return this.prisma.port.findMany({
            where: { equipmentId: query.equipmentId, status: query.status },
            include: { equipment: { select: { id: true, name: true, stationId: true } } },
            orderBy: { number: 'asc' },
        });
    }
    async findOne(id) {
        const port = await this.prisma.port.findUnique({
            where: { id },
            include: { equipment: true, connectionsAsSource: true, connectionsAsTarget: true },
        });
        if (!port)
            throw new common_1.NotFoundException('Porta não encontrada');
        return port;
    }
    async create(dto) {
        const duplicate = await this.prisma.port.findUnique({
            where: { equipmentId_number: { equipmentId: dto.equipmentId, number: dto.number } },
        });
        if (duplicate)
            throw new common_1.ConflictException('Já existe uma porta com esse número neste equipamento');
        return this.prisma.port.create({ data: dto });
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return this.prisma.port.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.ensureExists(id);
        try {
            return await this.prisma.port.delete({ where: { id } });
        }
        catch (error) {
            (0, prisma_errors_util_1.handlePrismaDeleteError)(error, 'porta');
        }
    }
    async ensureExists(id) {
        const exists = await this.prisma.port.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Porta não encontrada');
    }
};
exports.PortsService = PortsService;
exports.PortsService = PortsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], PortsService);
//# sourceMappingURL=ports.service.js.map