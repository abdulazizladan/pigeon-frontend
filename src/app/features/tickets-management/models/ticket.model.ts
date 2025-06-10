import { Reply } from "./reply.model";

export class Ticket {
  "id": number;
  "title": string;
  "description": string;
  "status": string;
  "replies": Reply[];
}
