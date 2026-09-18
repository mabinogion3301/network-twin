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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
const auth_service_1 = require("../auth/auth.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.user.findMany({
            select: { id: true, name: true, email: true, active: true, roleId: true, role: true, createdAt: true },
        });
    }
    findOne(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: { id: true, name: true, email: true, active: true, roleId: true, role: true, createdAt: true },
        });
    }
    async create(dto) {
        const passwordHash = await auth_service_1.AuthService.hashPassword(dto.password);
        return this.prisma.user.create({
            data: { name: dto.name, email: dto.email, passwordHash, roleId: dto.roleId },
            select: { id: true, name: true, email: true, roleId: true },
        });
    }
    async update(id, dto) {
        const { newPassword, ...rest } = dto;
        const data = { ...rest };
        if (newPassword) {
            data.passwordHash = await auth_service_1.AuthService.hashPassword(newPassword);
        }
        return this.prisma.user.update({ where: { id }, data });
    }
    remove(id) {
        return this.prisma.user.update({ where: { id }, data: { active: false } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map