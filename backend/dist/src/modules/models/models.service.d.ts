import { PrismaService } from '../../prisma.module';
import { CreateModelDto, UpdateModelDto } from './dto/model.dto';
export declare class ModelsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        manufacturer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        manufacturerId: string;
    })[]>;
    findOne(id: string): Promise<{
        manufacturer: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        manufacturerId: string;
    }>;
    create(dto: CreateModelDto): import(".prisma/client").Prisma.Prisma__ModelClient<{
        id: string;
        name: string;
        manufacturerId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateModelDto): Promise<{
        id: string;
        name: string;
        manufacturerId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        manufacturerId: string;
    }>;
}
