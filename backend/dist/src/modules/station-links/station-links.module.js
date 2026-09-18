"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationLinksModule = void 0;
const common_1 = require("@nestjs/common");
const events_gateway_module_1 = require("../events-gateway/events-gateway.module");
const station_links_service_1 = require("./station-links.service");
const station_links_controller_1 = require("./station-links.controller");
let StationLinksModule = class StationLinksModule {
};
exports.StationLinksModule = StationLinksModule;
exports.StationLinksModule = StationLinksModule = __decorate([
    (0, common_1.Module)({
        imports: [events_gateway_module_1.EventsGatewayModule,],
        controllers: [station_links_controller_1.StationLinksController],
        providers: [station_links_service_1.StationLinksService],
    })
], StationLinksModule);
//# sourceMappingURL=station-links.module.js.map