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
exports.PortQueryDto = exports.UpdatePortDto = exports.CreatePortDto = exports.PortStatusDto = exports.PortTypeDto = void 0;
const class_validator_1 = require("class-validator");
var PortTypeDto;
(function (PortTypeDto) {
    PortTypeDto["RJ45"] = "RJ45";
    PortTypeDto["SFP"] = "SFP";
    PortTypeDto["SFP_PLUS"] = "SFP_PLUS";
    PortTypeDto["QSFP"] = "QSFP";
    PortTypeDto["FIBER"] = "FIBER";
    PortTypeDto["OTHER"] = "OTHER";
})(PortTypeDto || (exports.PortTypeDto = PortTypeDto = {}));
var PortStatusDto;
(function (PortStatusDto) {
    PortStatusDto["ONLINE"] = "ONLINE";
    PortStatusDto["OFFLINE"] = "OFFLINE";
    PortStatusDto["DISABLED"] = "DISABLED";
    PortStatusDto["ALERT"] = "ALERT";
})(PortStatusDto || (exports.PortStatusDto = PortStatusDto = {}));
class CreatePortDto {
}
exports.CreatePortDto = CreatePortDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePortDto.prototype, "equipmentId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePortDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePortDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(PortTypeDto),
    __metadata("design:type", String)
], CreatePortDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePortDto.prototype, "speed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PortStatusDto),
    __metadata("design:type", String)
], CreatePortDto.prototype, "status", void 0);
class UpdatePortDto {
}
exports.UpdatePortDto = UpdatePortDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdatePortDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePortDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PortTypeDto),
    __metadata("design:type", String)
], UpdatePortDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePortDto.prototype, "speed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PortStatusDto),
    __metadata("design:type", String)
], UpdatePortDto.prototype, "status", void 0);
class PortQueryDto {
}
exports.PortQueryDto = PortQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PortQueryDto.prototype, "equipmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PortStatusDto),
    __metadata("design:type", String)
], PortQueryDto.prototype, "status", void 0);
//# sourceMappingURL=port.dto.js.map