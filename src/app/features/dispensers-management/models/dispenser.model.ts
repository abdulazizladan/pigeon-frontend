import { Sale } from "../../sales-management/models/sale.model";

export class Dispenser {
  "id"?: string;
  "firstName": string;
  "middleName": string;
  "lastName": string;
  "phone": string;
  "status": "active" | "suspended";
  "dateAdded": Date;
  "sales"?: Sale[]; // Optional array of sales
}
