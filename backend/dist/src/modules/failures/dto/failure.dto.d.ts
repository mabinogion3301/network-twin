export declare enum FailureTypeDto {
    MANAGEMENT_FAILURE = "MANAGEMENT_FAILURE",
    OVERHEATING = "OVERHEATING",
    POWER_FAILURE = "POWER_FAILURE",
    EQUIPMENT_UNAVAILABLE = "EQUIPMENT_UNAVAILABLE",
    NODE_RUPTURE = "NODE_RUPTURE",
    NODE_ATTENUATION = "NODE_ATTENUATION"
}
export declare enum FailureTargetTypeDto {
    STATION = "STATION",
    CONNECTION = "CONNECTION"
}
export declare enum FailureSeverityDto {
    CRITICAL = "CRITICAL",
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}
export declare class CreateFailureDto {
    type: FailureTypeDto;
    targetType: FailureTargetTypeDto;
    targetId: string;
    targetName: string;
    severity?: FailureSeverityDto;
    note?: string;
}
export declare class UpdateNoteDto {
    note: string;
}
