"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaDeleteError = handlePrismaDeleteError;
const common_1 = require("@nestjs/common");
function handlePrismaDeleteError(error, entityLabel) {
    if (error?.code === 'P2003') {
        throw new common_1.ConflictException(`Não é possível excluir este(a) ${entityLabel} porque existem registros vinculados a ele(a). Exclua-os primeiro.`);
    }
    throw error;
}
//# sourceMappingURL=prisma-errors.util.js.map