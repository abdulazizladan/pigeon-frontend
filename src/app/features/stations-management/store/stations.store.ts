import { signalStore, withState, withMethods, patchState, withComputed } from "@ngrx/signals";
import { Station } from "../models/station.model";
import { inject, computed } from "@angular/core";
import { StationsService } from "../services/stations.service";

// Define the new state structure
type StationState = {
  loading: boolean;
  error: string | null;
  stations: Station[]; // List of all stations
  selectedStation: Station | null; // The station currently being viewed
  selectedStationId: string | null; // Tracks the ID for easier loading/routing
};

export const initialState: StationState = {
  loading: false,
  error: null,
  stations: [], // Start with an empty list
  selectedStation: null,
  selectedStationId: null // No default selection by default
};

export const StationStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),

  // Add computed selectors based on the selectedStation
  withComputed(({ selectedStation }) => ({
    // Use selectedStation instead of the old 'station'
    activePumpCount: computed(() => 
      selectedStation()?.pumps.filter(p => p.status === 'active').length ?? 0
    ),
    totalPumpCount: computed(() => 
      selectedStation()?.pumps.length ?? 0
    ),
    fuelLevel: computed(() => 
      selectedStation()?.fuelLevelPercentage ?? 0
    )
  })),
  
  // Add methods for state manipulation and side effects
  withMethods((store, stationService = inject(StationsService)) => ({
    
    /**
     * Loads the list of all stations from the service into the 'stations' array.
     */
    async loadStations() {
      // Use loading state, but specifically for the list loading if needed,
      // though 'loading' is fine for general page loading.
      patchState(store, { loading: true, error: null, stations: [] }); 

      try {
        // ASSUMPTION: stationService.getAll() returns Promise<Station[]>
        const allStations = await (stationService as any).getAll(); 
        patchState(store, { stations: allStations, loading: false, error: null });
      } catch (error) {
        const message = (error as any)?.message || 'Failed to load station list. Please check the network.';
        patchState(store, {
          error: message,
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
      patchState(store, { 
        loading: true, 
        error: null, 
        selectedStation: null // Clear previous station while loading
      });
      try {
        // Service expects a numeric id; coerce if a string is provided
        const station = await (stationService as any).getById(id);
        patchState(store, { 
          selectedStation: station, 
          loading: false, 
          error: null 
        });
      } catch (error) {
        const message = (error as any)?.message || 'Failed to load station details. Please try again later.';
        patchState(store, {
          error: message,
          loading: false, 
          selectedStation: null
        });
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
