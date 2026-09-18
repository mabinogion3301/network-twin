"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphService = void 0;
const common_1 = require("@nestjs/common");
let GraphService = class GraphService {
    buildAdjacency(edges) {
        const adjacency = new Map();
        const addEntry = (from, to, connectionId) => {
            const list = adjacency.get(from) ?? [];
            list.push({ neighbor: to, connectionId });
            adjacency.set(from, list);
        };
        for (const edge of edges) {
            addEntry(edge.equipmentA, edge.equipmentB, edge.connectionId);
            addEntry(edge.equipmentB, edge.equipmentA, edge.connectionId);
        }
        return adjacency;
    }
    connectedComponents(nodes, adjacency) {
        const componentOf = new Map();
        let componentId = 0;
        for (const start of nodes) {
            if (componentOf.has(start))
                continue;
            const queue = [start];
            componentOf.set(start, componentId);
            while (queue.length > 0) {
                const current = queue.shift();
                const neighbors = adjacency.get(current) ?? [];
                for (const { neighbor } of neighbors) {
                    if (!componentOf.has(neighbor)) {
                        componentOf.set(neighbor, componentId);
                        queue.push(neighbor);
                    }
                }
            }
            componentId++;
        }
        return componentOf;
    }
    simulateFailure(input) {
        const { allEquipmentIds, equipmentToStation, allEdges, directStationLinks, removedConnectionIds, removedEquipmentIds, } = input;
        const removedEquipmentSet = new Set(removedEquipmentIds);
        const removedConnectionSet = new Set(removedConnectionIds);
        const remainingEdges = allEdges.filter((edge) => !removedConnectionSet.has(edge.connectionId) &&
            !removedEquipmentSet.has(edge.equipmentA) &&
            !removedEquipmentSet.has(edge.equipmentB));
        const remainingEquipmentIds = allEquipmentIds.filter((id) => !removedEquipmentSet.has(id));
        const adjacency = this.buildAdjacency(remainingEdges);
        const componentOf = this.connectedComponents(remainingEquipmentIds, adjacency);
        const stationToComponents = new Map();
        const stationToEquipmentCount = new Map();
        for (const equipmentId of remainingEquipmentIds) {
            const stationId = equipmentToStation[equipmentId];
            const comp = componentOf.get(equipmentId);
            if (stationId === undefined || comp === undefined)
                continue;
            if (!stationToComponents.has(stationId))
                stationToComponents.set(stationId, new Set());
            stationToComponents.get(stationId).add(comp);
            stationToEquipmentCount.set(stationId, (stationToEquipmentCount.get(stationId) ?? 0) + 1);
        }
        const unavailableStationPairs = directStationLinks
            .filter((link) => {
            const compsA = stationToComponents.get(link.stationAId) ?? new Set();
            const compsB = stationToComponents.get(link.stationBId) ?? new Set();
            const stillConnected = [...compsA].some((c) => compsB.has(c));
            return !stillConnected;
        })
            .map((link) => ({ linkId: link.linkId, stationAId: link.stationAId, stationBId: link.stationBId }));
        const isolatedEquipmentIds = remainingEquipmentIds.filter((equipmentId) => {
            const myComponent = componentOf.get(equipmentId);
            const myStation = equipmentToStation[equipmentId];
            return !remainingEquipmentIds.some((otherId) => {
                if (otherId === equipmentId)
                    return false;
                return (componentOf.get(otherId) === myComponent && equipmentToStation[otherId] !== myStation);
            });
        });
        const impactedConnectionIds = allEdges
            .filter((edge) => removedConnectionSet.has(edge.connectionId))
            .filter((edge) => {
            const stillReachable = !removedEquipmentSet.has(edge.equipmentA) &&
                !removedEquipmentSet.has(edge.equipmentB) &&
                componentOf.get(edge.equipmentA) !== undefined &&
                componentOf.get(edge.equipmentA) === componentOf.get(edge.equipmentB);
            return !stillReachable;
        })
            .map((edge) => edge.connectionId);
        return {
            unavailableStationPairs,
            isolatedEquipmentIds,
            impactedConnectionIds,
            remainingEquipmentCount: remainingEquipmentIds.length,
            remainingEdgeCount: remainingEdges.length,
        };
    }
};
exports.GraphService = GraphService;
exports.GraphService = GraphService = __decorate([
    (0, common_1.Injectable)()
], GraphService);
//# sourceMappingURL=graph.service.js.map