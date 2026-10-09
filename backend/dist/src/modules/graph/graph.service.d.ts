import { ImpactAnalysisInput, ImpactAnalysisResult, SimulateFailureInput, SimulateFailureResult } from './graph.types';
export declare class GraphService {
    private buildStationAdjacency;
    private bfs;
    computeImpact(input: ImpactAnalysisInput): ImpactAnalysisResult;
    simulateFailure(input: SimulateFailureInput): SimulateFailureResult;
}
