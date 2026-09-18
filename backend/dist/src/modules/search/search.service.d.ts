import { PrismaService } from '../../prisma.module';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    search(query: string): Promise<{
        stations: {
            id: string;
            name: string;
            createdAt: Date;
            city: string;
            state: string;
            latitude: number | null;
            longitude: number | null;
            mapPositionX: number | null;
            mapPositionY: number | null;
            notes: string | null;
            trechos: string[];
            status: import(".prisma/client").$Enums.StationStatus;
            updatedAt: Date;
        }[];
        equipments: ({
            station: {
                id: string;
                name: string;
                createdAt: Date;
                city: string;
                state: string;
                latitude: number | null;
                longitude: number | null;
                mapPositionX: number | null;
                mapPositionY: number | null;
                notes: string | null;
                trechos: string[];
                status: import(".prisma/client").$Enums.StationStatus;
                updatedAt: Date;
            };
        } & {
            id: string;
            name: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.EquipmentStatus;
            updatedAt: Date;
            stationId: string;
            typeId: string;
            manufacturerId: string | null;
            modelId: string | null;
            ip: string | null;
            mac: string | null;
            serial: string | null;
            rack: string | null;
            rackPosition: string | null;
            portCount: number;
        })[];
        connections: {
            id: string;
            name: string;
            createdAt: Date;
            status: import(".prisma/client").$Enums.ConnectionStatus;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.ConnectionType;
            sourcePortId: string;
            targetPortId: string;
            distance: number | null;
            fiberCount: number | null;
            fibersUsed: number | null;
            isBackup: boolean;
        }[];
        ports: ({
            equipment: {
                id: string;
                name: string;
                createdAt: Date;
                status: import(".prisma/client").$Enums.EquipmentStatus;
                updatedAt: Date;
                stationId: string;
                typeId: string;
                manufacturerId: string | null;
                modelId: string | null;
                ip: string | null;
                mac: string | null;
                serial: string | null;
                rack: string | null;
                rackPosition: string | null;
                portCount: number;
            };
        } & {
            number: number;
            id: string;
            name: string | null;
            status: import(".prisma/client").$Enums.PortStatus;
            type: import(".prisma/client").$Enums.PortType;
            equipmentId: string;
            speed: string | null;
        })[];
    }>;
}
