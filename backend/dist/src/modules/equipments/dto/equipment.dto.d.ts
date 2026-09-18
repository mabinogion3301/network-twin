export declare enum EquipmentStatusDto {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    MAINTENANCE = "MAINTENANCE"
}
export declare class CreateEquipmentDto {
    name: string;
    stationId: string;
    typeId: string;
    manufacturerId?: string;
    modelId?: string;
    ip?: string;
    mac?: string;
    serial?: string;
    rack?: string;
    rackPosition?: string;
    portCount?: number;
    status?: EquipmentStatusDto;
}
export declare class UpdateEquipmentDto {
    name?: string;
    stationId?: string;
    typeId?: string;
    manufacturerId?: string;
    modelId?: string;
    ip?: string;
    mac?: string;
    serial?: string;
    rack?: string;
    rackPosition?: string;
    status?: EquipmentStatusDto;
}
export declare class EquipmentQueryDto {
    stationId?: string;
    typeId?: string;
    status?: EquipmentStatusDto;
    search?: string;
}
