import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma.module';

/**
 * Intercepta toda mutação (POST/PATCH/PUT/DELETE) feita nos controllers que
 * expõem metadata `auditEntity` (ver decorator @AuditEntity) e grava um
 * registro em AuditLog com quem fez, o quê, e o resultado da operação.
 *
 * Não tenta computar diff campo-a-campo (isso exigiria carregar o estado
 * anterior em todo update) — guarda o payload enviado e o resultado retornado,
 * o que já é suficiente para auditoria/rastreabilidade.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method as string;
    const mutating = ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method);

    if (!mutating) return next.handle();

    const entityType = context.getClass().name.replace('Controller', '');
    const user = request.user;
    const body = request.body;
    const paramId = request.params?.id;

    return next.handle().pipe(
      tap((result) => {
        if (!user?.sub) return; // sem usuário autenticado, não há o que auditar (ex.: login)

        const action = method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
        const entityId = result?.id ?? paramId ?? 'unknown';

        this.prisma.auditLog
          .create({
            data: {
              entityType,
              entityId,
              action,
              userId: user.sub,
              diffJson: { input: body ?? null, result: result ?? null },
            },
          })
          .catch((err) => {
            // auditoria nunca deve quebrar a resposta principal ao usuário
            console.error('Falha ao gravar AuditLog:', err);
          });
      }),
    );
  }
}
