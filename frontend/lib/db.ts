import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

const auditedModels = new Set(['Matter', 'MatterMessage', 'Task', 'Contract', 'Invoice', 'Document', 'Hearing']);

prisma.$use(async (params, next) => {
  const result = await next(params);
  if (!auditedModels.has(params.model || '') || !['create', 'update', 'delete'].includes(params.action)) return result;

  const tenantId = result?.tenantId || params.args?.data?.tenantId;
  if (!tenantId) return result;

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: null,
      action: `${params.model!.toLowerCase()}.${params.action}`,
      entityType: params.model!,
      entityId: result?.id || params.args?.where?.id || null,
      metadata: JSON.stringify({ source: 'prisma-middleware' }),
    },
  });
  return result;
});
