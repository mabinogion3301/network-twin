export declare enum ConnectionTypeDto {
    ELETRONORTE_CAPACITY = "ELETRONORTE_CAPACITY",
    TIM_CAPACITY = "TIM_CAPACITY",
    ELETROSUL_CAPACITY = "ELETROSUL_CAPACITY",
    ELETRONORTE_FIBER = "ELETRONORTE_FIBER",
    TIM_FIBER = "TIM_FIBER",
    ELETROSUL_FIBER = "ELETROSUL_FIBER",
    GVT_FIBER = "GVT_FIBER",
    CHESF_FIBER = "CHESF_FIBER",
    FURNAS_FIBER = "FURNAS_FIBER",
    PETROBRAS_FIBER = "PETROBRAS_FIBER",
    CEMIG_FIBER = "CEMIG_FIBER",
    TELEBRAS_FIBER = "TELEBRAS_FIBER",
    RNP_FIBER = "RNP_FIBER",
    PRODEPA_FIBER = "PRODEPA_FIBER",
    OTHER = "OTHER"
}
export declare enum ConnectionStatusDto {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    ALERT = "ALERT",
    DISABLED = "DISABLED"
}
export declare class CreateConnectionDto {
    name: string;
    sourcePortId: string;
    targetPortId: string;
    type: ConnectionTypeDto;
    distance?: number;
    fiberCount?: number;
    fibersUsed?: number;
    status?: ConnectionStatusDto;
    isBackup?: boolean;
}
export declare class UpdateConnectionDto {
    name?: string;
    type?: ConnectionTypeDto;
    distance?: number;
    fiberCount?: number;
    fibersUsed?: number;
    status?: ConnectionStatusDto;
    isBackup?: boolean;
}
export declare class ConnectionQueryDto {
    status?: ConnectionStatusDto;
    type?: ConnectionTypeDto;
    search?: string;
}
export declare class FailDto {
    connectionIdOrName: string;
}
