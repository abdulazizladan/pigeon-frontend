export interface Manager {
  "id": string;
  "email": string;
  "role": string;
  "status": string;
  "createdAt": number;
  "info": {
    "firstName": string;
    "lastName": string;
  }
}