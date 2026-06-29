import { Injectable } from '@nestjs/common';
import {
  GraphEdgeInput,
  SimulateFailureInput,
  SimulateFailureResult,
} from './graph.types';

interface AdjacencyEntry {
  neighbor: string;
  connectionId: string;
}

@Injectable()
export class GraphService {
  /**
   * Constrói a lista de adjacência: equipmentId -> lista de { vizinho, connectionId }.
   */
  private buildAdjacency(edges: GraphEdgeInput[]): Map<string, AdjacencyEntry[]> {
    const adjacency = new Map<string, AdjacencyEntry[]>();

    const addEntry = (from: string, to: string, connectionId: string) => {
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

  /**
   * BFS clássico: calcula em qual "componente conectado" cada nó está.
   * Nós no mesmo componente conseguem se comunicar entre si (existe caminho).
   */
  private connectedComponents(nodes: string[], adjacency: Map<string, AdjacencyEntry[]>): Map<string, number> {
    const componentOf = new Map<string, number>();
    let componentId = 0;

    for (const start of nodes) {
      if (componentOf.has(start)) continue;

      const queue: string[] = [start];
      componentOf.set(start, componentId);

      while (queue.length > 0) {
        const current = queue.shift()!;
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

  /**
   * Núcleo da simulação de falha.
   *
   * Estratégia (conforme definido com o usuário):
   * - A disponibilidade é avaliada por PAR DE ESTAÇÕES que possuem um
   *   StationLink (vínculo direto cadastrado) entre si.
   * - Um par só é considerado "indisponível" se, depois de remover a
   *   conexão/equipamento informado, NÃO existir mais nenhum caminho (direto
   *   ou via outros equipamentos/estações) entre qualquer equipamento da
   *   Estação A e qualquer equipamento da Estação B.
   * - Se existir caminho redundante, o par continua disponível — isso é uma
   *   propriedade emergente do BFS, não precisa de lógica extra.
   */
  simulateFailure(input: SimulateFailureInput): SimulateFailureResult {
    const {
      allEquipmentIds,
      equipmentToStation,
      allEdges,
      directStationLinks,
      removedConnectionIds,
      removedEquipmentIds,
    } = input;

    const removedEquipmentSet = new Set(removedEquipmentIds);
    const removedConnectionSet = new Set(removedConnectionIds);

    const remainingEdges = allEdges.filter(
      (edge) =>
        !removedConnectionSet.has(edge.connectionId) &&
        !removedEquipmentSet.has(edge.equipmentA) &&
        !removedEquipmentSet.has(edge.equipmentB),
    );

    const remainingEquipmentIds = allEquipmentIds.filter((id) => !removedEquipmentSet.has(id));

    const adjacency = this.buildAdjacency(remainingEdges);
    const componentOf = this.connectedComponents(remainingEquipmentIds, adjacency);

    // Agrupa os equipamentos restantes de cada estação, e quais componentes
    // eles ocupam após a falha.
    const stationToComponents = new Map<string, Set<number>>();
    const stationToEquipmentCount = new Map<string, number>();

    for (const equipmentId of remainingEquipmentIds) {
      const stationId = equipmentToStation[equipmentId];
      const comp = componentOf.get(equipmentId);
      if (stationId === undefined || comp === undefined) continue;

      if (!stationToComponents.has(stationId)) stationToComponents.set(stationId, new Set());
      stationToComponents.get(stationId)!.add(comp);

      stationToEquipmentCount.set(stationId, (stationToEquipmentCount.get(stationId) ?? 0) + 1);
    }

    // Para cada vínculo direto entre estações, verifica se ainda compartilham
    // algum componente (ou seja, ainda existe caminho entre elas).
    const unavailableStationPairs = directStationLinks
      .filter((link) => {
        const compsA = stationToComponents.get(link.stationAId) ?? new Set<number>();
        const compsB = stationToComponents.get(link.stationBId) ?? new Set<number>();
        const stillConnected = [...compsA].some((c) => compsB.has(c));
        return !stillConnected;
      })
      .map((link) => ({ linkId: link.linkId, stationAId: link.stationAId, stationBId: link.stationBId }));

    // Equipamento isolado = nenhum outro equipamento de OUTRA estação está no
    // mesmo componente que ele.
    const isolatedEquipmentIds = remainingEquipmentIds.filter((equipmentId) => {
      const myComponent = componentOf.get(equipmentId);
      const myStation = equipmentToStation[equipmentId];

      return !remainingEquipmentIds.some((otherId) => {
        if (otherId === equipmentId) return false;
        return (
          componentOf.get(otherId) === myComponent && equipmentToStation[otherId] !== myStation
        );
      });
    });

    // Conexões removidas que não têm caminho alternativo entre os
    // equipamentos que ligavam diretamente são reportadas como impactadas.
    const impactedConnectionIds = allEdges
      .filter((edge) => removedConnectionSet.has(edge.connectionId))
      .filter((edge) => {
        const stillReachable =
          !removedEquipmentSet.has(edge.equipmentA) &&
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
}
