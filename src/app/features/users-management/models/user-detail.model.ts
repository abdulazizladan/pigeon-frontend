
export class UserDetail {
    "id": string;
    "email": string;
    "role": string;
    "status": string;
    "createdAt": number;
    "info": {
      "id": string,
      "firstName": string,
      "lastName": string,
      "image": string,
    };
    "contact": {
      "id": string,
      "phone": string,
    };
    "reports": any[];
    "tickets": Array<{
      "id": string,
      "title": string,
      "description": string,
      "dateCreated": string,
      "status": string,
    }>
}
