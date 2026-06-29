import { ConflictException } from '@nestjs/common';

/**
 * Prisma lança o erro P2003 quando uma exclusão viola uma chave estrangeira
 * (ex: tentar excluir uma Estação que ainda tem Equipamentos vinculados).
 * Sem isso, o usuário veria um erro 500 genérico sem explicação.
 */
export function handlePrismaDeleteError(error: any, entityLabel: string): never {
  if (error?.code === 'P2003') {
    throw new ConflictException(
      `Não é possível excluir este(a) ${entityLabel} porque existem registros vinculados a ele(a). Exclua-os primeiro.`,
    );
  }
  throw error;
}
