export class Manager {
    "id": string | null;
    "email": string;
    "role": string;
    "status": string;
    "lastUpdated"?: Date | null;
    "info": {
      "id": string | null;
      "firstName": string;
      "lastName": string;
      "image": string;
    };
    "contact": {
      "id": string | null;
      "phone": string;
    };
    "station"?: null | {
      "id": string,
      "name": string,
      "address": string,
      "ward": string,
      "lga": string,
      "state": string,
      "longitude": number,
      "latitude": number,
      "pricePerLiter": number,
      "status": string,
      "createdAt": Date
    }
  }
