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
exports.FailDto = exports.ConnectionQueryDto = exports.UpdateConnectionDto = exports.CreateConnectionDto = exports.ConnectionStatusDto = exports.ConnectionTypeDto = void 0;
const class_validator_1 = require("class-validator");
var ConnectionTypeDto;
(function (ConnectionTypeDto) {
    ConnectionTypeDto["ELETRONORTE_CAPACITY"] = "ELETRONORTE_CAPACITY";
    ConnectionTypeDto["TIM_CAPACITY"] = "TIM_CAPACITY";
    ConnectionTypeDto["ELETROSUL_CAPACITY"] = "ELETROSUL_CAPACITY";
    ConnectionTypeDto["ELETRONORTE_FIBER"] = "ELETRONORTE_FIBER";
    ConnectionTypeDto["TIM_FIBER"] = "TIM_FIBER";
    ConnectionTypeDto["ELETROSUL_FIBER"] = "ELETROSUL_FIBER";
    ConnectionTypeDto["GVT_FIBER"] = "GVT_FIBER";
    ConnectionTypeDto["CHESF_FIBER"] = "CHESF_FIBER";
    ConnectionTypeDto["FURNAS_FIBER"] = "FURNAS_FIBER";
    ConnectionTypeDto["PETROBRAS_FIBER"] = "PETROBRAS_FIBER";
    ConnectionTypeDto["CEMIG_FIBER"] = "CEMIG_FIBER";
    ConnectionTypeDto["TELEBRAS_FIBER"] = "TELEBRAS_FIBER";
    ConnectionTypeDto["RNP_FIBER"] = "RNP_FIBER";
    ConnectionTypeDto["PRODEPA_FIBER"] = "PRODEPA_FIBER";
    ConnectionTypeDto["OTHER"] = "OTHER";
})(ConnectionTypeDto || (exports.ConnectionTypeDto = ConnectionTypeDto = {}));
var ConnectionStatusDto;
(function (ConnectionStatusDto) {
    ConnectionStatusDto["ONLINE"] = "ONLINE";
    ConnectionStatusDto["OFFLINE"] = "OFFLINE";
    ConnectionStatusDto["ALERT"] = "ALERT";
    ConnectionStatusDto["DISABLED"] = "DISABLED";
})(ConnectionStatusDto || (exports.ConnectionStatusDto = ConnectionStatusDto = {}));
class CreateConnectionDto {
}
exports.CreateConnectionDto = CreateConnectionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConnectionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConnectionDto.prototype, "sourcePortId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateConnectionDto.prototype, "targetPortId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ConnectionTypeDto),
    __metadata("design:type", String)
], CreateConnectionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateConnectionDto.prototype, "distance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateConnectionDto.prototype, "fiberCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateConnectionDto.prototype, "fibersUsed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ConnectionStatusDto),
    __metadata("design:type", String)
], CreateConnectionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateConnectionDto.prototype, "isBackup", void 0);
class UpdateConnectionDto {
}
exports.UpdateConnectionDto = UpdateConnectionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConnectionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ConnectionTypeDto),
    __metadata("design:type", String)
], UpdateConnectionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateConnectionDto.prototype, "distance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateConnectionDto.prototype, "fiberCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdateConnectionDto.prototype, "fibersUsed", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ConnectionStatusDto),
    __metadata("design:type", String)
], UpdateConnectionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateConnectionDto.prototype, "isBackup", void 0);
class ConnectionQueryDto {
}
exports.ConnectionQueryDto = ConnectionQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ConnectionStatusDto),
    __metadata("design:type", String)
], ConnectionQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ConnectionTypeDto),
    __metadata("design:type", String)
], ConnectionQueryDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConnectionQueryDto.prototype, "search", void 0);
class FailDto {
}
exports.FailDto = FailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], FailDto.prototype, "connectionIdOrName", void 0);
//# sourceMappingURL=connection.dto.js.map