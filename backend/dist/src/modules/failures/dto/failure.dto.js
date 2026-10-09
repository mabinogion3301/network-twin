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
exports.UpdateNoteDto = exports.CreateFailureDto = exports.FailureSeverityDto = exports.FailureTargetTypeDto = exports.FailureTypeDto = void 0;
const class_validator_1 = require("class-validator");
var FailureTypeDto;
(function (FailureTypeDto) {
    FailureTypeDto["MANAGEMENT_FAILURE"] = "MANAGEMENT_FAILURE";
    FailureTypeDto["OVERHEATING"] = "OVERHEATING";
    FailureTypeDto["POWER_FAILURE"] = "POWER_FAILURE";
    FailureTypeDto["EQUIPMENT_UNAVAILABLE"] = "EQUIPMENT_UNAVAILABLE";
    FailureTypeDto["NODE_RUPTURE"] = "NODE_RUPTURE";
    FailureTypeDto["NODE_ATTENUATION"] = "NODE_ATTENUATION";
})(FailureTypeDto || (exports.FailureTypeDto = FailureTypeDto = {}));
var FailureTargetTypeDto;
(function (FailureTargetTypeDto) {
    FailureTargetTypeDto["STATION"] = "STATION";
    FailureTargetTypeDto["CONNECTION"] = "CONNECTION";
})(FailureTargetTypeDto || (exports.FailureTargetTypeDto = FailureTargetTypeDto = {}));
var FailureSeverityDto;
(function (FailureSeverityDto) {
    FailureSeverityDto["CRITICAL"] = "CRITICAL";
    FailureSeverityDto["HIGH"] = "HIGH";
    FailureSeverityDto["MEDIUM"] = "MEDIUM";
    FailureSeverityDto["LOW"] = "LOW";
})(FailureSeverityDto || (exports.FailureSeverityDto = FailureSeverityDto = {}));
class CreateFailureDto {
}
exports.CreateFailureDto = CreateFailureDto;
__decorate([
    (0, class_validator_1.IsEnum)(FailureTypeDto),
    __metadata("design:type", String)
], CreateFailureDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(FailureTargetTypeDto),
    __metadata("design:type", String)
], CreateFailureDto.prototype, "targetType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFailureDto.prototype, "targetId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFailureDto.prototype, "targetName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(FailureSeverityDto),
    __metadata("design:type", String)
], CreateFailureDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFailureDto.prototype, "note", void 0);
class UpdateNoteDto {
}
exports.UpdateNoteDto = UpdateNoteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateNoteDto.prototype, "note", void 0);
//# sourceMappingURL=failure.dto.js.map