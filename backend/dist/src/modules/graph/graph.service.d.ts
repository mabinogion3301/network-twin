import { SimulateFailureInput, SimulateFailureResult } from './graph.types';
export declare class GraphService {
    private buildAdjacency;
    private connectedComponents;
    simulateFailure(input: SimulateFailureInput): SimulateFailureResult;
}
