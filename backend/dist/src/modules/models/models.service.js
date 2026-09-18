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
exports.ModelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const prisma_errors_util_1 = require("../../common/utils/prisma-errors.util");
let ModelsService = class ModelsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.model.findMany({ orderBy: { name: 'asc' }, include: { manufacturer: true } });
    }
    async findOne(id) {
        const item = await this.prisma.model.findUnique({ where: { id }, include: { manufacturer: true } });
        if (!item)
            throw new common_1.NotFoundException('Modelo não encontrado');
        return item;
    }
    create(dto) {
        return this.prisma.model.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.model.update({ where: { id }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        try {
            return await this.prisma.model.delete({ where: { id } });
        }
        catch (error) {
            (0, prisma_errors_util_1.handlePrismaDeleteError)(error, 'modelo');
        }
    }
};
exports.ModelsService = ModelsService;
exports.ModelsService = ModelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], ModelsService);
//# sourceMappingURL=models.service.js.map