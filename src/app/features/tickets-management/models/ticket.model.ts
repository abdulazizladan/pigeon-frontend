import { Reply } from "./reply.model";

export class Ticket {
  "id": string;
  "_id"?: string;
  "title": string;
  "description": string;
  "status": string;
  "replies": Reply[];
  "sender": { email: string };
  "dateCreated": Date;
}
