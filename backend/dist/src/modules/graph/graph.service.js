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
    buildStationAdjacency(connections, failedIds) {
        const adj = new Map();
        for (const conn of connections) {
            if (failedIds.has(conn.id))
                continue;
            if (conn.stationAId === conn.stationBId)
                continue;
            if (!adj.has(conn.stationAId))
                adj.set(conn.stationAId, new Set());
            if (!adj.has(conn.stationBId))
                adj.set(conn.stationBId, new Set());
            adj.get(conn.stationAId).add(conn.stationBId);
            adj.get(conn.stationBId).add(conn.stationAId);
        }
        return adj;
    }
    bfs(adj, sources) {
        const visited = new Set(sources);
        const queue = [...sources];
        while (queue.length > 0) {
            const curr = queue.shift();
            for (const neighbor of (adj.get(curr) ?? new Set())) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        return visited;
    }
    computeImpact(input) {
        const { stationConnections, allStationIds, coreStationIds, failedConnectionIds } = input;
        const failed = new Set(failedConnectionIds);
        const fullAdj = this.buildStationAdjacency(stationConnections, new Set());
        const origDegree = new Map();
        for (const stId of allStationIds) {
            origDegree.set(stId, (fullAdj.get(stId) ?? new Set()).size);
        }
        const opAdj = this.buildStationAdjacency(stationConnections, failed);
        const currDegree = new Map();
        for (const stId of allStationIds) {
            currDegree.set(stId, (opAdj.get(stId) ?? new Set()).size);
        }
        const managedStations = this.bfs(opAdj, coreStationIds);
        const failureEndpoints = new Set();
        for (const conn of stationConnections) {
            if (failed.has(conn.id)) {
                failureEndpoints.add(conn.stationAId);
                failureEndpoints.add(conn.stationBId);
            }
        }
        const failureZone = failed.size > 0
            ? this.bfs(opAdj, [...failureEndpoints])
            : new Set();
        const stationStates = {};
        const isolatedStationIds = [];
        const degradingStationIds = [];
        const impactedStationIds = [];
        const normalStationIds = [];
        for (const stId of allStationIds) {
            let state;
            if (!managedStations.has(stId)) {
                state = 'ISOLATED';
            }
            else {
                const orig = origDegree.get(stId) ?? 0;
                const curr = currDegree.get(stId) ?? 0;
                if (curr < orig) {
                    state = 'DEGRADING';
                }
                else if (failureZone.has(stId)) {
                    state = 'IMPACTED';
                }
                else {
                    state = 'NORMAL';
                }
            }
            stationStates[stId] = state;
            if (state === 'ISOLATED')
                isolatedStationIds.push(stId);
            else if (state === 'DEGRADING')
                degradingStationIds.push(stId);
            else if (state === 'IMPACTED')
                impactedStationIds.push(stId);
            else
                normalStationIds.push(stId);
        }
        return {
            stationStates,
            isolatedStationIds,
            degradingStationIds,
            impactedStationIds,
            normalStationIds,
            stats: {
                total: allStationIds.length,
                normal: normalStationIds.length,
                degrading: degradingStationIds.length,
                impacted: impactedStationIds.length,
                isolated: isolatedStationIds.length,
            },
        };
    }
    simulateFailure(input) {
        return {
            unavailableStationPairs: [],
            isolatedEquipmentIds: [],
            impactedConnectionIds: [],
            remainingEquipmentCount: 0,
            remainingEdgeCount: 0,
        };
    }
};
exports.GraphService = GraphService;
exports.GraphService = GraphService = __decorate([
    (0, common_1.Injectable)()
], GraphService);
//# sourceMappingURL=graph.service.js.map