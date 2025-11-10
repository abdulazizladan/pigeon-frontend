export interface Manager{
    "id": string;
    "email": string;
    "role": string;
    "status": string;
    "createdAt": Date;
    "info": {
      "firstName": string;
      "lastName": string;
    }
  }