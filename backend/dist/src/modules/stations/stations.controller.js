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
exports.StationsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../../common/guards/auth.guards");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const stations_service_1 = require("./stations.service");
const station_dto_1 = require("./dto/station.dto");
let StationsController = class StationsController {
    constructor(stationsService) {
        this.stationsService = stationsService;
    }
    findAll(query) {
        return this.stationsService.findAll(query);
    }
    findOne(id) {
        return this.stationsService.findOne(id);
    }
    create(dto) {
        return this.stationsService.create(dto);
    }
    update(id, dto) {
        return this.stationsService.update(id, dto);
    }
    remove(id) {
        return this.stationsService.remove(id);
    }
};
exports.StationsController = StationsController;
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorators_1.Permissions)('stations.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [station_dto_1.StationQueryDto]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, auth_decorators_1.Permissions)('stations.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Permissions)('stations.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [station_dto_1.CreateStationDto]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, auth_decorators_1.Permissions)('stations.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, station_dto_1.UpdateStationDto]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorators_1.Permissions)('stations.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StationsController.prototype, "remove", null);
exports.StationsController = StationsController = __decorate([
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.PermissionsGuard),
    (0, common_1.Controller)('stations'),
    __metadata("design:paramtypes", [stations_service_1.StationsService])
], StationsController);
//# sourceMappingURL=stations.controller.js.map