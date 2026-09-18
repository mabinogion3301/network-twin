"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graph_service_1 = require("./graph.service");
describe('GraphService', () => {
    let service;
    beforeEach(() => {
        service = new graph_service_1.GraphService();
    });
    it('marca o par de estações como indisponível quando o único link cai', () => {
        const result = service.simulateFailure({
            allEquipmentIds: ['eqA', 'eqB'],
            equipmentToStation: { eqA: 'stA', eqB: 'stB' },
            allEdges: [{ connectionId: 'conn1', equipmentA: 'eqA', equipmentB: 'eqB' }],
            directStationLinks: [{ linkId: 'link1', stationAId: 'stA', stationBId: 'stB' }],
            removedConnectionIds: ['conn1'],
            removedEquipmentIds: [],
        });
        expect(result.unavailableStationPairs).toEqual([
            { linkId: 'link1', stationAId: 'stA', stationBId: 'stB' },
        ]);
        expect(result.isolatedEquipmentIds.sort()).toEqual(['eqA', 'eqB']);
        expect(result.impactedConnectionIds).toEqual(['conn1']);
    });
    it('NÃO marca como indisponível quando existe um caminho redundante', () => {
        const result = service.simulateFailure({
            allEquipmentIds: ['eqA', 'eqB', 'eqC'],
            equipmentToStation: { eqA: 'stA', eqB: 'stB', eqC: 'stB' },
            allEdges: [
                { connectionId: 'conn1', equipmentA: 'eqA', equipmentB: 'eqB' },
                { connectionId: 'conn2', equipmentA: 'eqA', equipmentB: 'eqC' },
                { connectionId: 'conn3', equipmentA: 'eqB', equipmentB: 'eqC' },
            ],
            directStationLinks: [{ linkId: 'link1', stationAId: 'stA', stationBId: 'stB' }],
            removedConnectionIds: ['conn1'],
            removedEquipmentIds: [],
        });
        expect(result.unavailableStationPairs).toEqual([]);
        expect(result.isolatedEquipmentIds).toEqual([]);
        expect(result.impactedConnectionIds).toEqual([]);
    });
    it('detecta múltiplas estações indisponíveis em uma topologia maior', () => {
        const result = service.simulateFailure({
            allEquipmentIds: ['eqA', 'eqB', 'eqC'],
            equipmentToStation: { eqA: 'stA', eqB: 'stB', eqC: 'stC' },
            allEdges: [
                { connectionId: 'connAB', equipmentA: 'eqA', equipmentB: 'eqB' },
                { connectionId: 'connBC', equipmentA: 'eqB', equipmentB: 'eqC' },
            ],
            directStationLinks: [
                { linkId: 'linkAB', stationAId: 'stA', stationBId: 'stB' },
                { linkId: 'linkBC', stationAId: 'stB', stationBId: 'stC' },
                { linkId: 'linkAC', stationAId: 'stA', stationBId: 'stC' },
            ],
            removedConnectionIds: ['connBC'],
            removedEquipmentIds: [],
        });
        expect(result.unavailableStationPairs.map((p) => p.linkId).sort()).toEqual(['linkAC', 'linkBC']);
    });
    it('marca equipamento como isolado quando falha de equipamento o desconecta de tudo', () => {
        const result = service.simulateFailure({
            allEquipmentIds: ['eqA', 'eqB', 'eqC'],
            equipmentToStation: { eqA: 'stA', eqB: 'stB', eqC: 'stB' },
            allEdges: [
                { connectionId: 'conn1', equipmentA: 'eqA', equipmentB: 'eqB' },
                { connectionId: 'conn2', equipmentA: 'eqB', equipmentB: 'eqC' },
            ],
            directStationLinks: [],
            removedConnectionIds: [],
            removedEquipmentIds: ['eqB'],
        });
        expect(result.isolatedEquipmentIds.sort()).toEqual(['eqA', 'eqC']);
    });
});
//# sourceMappingURL=graph.service.spec.js.map