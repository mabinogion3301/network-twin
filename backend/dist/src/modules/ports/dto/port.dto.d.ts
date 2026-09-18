export declare enum PortTypeDto {
    RJ45 = "RJ45",
    SFP = "SFP",
    SFP_PLUS = "SFP_PLUS",
    QSFP = "QSFP",
    FIBER = "FIBER",
    OTHER = "OTHER"
}
export declare enum PortStatusDto {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    DISABLED = "DISABLED",
    ALERT = "ALERT"
}
export declare class CreatePortDto {
    equipmentId: string;
    number: number;
    name?: string;
    type: PortTypeDto;
    speed?: string;
    status?: PortStatusDto;
}
export declare class UpdatePortDto {
    number?: number;
    name?: string;
    type?: PortTypeDto;
    speed?: string;
    status?: PortStatusDto;
}
export declare class PortQueryDto {
    equipmentId?: string;
    status?: PortStatusDto;
}
