"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailuresModule = void 0;
const common_1 = require("@nestjs/common");
const failures_service_1 = require("./failures.service");
const failures_controller_1 = require("./failures.controller");
const events_gateway_module_1 = require("../events-gateway/events-gateway.module");
let FailuresModule = class FailuresModule {
};
exports.FailuresModule = FailuresModule;
exports.FailuresModule = FailuresModule = __decorate([
    (0, common_1.Module)({
        imports: [events_gateway_module_1.EventsGatewayModule],
        providers: [failures_service_1.FailuresService],
        controllers: [failures_controller_1.FailuresController],
        exports: [failures_service_1.FailuresService],
    })
], FailuresModule);
//# sourceMappingURL=failures.module.js.map