import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { DirectorService, SalesDataPoint, SalesPeriod, } from "../services/director.service";
import { firstValueFrom } from "rxjs"; // Needed to convert Observable to Promise for async/await
import { User } from "../models/user.model";


// Define the StationStats interface locally for state integrity, matching the Canvas definition.
export interface StationStats {
  total: number;
  active: number;
  inactive: number;
}

export class RecentSales {
  "stationName": string;
  "managerName": string;
  "amount": number;
}

interface DirectorState {
  "userProfile": User | null;
  "profile": User | null;
  "stationStats": StationStats | null;
  "salesRecords": SalesDataPoint[]; // New: Sales data points for the graph
  "recentSales": RecentSales[];
  "currentSalesPeriod": string; // New: Tracks the active filter (daily/weekly/monthly)
  "salesLoading": boolean; // New: Loading state specifically for sales data
  "loading": boolean;
  "error": string | null;
}

const initialState: DirectorState = {
  loading: false,
  salesLoading: false, // Initial state for sales data loading
  error: null,
  recentSales: [],
  profile: null,
  stationStats: null,
  userProfile: null,
  salesRecords: [], // Initialize sales records as empty array
  currentSalesPeriod: 'daily' // Default to daily sales view
}

export const DirectorStore = signalStore(
  {providedIn: 'root'},
  withState(initialState),
  // Inject AdminService to fetch the station statistics
  withMethods((store, directorService = inject(DirectorService)) => ({ 
    /**
     * Fetches station statistics from the service and updates the store state.
     */
    async loadSummary() {
      patchState(store, {loading: true, error: null})
      try {
        // Use firstValueFrom to convert the Observable<StationStats> into a Promise<StationStats>
        const stationStats = await firstValueFrom(directorService.getStationStats());
        
        // Update the stationStats and set loading to false
        patchState(store, { stationStats, loading: false });
      } catch (error) {
        console.error('Error loading summary:', error);
        patchState(store, {
          loading: false,
          error: 'Failed to load station stats. Please check your connection and try again.'
        })
      }
    },

    async loadSalesRecords(period: string) {
      // 1. Set loading and update the requested period
      patchState(store, {
        salesLoading: true, 
        error: null, 
        currentSalesPeriod: period
      });

      try {
        // 2. Fetch the data using firstValueFrom
        const sales = await firstValueFrom(directorService.getSalesRecords(period));
        
        // 3. Patch the state with the new data
        patchState(store, {
          salesRecords: sales,
          salesLoading: false,
          error: null
        });
      } catch (error) {
        // 4. Handle errors
        patchState(store, {
          salesLoading: false,
          error: 'Failed to load sales data. Please try again.'
        });
      }
    },
    
    // NOTE: This assumes another service (or AdminService has getProfile) is handling user data
    async loadProfile(email: string) {
      patchState(store, {loading: true, error: null});
      try{
        const userProfile = await directorService.getProfile(email); 
        patchState(store, {error: null, profile: userProfile, loading: false});
      }catch (error) {
        patchState(store, {
          error: 'Failed to load profile. Please check your connection and try again.',
          loading: false
        })
      }
    }
  }))
)
