import { Contact } from "./contact.model";
import { Info } from "./info.model";

export class User {
  "id": number;
  "email": string;
  "password": string | null;
  "role": string;
  "info": Info;
  "contact": Contact;
  "status": string;
}
