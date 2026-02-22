import { DashboardHeader } from "@/components/dashboard-header";
import { MapPanel } from "@/components/map-panel";
import { ChartPanel } from "@/components/chart-panel";
import { DollarSign, Users, Briefcase } from "lucide-react";

const householdIncomeData = [
  { label: "ZIP 94301", value: 187500, maxValue: 200000 },
  { label: "ZIP 10021", value: 162300, maxValue: 200000 },
  { label: "ZIP 90210", value: 155800, maxValue: 200000 },
  { label: "ZIP 60614", value: 128400, maxValue: 200000 },
  { label: "ZIP 33139", value: 112700, maxValue: 200000 },
];

const populationInfluxData = [
  { label: "ZIP 85281", value: 14820, maxValue: 20000 },
  { label: "ZIP 78701", value: 12350, maxValue: 20000 },
  { label: "ZIP 37203", value: 11890, maxValue: 20000 },
  { label: "ZIP 28202", value: 9450, maxValue: 20000 },
  { label: "ZIP 83702", value: 8120, maxValue: 20000 },
];

const employedWorkersData = [
  { label: "ZIP 95054", value: 48200, maxValue: 60000 },
  { label: "ZIP 98052", value: 42800, maxValue: 60000 },
  { label: "ZIP 30308", value: 38500, maxValue: 60000 },
  { label: "ZIP 02142", value: 35100, maxValue: 60000 },
  { label: "ZIP 80202", value: 29700, maxValue: 60000 },
];

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <DashboardHeader />

      <main className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Left: US Map */}
        <section className="flex-[3] min-w-0">
          <MapPanel />
        </section>

        {/* Right: 3 stacked charts */}
        <aside className="flex flex-[1.2] min-w-0 flex-col gap-4">
          <div className="flex-1 min-h-0">
            <ChartPanel
              title="Median Household Income"
              subtitle="Top zip codes by annual income"
              icon={<DollarSign className="h-4 w-4" />}
              data={householdIncomeData}
              accentColor="bg-accent"
            />
          </div>

          <div className="flex-1 min-h-0">
            <ChartPanel
              title="Population Influx"
              subtitle="Net migration by zip code (annual)"
              icon={<Users className="h-4 w-4" />}
              data={populationInfluxData}
              accentColor="bg-amber-500"
            />
          </div>

          <div className="flex-1 min-h-0">
            <ChartPanel
              title="Employed Workers"
              subtitle="Active workforce per zip code"
              icon={<Briefcase className="h-4 w-4" />}
              data={employedWorkersData}
              accentColor="bg-emerald-500"
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
