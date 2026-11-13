// apps/web/src/App.tsx
import type { Building, Entrance } from "field-app-contract/contract";
import { useEffect, useState } from "react";
import { EntranceForm } from "./EntranceForm";

const API = "http://localhost:3000";

function EntranceItem({
  building,
  entrance,
}: {
  building: Building | undefined;
  entrance: Entrance;
}) {
  return (
    <li>
      {entrance.street} {entrance.number}, {entrance.entranceName} (
      {building?.label ?? "no building"}) — {entrance.surveyStatus}
    </li>
  );
}

export default function App() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [entrances, setEntrances] = useState<Entrance[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    // Fetch buildings
    fetch(`${API}/api/buildings`)
      .then((res) => res.json())
      .then((data: Building[]) => {
        if (!ignore) {
          setBuildings(data);
        }
      })
      .catch((err: Error) => {
        if (!ignore) {
          setError(err.message);
        }
      });

    // Fetch entrances
    fetch(`${API}/api/entrances`)
      .then((res) => res.json())
      .then((data: Entrance[]) => {
        if (!ignore) {
          setEntrances(data);
        }
      })
      .catch((err: Error) => {
        if (!ignore) {
          setError(err.message);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main>
      <h1>Entrances</h1>
      <EntranceForm
        api={API}
        buildings={buildings}
        onCreated={(entrance) => setEntrances([...entrances, entrance])}
      />
      {error && <p role="alert">Could not load the data: {error}</p>}
      <ul>
        {entrances.map((entrance) => (
          <EntranceItem
            // the contract has no building name on an entrance: look it up
            building={buildings.find((b) => b.id === entrance.buildingId)}
            entrance={entrance}
            key={entrance.id}
          />
        ))}
      </ul>
    </main>
  );
}
