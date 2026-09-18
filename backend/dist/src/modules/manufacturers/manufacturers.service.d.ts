import { PrismaService } from '../../prisma.module';
import { CreateManufacturerDto, UpdateManufacturerDto } from './dto/manufacturer.dto';
export declare class ManufacturersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        models: {
            id: string;
            name: string;
            manufacturerId: string;
        }[];
    } & {
        id: string;
        name: string;
    })[]>;
    findOne(id: string): Promise<{
        models: {
            id: string;
            name: string;
            manufacturerId: string;
        }[];
    } & {
        id: string;
        name: string;
    }>;
    create(dto: CreateManufacturerDto): import(".prisma/client").Prisma.Prisma__ManufacturerClient<{
        id: string;
        name: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateManufacturerDto): Promise<{
        id: string;
        name: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
    }>;
}
