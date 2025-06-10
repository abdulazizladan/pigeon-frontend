
export class UserDetail {
    "id": number;
    "email": string;
    "role": string;
    "status": string;
    "createdAt": number;
    "info": {
      "id": number,
      "firstName": string,
      "lastName": string,
      "image": string,
    };
    "contact": {
      "id": number,
      "phone": string,
    };
    "reports": any[];
    "tickets": Array<{
      "id": number,
      "title": string,
      "description": string,
      "dateCreated": string,
      "status": string,
    }>
}
