export declare enum StationStatusDto {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    MAINTENANCE = "MAINTENANCE"
}
export declare class CreateStationDto {
    name: string;
    city: string;
    state: string;
    latitude?: number;
    longitude?: number;
    mapPositionX?: number;
    mapPositionY?: number;
    notes?: string;
    trechos?: string[];
    status?: StationStatusDto;
}
export declare class UpdateStationDto {
    name?: string;
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    mapPositionX?: number;
    mapPositionY?: number;
    notes?: string;
    trechos?: string[];
    status?: StationStatusDto;
}
export declare class StationQueryDto {
    city?: string;
    state?: string;
    status?: StationStatusDto;
    search?: string;
}
