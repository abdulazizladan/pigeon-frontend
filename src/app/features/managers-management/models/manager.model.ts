export class Manager {
    "id": string | null;
    "email": string;
    "role": string;
    "status": string;
    "info": {
      "id": string | null;
      "firstName": string;
      "lastName": string;
      "image": string;
    };
    "contact": {
      "id": string | null;
      "phone": string;
    }
  }
