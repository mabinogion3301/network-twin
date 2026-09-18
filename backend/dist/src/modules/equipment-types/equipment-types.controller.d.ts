import { EquipmentTypesService } from './equipment-types.service';
import { CreateEquipmentTypeDto, UpdateEquipmentTypeDto } from './dto/equipment-type.dto';
export declare class EquipmentTypesController {
    private service;
    constructor(service: EquipmentTypesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        name: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
    }>;
    create(dto: CreateEquipmentTypeDto): import(".prisma/client").Prisma.Prisma__EquipmentTypeClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateEquipmentTypeDto): Promise<{
        id: string;
        name: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
    }>;
}
