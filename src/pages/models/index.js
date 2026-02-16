import { useEffect, useState } from "react";
import AppShell from "@/components/shell/AppShell";
import ModelList from "@/components/models/ModelList";
import ModelParamsPanel from "@/components/models/ModelParamsPanel";
import RoutingTable from "@/components/models/RoutingTable";

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [params, setParams] = useState({});

  useEffect(() => {
    fetch("/api/models/available")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok) return;
        setModels((data.models || []).map((item) => ({ name: item.model, provider: item.provider })));
        setRoutes((data.routes || []).map((item, idx) => ({ id: item.id || idx + 1, ...item })));
        setParams(data.params || {});
      })
      .catch(() => {});
  }, []);

  return (
    <AppShell title="Models" subtitle="Routing and parameters">
      <div className="space-y-3">
        <ModelList models={models} />
        <RoutingTable rows={routes} />
        <ModelParamsPanel params={params} />
      </div>
    </AppShell>
  );
}
