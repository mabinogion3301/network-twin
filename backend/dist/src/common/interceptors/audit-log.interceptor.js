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
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const prisma_module_1 = require("../../prisma.module");
const events_gateway_1 = require("../../modules/events-gateway/events.gateway");
const TOPOLOGY_ENTITIES = new Set(['Stations', 'Equipments', 'Ports', 'Connections', 'StationLinks']);
let AuditLogInterceptor = class AuditLogInterceptor {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method))
            return next.handle();
        const entityType = context.getClass().name.replace('Controller', '');
        const user = request.user;
        const body = request.body;
        const paramId = request.params?.id;
        return next.handle().pipe((0, operators_1.tap)((result) => {
            if (!user?.sub)
                return;
            const action = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
            const entityId = result?.id ?? paramId ?? 'unknown';
            this.prisma.auditLog
                .create({ data: { entityType, entityId, action, userId: user.sub, diffJson: { input: body ?? null, result: result ?? null } } })
                .catch((err) => console.error('Falha ao gravar AuditLog:', err));
            if (TOPOLOGY_ENTITIES.has(entityType)) {
                this.eventsGateway.broadcastTopologyChanged();
            }
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_module_1.PrismaService,
        events_gateway_1.EventsGateway])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map