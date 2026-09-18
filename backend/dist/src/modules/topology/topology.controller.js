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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopologyController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../../common/guards/auth.guards");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const topology_service_1 = require("./topology.service");
let TopologyController = class TopologyController {
    constructor(service) {
        this.service = service;
    }
    getTopology(city, stationId, typeId, status) {
        return this.service.getTopology({ city, stationId, typeId, status });
    }
    getFilterOptions() {
        return this.service.getFilterOptions();
    }
    getGeoTopology() {
        return this.service.getGeoTopology();
    }
};
exports.TopologyController = TopologyController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorators_1.Permissions)('equipments.read'),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('stationId')),
    __param(2, (0, common_1.Query)('typeId')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TopologyController.prototype, "getTopology", null);
__decorate([
    (0, common_1.Get)('filters'),
    (0, auth_decorators_1.Permissions)('equipments.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TopologyController.prototype, "getFilterOptions", null);
__decorate([
    (0, common_1.Get)('geo'),
    (0, auth_decorators_1.Permissions)('equipments.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TopologyController.prototype, "getGeoTopology", null);
exports.TopologyController = TopologyController = __decorate([
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.PermissionsGuard),
    (0, common_1.Controller)('topology'),
    __metadata("design:paramtypes", [topology_service_1.TopologyService])
], TopologyController);
//# sourceMappingURL=topology.controller.js.map