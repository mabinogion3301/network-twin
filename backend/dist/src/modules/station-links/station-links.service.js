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
exports.StationLinksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
let StationLinksService = class StationLinksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(stationId) {
        return this.prisma.stationLink.findMany({
            where: stationId ? { OR: [{ stationAId: stationId }, { stationBId: stationId }] } : undefined,
            include: { stationA: true, stationB: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const link = await this.prisma.stationLink.findUnique({
            where: { id },
            include: { stationA: true, stationB: true },
        });
        if (!link)
            throw new common_1.NotFoundException('Vínculo entre estações não encontrado');
        return link;
    }
    async create(dto) {
        if (dto.stationAId === dto.stationBId) {
            throw new common_1.BadRequestException('Uma estação não pode ter um vínculo direto com ela mesma');
        }
        const [a, b] = await Promise.all([
            this.prisma.station.findUnique({ where: { id: dto.stationAId } }),
            this.prisma.station.findUnique({ where: { id: dto.stationBId } }),
        ]);
        if (!a)
            throw new common_1.NotFoundException('Estação A não encontrada');
        if (!b)
            throw new common_1.NotFoundException('Estação B não encontrada');
        const existing = await this.prisma.stationLink.findFirst({
            where: {
                OR: [
                    { stationAId: dto.stationAId, stationBId: dto.stationBId },
                    { stationAId: dto.stationBId, stationBId: dto.stationAId },
                ],
            },
        });
        if (existing)
            throw new common_1.ConflictException('Já existe um vínculo direto cadastrado entre essas estações');
        return this.prisma.stationLink.create({ data: dto });
    }
    async update(id, dto) {
        await this.ensureExists(id);
        return this.prisma.stationLink.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.ensureExists(id);
        return this.prisma.stationLink.delete({ where: { id } });
    }
    async ensureExists(id) {
        const exists = await this.prisma.stationLink.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Vínculo entre estações não encontrado');
    }
};
exports.StationLinksService = StationLinksService;
exports.StationLinksService = StationLinksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], StationLinksService);
//# sourceMappingURL=station-links.service.js.map