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
exports.SimulationsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../../common/guards/auth.guards");
const auth_decorators_1 = require("../../common/decorators/auth.decorators");
const simulations_service_1 = require("./simulations.service");
const simulation_dto_1 = require("./dto/simulation.dto");
let SimulationsController = class SimulationsController {
    constructor(service) {
        this.service = service;
    }
    run(dto, user) {
        return this.service.run(dto, user.sub);
    }
    findHistory() {
        return this.service.findHistory();
    }
    getCurrentState() {
        return this.service.getCurrentState();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    updateNotes(id, body) {
        return this.service.updateNotes(id, body.notes);
    }
};
exports.SimulationsController = SimulationsController;
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorators_1.Permissions)('simulations.run'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_decorators_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [simulation_dto_1.RunSimulationDto, Object]),
    __metadata("design:returntype", void 0)
], SimulationsController.prototype, "run", null);
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorators_1.Permissions)('simulations.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationsController.prototype, "findHistory", null);
__decorate([
    (0, common_1.Get)('current'),
    (0, auth_decorators_1.Permissions)('simulations.read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SimulationsController.prototype, "getCurrentState", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, auth_decorators_1.Permissions)('simulations.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SimulationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/notes'),
    (0, auth_decorators_1.Permissions)('simulations.run'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SimulationsController.prototype, "updateNotes", null);
exports.SimulationsController = SimulationsController = __decorate([
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard, auth_guards_1.PermissionsGuard),
    (0, common_1.Controller)('simulations'),
    __metadata("design:paramtypes", [simulations_service_1.SimulationsService])
], SimulationsController);
//# sourceMappingURL=simulations.controller.js.map