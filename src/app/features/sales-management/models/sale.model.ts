import { User } from './user.nodel'
import { Station } from './station.model'
import { Pump } from './pump.model';

export class Sale {
    "id": string;
  
    "product": string; // Use the enum type
  
    "pricePerLitre": number;

    "openingMeterReading": number;

    "closingMeterReading": number;
  
    "totalPrice": number; // New column to store calculated price
  

    "createdAt": Date;
  
    "recordedBy": User;
  
    "station": Station;
  
    "pump": Pump;

}
