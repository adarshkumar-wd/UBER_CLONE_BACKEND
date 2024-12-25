# Uber Clone API Documentation

## User Registration API

Endpoint for creating new user accounts in the system.

### Endpoint Details

- **URL**: `/api/users/register`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Data Validation Rules
- **firstName:** `String, required`
- **lastName:** `String, optional`
- **email:** `String, required, must be unique`
- **password:** `String, required`

### Request Body

```json
{
    "firstName": "John",         // Required
    "lastName": "Doe",          // Optional
    "email": "john@example.com", // Required, must be unique
    "password": "password123"    // Required, will be hashed
}

Success Response
Status Code: 201 Created

{
    "statusCode": 200,
    "data": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "socketId": null
    },
    "message": "User Created Successfully..",
    "success": true
}

Error Responses
Missing Required Fields
Status Code: 400 Bad Request

{
    "statusCode": 400,
    "data": null,
    "message": "Star Marked fields must be required.",
    "success": false
}

Email Already Exists
Status Code: 400 Bad Request
{
    "statusCode": 400,
    "data": null,
    "message": "Email Already Exist",
    "success": false
}

Server Error
Status Code: 500 Internal Server Error
{
    "statusCode": 500,
    "data": null,
    "message": "Something went wrong while creating the user.",
    "success": false
}
```
## User Registration API

Endpoint for Log In the User.

### Endpoint Details

- **URL**: `/api/users/login`
- **Method**: `POST`
- **Content-Type**: `application/json`

## Data Validation Rules
- **email:** `String, required, must be unique`
- **password:** `String, required`

### Request Body

```json
{
    "email": "john@example.com", // Required, must be unique
    "password": "password123"    // Required, will be hashed
}

Success Response
Status Code: 201 Created

{
    "statusCode": 200,
   { 
    "data": {
        "_id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "socketId": null
    },
    "Access Token" : "Created Access Token",
    "Refresh Token" : "Created refresh token"
    },
    "message": "User LoggedIn Successfully..",
    "success": true
}

Error Responses
Missing Required Fields
Status Code: 400 Bad Request

{
    "statusCode": 400,
    "data": null,
    "message": "All fields are Required.",
    "success": false
}

User Not found
Status Code: 400 Bad Request
{
    "statusCode": 404,
    "data": null,
    "message": "User not found",
    "success": false
}

Wrong Password
Status Code: 400 Internal Server Error
{
    "statusCode": 500,
    "data": null,
    "message": "Invalid Credentials.",
    "success": false
}

Generating Tokens Error
Status Code: 400 Internal Server Error
{
    "statusCode": 500,
    "data": null,
    "message": "Error While Generating Tokens.",
    "success": false
}

User Data not found
Status Code: 400 Internal Server Error
{
    "statusCode": 404,
    "data": null,
    "message": "User Data not found",
    "success": false
}
```