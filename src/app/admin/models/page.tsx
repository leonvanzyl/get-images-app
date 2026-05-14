import { ModelsPageClient } from "@/components/admin/models-page-client";
import { requireAdmin } from "@/lib/admin-session";
import { listModelsForAdmin } from "@/services/admin/queries";

export default async function AdminModelsPage() {
  await requireAdmin();
  const rows = await listModelsForAdmin();

  return (
    <div className="px-8 py-10 md:px-12 md:py-12">
      <ModelsPageClient
        rows={rows.map((row) => ({
          id: row.id,
          modelId: row.modelId,
          providerId: row.providerId,
          providerModelId: row.providerModelId,
          name: row.name,
          description: row.description,
          aspectRatios: row.aspectRatios,
          thinkingDefault: row.thinkingDefault,
          thinkingHigh: row.thinkingHigh,
          creditCost: row.creditCost,
          thinkingHighCreditCost: row.thinkingHighCreditCost,
          isActive: row.isActive,
          sortOrder: row.sortOrder,
        }))}
      />
    </div>
  );
}
