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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../../prisma.module");
let SearchService = class SearchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(query) {
        if (!query || query.trim().length < 2)
            return { stations: [], equipments: [], connections: [], ports: [] };
        const q = query.trim();
        const [stations, equipments, connections, ports] = await Promise.all([
            this.prisma.station.findMany({
                where: { name: { contains: q, mode: 'insensitive' } },
                take: 10,
            }),
            this.prisma.equipment.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { ip: { contains: q, mode: 'insensitive' } },
                    ],
                },
                include: { station: true },
                take: 10,
            }),
            this.prisma.connection.findMany({
                where: { name: { contains: q, mode: 'insensitive' } },
                take: 10,
            }),
            this.prisma.port.findMany({
                where: { name: { contains: q, mode: 'insensitive' } },
                include: { equipment: true },
                take: 10,
            }),
        ]);
        return { stations, equipments, connections, ports };
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map