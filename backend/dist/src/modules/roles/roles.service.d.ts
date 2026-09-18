import { PrismaService } from '../../prisma.module';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    create(dto: CreateRoleDto): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateRoleDto): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        name: string;
        permissions: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
