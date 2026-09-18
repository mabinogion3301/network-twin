export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    roleId: string;
}
export declare class UpdateUserDto {
    name?: string;
    roleId?: string;
    active?: boolean;
    newPassword?: string;
}
