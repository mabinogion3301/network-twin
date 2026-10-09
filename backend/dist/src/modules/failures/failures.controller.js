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
exports.FailuresController = void 0;
const common_1 = require("@nestjs/common");
const auth_guards_1 = require("../../common/guards/auth.guards");
const failures_service_1 = require("./failures.service");
const failure_dto_1 = require("./dto/failure.dto");
let FailuresController = class FailuresController {
    constructor(service) {
        this.service = service;
    }
    create(dto, req) {
        return this.service.create(dto, req.user.sub);
    }
    findActive() {
        return this.service.findActive();
    }
    findHistory() {
        return this.service.findHistory();
    }
    getCurrentImpactState() {
        return this.service.getCurrentImpactState();
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    acknowledge(id, req) {
        return this.service.acknowledge(id, req.user.sub);
    }
    restore(id, req) {
        return this.service.restore(id, req.user.sub);
    }
    updateNote(id, dto) {
        return this.service.updateNote(id, dto.note);
    }
};
exports.FailuresController = FailuresController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [failure_dto_1.CreateFailureDto, Object]),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "findHistory", null);
__decorate([
    (0, common_1.Get)('impact'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "getCurrentImpactState", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/acknowledge'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "acknowledge", null);
__decorate([
    (0, common_1.Patch)(':id/restore'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "restore", null);
__decorate([
    (0, common_1.Patch)(':id/note'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, failure_dto_1.UpdateNoteDto]),
    __metadata("design:returntype", void 0)
], FailuresController.prototype, "updateNote", null);
exports.FailuresController = FailuresController = __decorate([
    (0, common_1.UseGuards)(auth_guards_1.JwtAuthGuard),
    (0, common_1.Controller)('failures'),
    __metadata("design:paramtypes", [failures_service_1.FailuresService])
], FailuresController);
//# sourceMappingURL=failures.controller.js.map