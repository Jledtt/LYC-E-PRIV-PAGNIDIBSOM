import type { Metadata } from "next";
import { getParentsDisponibles, getModeles, getHistorique } from "./actions";
import NotificationsClient from "./NotificationsClient";

export const metadata: Metadata = {
  title: "Notifications",
};

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const [parents, modeles, historique] = await Promise.all([
    getParentsDisponibles(),
    getModeles(),
    getHistorique(1),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 heading-serif mb-6">Notifications</h1>
      <NotificationsClient
        parentsInitiaux={parents}
        modelesInitiaux={modeles}
        historiqueInitial={historique}
      />
    </div>
  );
}
