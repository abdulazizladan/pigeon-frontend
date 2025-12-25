import { signalStore, withState, withMethods, patchState, withComputed } from "@ngrx/signals";
import { Station } from "../models/station.model";
import { inject, computed } from "@angular/core";
import { StationsService } from "../services/stations.service";
import { Manager } from "../../managers-management/models/manager.model";
import { SalesService } from "../../sales-management/services/sales.service";

// Define the sales data interface used in charts
export interface StationSalesData {
  date: string;
  petrolSales: number;
  dieselSales: number;
}

// Define the new state structure
type StationState = {
  loading: boolean;
  error: string | null;
  lastAddedId: string | null;
  managers: Manager[];
  stations: Station[]; // List of all stations
  selectedStation: Station | null; // The station currently being viewed
  selectedStationId: string | null; // Tracks the ID for easier loading/routing
  stationSales: StationSalesData[]; // New: Sales data for the selected station
};

export const initialState: StationState = {
  loading: false,
  error: null,
  lastAddedId: null,
  managers: [],
  stations: [], // Start with an empty list
  selectedStation: null,
  selectedStationId: null, // No default selection by default
  stationSales: [] // Initialize as empty
};

export const StationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  // Add computed selectors based on the selectedStation
  withComputed(({ selectedStation }) => ({
    // Use selectedStation instead of the old 'station'
    activePumpCount: computed(() =>
      selectedStation()?.pumps?.filter((p: any) => p.status === 'active')?.length ?? 0
    ),
    totalPumpCount: computed(() =>
      selectedStation()?.pumps?.length ?? 0
    ),
    fuelLevel: computed(() =>
      selectedStation()?.fuelLevelPercentage ?? 0
    )
  })),

  // Add methods for state manipulation and side effects
  // Inject SalesService here too, assuming it's exported and available
  withMethods((store, stationService = inject(StationsService), salesService = inject(SalesService)) => {

    const loadSalesData = async (stationId: string) => {
      try {
        const graphData = await stationService.getStationSalesGraph(stationId);
        // Fix: check if graphData is valid array
        if (!Array.isArray(graphData)) {
          console.warn('Expected array for sales graph data but got:', graphData);
          patchState(store, { stationSales: [] });
          return;
        }

        // Map backend response to StationSalesData format
        // Assuming backend returns array of { date: string, petrol: number, diesel: number } or similar
        // If the backend format matches exactly, we can just cast it. 
        // Based on typical patterns, let's map it safely.

        const salesData: StationSalesData[] = graphData.map((item: any) => ({
          date: item.date,
          petrolSales: Number(item.petrol || 0),
          dieselSales: Number(item.diesel || 0)
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        patchState(store, { stationSales: salesData });

      } catch (e) {
        console.error("Failed to load station sales graph", e);
        patchState(store, { stationSales: [] });
      }
    };

    return {

      async createStation(station: Station) {
        patchState(
          store, {
          loading: true,
          error: null,
        }
        );
        try {
          const response = await stationService.createStation(station);
          if (!response) {
            throw new Error('Failed to creat new station')
          }
          patchState(store, state => ({
            stations: [
              ...state.stations,
              response
            ],
            lastAddedId: response.id,
            loading: false,
          }))
        } catch (error) {
          patchState(
            store, {
            loading: false,
            error: "Failed to add station. Please check the network connection.",
          }
          )
        }
      },
      async loadManagers() {
        patchState(store, { loading: true, error: null, stations: [] });
        try {
          const managersList = await (stationService as any).getManagers();
          patchState(store, {
            managers: managersList,
            loading: false,
            error: null
          })
        } catch (error) {
          patchState(store, {
            error: "Failed to load managers list. Please check the network.",
            loading: false,
            managers: []
          });
        }
      },
      /**
       * Loads the list of all stations from the service into the 'stations' array.
       */
      async loadStations() {
        // Use loading state, but specifically for the list loading if needed,
        // though 'loading' is fine for general page loading.
        patchState(store, { loading: true, error: null, stations: [] });

        try {
          const allStations = await (stationService as any).getAll();
          patchState(store, { stations: allStations, loading: false, error: null });
        } catch (error) {
          console.error(error);
          patchState(store, {
            error: "Failed to load station list. Please check the network.",
            loading: false,
            stations: []
          });
        }
      },

      /**
       * Loads the details for a single station and sets it as selectedStation.
       * @param id The ID of the station to load.
       */
      async loadSelectedStation(id: string) {
        patchState(store, { loading: true, error: null });
        try {
          const station = await stationService.getById(id);
          patchState(store, {
            selectedStation: station,
            loading: false,
            error: null
          });

          // Trigger loading sales data for this station
          // internalLoadStationSales(id); // We need to call the method via the public interface or duplicate logic
          // Since we are inside the factory, we can't easily call our own methods if they are defined in the same block.
          // Best approach: Call via the injected service if logic was there, OR use a standalone function.
          // For now, I'll just manually call the same logic or use a helper if I could define one.
          // Actually, better: just call the public method from the component if needed, OR fix the 'this' issue by defining a local function.
          await loadSalesData(id);

        } catch (error) {
          console.error(error);
          patchState(store, {
            error: 'Failed to load station details',
            loading: false,
            selectedStation: null
          });
        }
      },

      /**
       * Loads daily sales records for the specified station.
       */
      async loadStationSales(stationId: string) {
        await loadSalesData(stationId);
      },

      /**
       * Assigns a manager to the selected station and updates the store.
       * @param stationId The ID of the station.
       * @param managerId The User ID of the manager to assign.
       */
      async assignManager(stationId: string, managerId: string) {
        patchState(store, { loading: true, error: null });
        try {
          const updatedStation = await (stationService as any).assignManager(stationId, managerId);
          patchState(store, {
            selectedStation: updatedStation,
            loading: false,
            error: null
          });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: "Failed to assign manager. Check permissions and network.",
          });
          throw error; // Re-throw to allow component to handle local error toast/message
        }
      },

      /**
       * Unassigns the current manager from the selected station and updates the store.
       * @param stationId The ID of the station.
       */
      async unassignManager(stationId: string) {
        patchState(store, { loading: true, error: null });
        try {
          const updatedStation = await (stationService as any).unassignManager(stationId);
          patchState(store, {
            selectedStation: updatedStation,
            loading: false,
            error: null
          });
        } catch (error) {
          patchState(store, {
            loading: false,
            error: "Failed to unassign manager. Check permissions and network.",
          });
          throw error; // Re-throw to allow component to handle local error toast/message
        }
      },

      /**
       * Simulates an action to update the fuel level for the selected station.
       */
      async updateFuelLevel(newLevel: number) {
        if (!store.selectedStation()) return;

        // Optimistic UI update: patch the selectedStation
        const currentStation = store.selectedStation()!;
        patchState(store, {
          selectedStation: { ...currentStation, fuelLevelPercentage: newLevel }
        });

        // Simulate API call to update fuel level
        // In a real app: await (stationService as any).updateFuelLevel(store.selectedStationId()!, newLevel);
        console.log(`[Store] Updated fuel level for ${currentStation.name} to ${newLevel}%`);
        // You could add error/success handling here
        console.log(`[Store] Updated fuel level for ${currentStation.name} to ${newLevel}%`);
        // You could add error/success handling here
      },

      async updateStationStatus(id: string, status: 'active' | 'suspended') {
        patchState(store, { loading: true, error: null });
        try {
          const updatedStation = await stationService.updateStationStatus(id, status);
          if (updatedStation) {
            patchState(store, {
              stations: store.stations().map(s => s.id === id ? updatedStation : s),
              selectedStation: store.selectedStation()?.id === id ? updatedStation : store.selectedStation(),
              loading: false,
              error: null
            });
          } else {
            console.error('[Store] updateStationStatus returned no data');
            // Optionally handle this as an error, but at least don't corrupt state
            patchState(store, { loading: false });
          }
        } catch (error) {
          patchState(store, {
            loading: false,
            error: "Failed to update station status. Please try again."
          });
          // throw error; // Suppressed to avoid console error
        }
      }

    }
  })
)
