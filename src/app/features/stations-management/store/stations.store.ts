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
  withMethods((store, stationService = inject(StationsService), salesService = inject(SalesService)) => ({

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
      patchState(
        store, {
        loading: true,
        error: null
      }
      );
      try {
        const station = await (stationService as any).getById(id);
        patchState(store, {
          selectedStation: station,
          loading: false,
          error: null
        });

        // Trigger loading sales data for this station
        this.loadStationSales(id);

      } catch (error) {
        console.error(error);
        patchState(
          store, {
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
      // We can maybe introduce a separate loading flag 'salesLoading' if needed,
      // but for now re-using main loading or doing it silently is fine.
      try {
        const records = await salesService.getDailyStationSales(stationId);
        // Transform records if necessary match StationSalesData interface
        // Assuming backend returns: { recordDate: string, volumeSold: number, totalRevenue: number, pump: { dispensedProduct: "PETROL" } }
        // We need to aggregate by date and product

        const dateMap = new Map<string, { petrol: number, diesel: number }>();

        records.forEach((r: any) => {
          const date = r.recordDate;
          const product = r.pump?.dispensedProduct?.toLowerCase(); // 'petrol' or 'diesel'
          const revenue = r.totalRevenue || 0;

          if (!dateMap.has(date)) {
            dateMap.set(date, { petrol: 0, diesel: 0 });
          }
          const entry = dateMap.get(date)!;

          if (product === 'petrol') {
            entry.petrol += revenue;
          } else if (product === 'diesel') {
            entry.diesel += revenue;
          }
        });

        const salesData: StationSalesData[] = Array.from(dateMap.entries()).map(([date, val]) => ({
          date,
          petrolSales: val.petrol,
          dieselSales: val.diesel
        })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        patchState(store, { stationSales: salesData });

      } catch (e) {
        console.error("Failed to load station sales", e);
        // Don't set global error to avoid blocking the whole page
        patchState(store, { stationSales: [] });
      }
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
    }

  }))
)
