import { KeyManagementClient } from "@/components/keys/key-management-client";
import { listApiKeysAction } from "./actions";

export default async function ApiKeysPage() {
  const initialKeys = await listApiKeysAction();

  return <KeyManagementClient initialKeys={initialKeys} />;
}
