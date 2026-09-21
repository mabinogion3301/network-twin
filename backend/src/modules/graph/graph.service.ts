import { Injectable } from '@nestjs/common';
import {
  GraphEdgeInput,
  ImpactAnalysisInput,
  ImpactAnalysisResult,
  SimulateFailureInput,
  SimulateFailureResult,
  StationImpactState,
} from './graph.types';

@Injectable()
export class GraphService {

  // ──────────────────────────────────────────────────────────────────────────
  // Novo motor: análise de impacto baseada em grafo de estações + BFS a partir
  // dos pontos de gerenciamento (CORE). Implementa os 4 estados do spec:
  //   NORMAL    – conectividade e redundância preservadas
  //   DEGRADING – perdeu redundância mas ainda alcança pelo menos 1 CORE
  //   IMPACTED  – redundância intacta mas está na mesma zona de impacto de uma falha
  //   ISOLATED  – nenhum caminho funcional até qualquer CORE
  // ──────────────────────────────────────────────────────────────────────────

  /** Constrói grafo de adjacência entre estações, ignorando conexões falhas. */
  private buildStationAdjacency(
    connections: { id: string; stationAId: string; stationBId: string }[],
    failedIds: Set<string>,
  ): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>();
    for (const conn of connections) {
      if (failedIds.has(conn.id)) continue;
      if (conn.stationAId === conn.stationBId) continue;
      if (!adj.has(conn.stationAId)) adj.set(conn.stationAId, new Set());
      if (!adj.has(conn.stationBId)) adj.set(conn.stationBId, new Set());
      adj.get(conn.stationAId)!.add(conn.stationBId);
      adj.get(conn.stationBId)!.add(conn.stationAId);
    }
    return adj;
  }

  /** BFS a partir de múltiplas fontes — retorna conjunto de nós alcançáveis. */
  private bfs(adj: Map<string, Set<string>>, sources: string[]): Set<string> {
    const visited = new Set<string>(sources);
    const queue = [...sources];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const neighbor of (adj.get(curr) ?? new Set<string>())) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return visited;
  }

  computeImpact(input: ImpactAnalysisInput): ImpactAnalysisResult {
    const { stationConnections, allStationIds, coreStationIds, failedConnectionIds } = input;
    const failed = new Set(failedConnectionIds);

    // 1. Grafo COMPLETO (sem falhas) → grau original de cada estação
    const fullAdj = this.buildStationAdjacency(stationConnections, new Set());
    const origDegree = new Map<string, number>();
    for (const stId of allStationIds) {
      origDegree.set(stId, (fullAdj.get(stId) ?? new Set()).size);
    }

    // 2. Grafo OPERACIONAL (falhas removidas) → grau atual + alcançabilidade
    const opAdj = this.buildStationAdjacency(stationConnections, failed);
    const currDegree = new Map<string, number>();
    for (const stId of allStationIds) {
      currDegree.set(stId, (opAdj.get(stId) ?? new Set()).size);
    }

    // 3. BFS a partir de TODOS os COREs simultaneamente → quem ainda é gerenciado
    const managedStations = this.bfs(opAdj, coreStationIds);

    // 4. Zona de impacto: tudo que está conectado às pontas de uma falha
    //    Ex: A-B rompido → A e B são pontas → BFS a partir deles identifica
    //    todo o anel afetado, mesmo que ainda gerenciado por outro caminho.
    const failureEndpoints = new Set<string>();
    for (const conn of stationConnections) {
      if (failed.has(conn.id)) {
        failureEndpoints.add(conn.stationAId);
        failureEndpoints.add(conn.stationBId);
      }
    }
    const failureZone = failed.size > 0
      ? this.bfs(opAdj, [...failureEndpoints])
      : new Set<string>();

    // 5. Classifica cada estação
    const stationStates: Record<string, StationImpactState> = {};
    const isolatedStationIds: string[] = [];
    const degradingStationIds: string[] = [];
    const impactedStationIds: string[] = [];
    const normalStationIds: string[] = [];

    for (const stId of allStationIds) {
      let state: StationImpactState;

      if (!managedStations.has(stId)) {
        // Sem caminho até nenhum CORE → ISOLADA
        state = 'ISOLATED';
      } else {
        const orig = origDegree.get(stId) ?? 0;
        const curr = currDegree.get(stId) ?? 0;

        if (curr < orig) {
          // Perdeu pelo menos uma conexão → DEGRADANDO
          state = 'DEGRADING';
        } else if (failureZone.has(stId)) {
          // Redundância intacta mas está na zona de impacto de uma falha → IMPACTADA
          state = 'IMPACTED';
        } else {
          state = 'NORMAL';
        }
      }

      stationStates[stId] = state;
      if (state === 'ISOLATED') isolatedStationIds.push(stId);
      else if (state === 'DEGRADING') degradingStationIds.push(stId);
      else if (state === 'IMPACTED') impactedStationIds.push(stId);
      else normalStationIds.push(stId);
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

  // ──────────────────────────────────────────────────────────────────────────
  // Método legado mantido para não quebrar nada que ainda o referencie
  // ──────────────────────────────────────────────────────────────────────────
  simulateFailure(input: SimulateFailureInput): SimulateFailureResult {
    return {
      unavailableStationPairs: [],
      isolatedEquipmentIds: [],
      impactedConnectionIds: [],
      remainingEquipmentCount: 0,
      remainingEdgeCount: 0,
    };
  }
}
