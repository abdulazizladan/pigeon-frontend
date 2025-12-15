import { Sale } from "../../sales-management/models/sale.model";

export class Dispenser {
  "id"?: string;
  "firsName": string; // Note: typo in original - should be firstName
  "middleName": string;
  "lastName": string;
  "phone": string;
  "status": "active" | "suspended";
  "dateAdded": Date;
  "sales"?: Sale[]; // Optional array of sales
}
