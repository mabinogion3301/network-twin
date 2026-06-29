import { GraphService } from './graph.service';

describe('GraphService', () => {
  let service: GraphService;

  beforeEach(() => {
    service = new GraphService();
  });

  it('marca o par de estações como indisponível quando o único link cai', () => {
    // EquipA (StationA) --- conn1 --- EquipB (StationB)
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
    // EquipA -- conn1 -- EquipB (StationB), e EquipA -- conn2 -- EquipC (StationB também)
    // Ou seja, StationA e StationB têm 2 caminhos: se conn1 cair, conn2 ainda liga.
    const result = service.simulateFailure({
      allEquipmentIds: ['eqA', 'eqB', 'eqC'],
      equipmentToStation: { eqA: 'stA', eqB: 'stB', eqC: 'stB' },
      allEdges: [
        { connectionId: 'conn1', equipmentA: 'eqA', equipmentB: 'eqB' },
        { connectionId: 'conn2', equipmentA: 'eqA', equipmentB: 'eqC' },
        { connectionId: 'conn3', equipmentA: 'eqB', equipmentB: 'eqC' }, // mantém B e C juntos
      ],
      directStationLinks: [{ linkId: 'link1', stationAId: 'stA', stationBId: 'stB' }],
      removedConnectionIds: ['conn1'],
      removedEquipmentIds: [],
    });

    expect(result.unavailableStationPairs).toEqual([]);
    expect(result.isolatedEquipmentIds).toEqual([]);
    // conn1 caiu, mas como ainda há caminho (via eqC), não é reportada como impactada
    expect(result.impactedConnectionIds).toEqual([]);
  });

  it('detecta múltiplas estações indisponíveis em uma topologia maior', () => {
    // stA -- stB -- stC, todos ligados em linha única (sem redundância)
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
        { linkId: 'linkAC', stationAId: 'stA', stationBId: 'stC' }, // vínculo lógico, sem rota direta
      ],
      removedConnectionIds: ['connBC'],
      removedEquipmentIds: [],
    });

    // connBC caiu: stB perde stC. Como stA-stC dependia de passar por stB, também cai.
    expect(result.unavailableStationPairs.map((p) => p.linkId).sort()).toEqual(['linkAC', 'linkBC']);
    // linkAB não é afetado, pois stA e stB continuam no mesmo componente
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
      removedEquipmentIds: ['eqB'], // remove o equipamento que fazia a ponte
    });

    // eqA fica sozinho (stA), eqC fica sozinho (stB) — ambos isolados
    expect(result.isolatedEquipmentIds.sort()).toEqual(['eqA', 'eqC']);
  });
});
