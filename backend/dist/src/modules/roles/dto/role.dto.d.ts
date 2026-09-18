export declare class CreateRoleDto {
    name: string;
    permissions: Record<string, boolean>;
}
export declare class UpdateRoleDto {
    name?: string;
    permissions?: Record<string, boolean>;
}
