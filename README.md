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
## User Login API

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
    "email": "john@example.com",
    "password": "password123"    
}

Success Response
Status Code: 201 Logged In

{
    "statusCode": 201,
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

## Refresh Access Token API

Endpoint for refreshing the access token using a valid refresh token.

### Endpoint Details

- **URL**: `/api/users/refresh-token`
- **Method**: `POST`
- **Content-Type**: `application/json`

```json

Request Body
{
    "refreshToken": "refresh_token" // Required
}

Success Response
Status Code: 200 OK

{
    "statusCode": 200,
    "data": {
        "accessToken": "new_access_token",
        "refreshToken": "new_refresh_token"
    },
    "message": "Tokens Generated Successfully.",
    "success": true
}

Error Responses
Tokens Not Found
Status Code: 401 Unauthorized
{
    "statusCode": 401,
    "data": null,
    "message": "Tokens Not Found.",
    "success": false
}
Invalid Token
Status Code: 402 Payment Required
{
    "statusCode": 402,
    "data": null,
    "message": "Invalid Token.",
    "success": false
}
Invalid User
Status Code: 402 Payment Required
{
    "statusCode": 402,
    "data": null,
    "message": "Invalid User Found.",
    "success": false
}
Server Error
{
    "statusCode": 500,
    "data": null,
    "message": "Something went wrong while generating the tokens.",
    "success": false
}
```

### Logout User
Endpoint to logout user and clear authentication tokens.

- **URL**: `/api/users/logout`
- **Method**: `GET`
- **Auth required**: `Yes`

#### Headers
```json
{
    "Authorization": "Bearer <accessToken>"
}

Success Response
Code: 200 OK

{
    "statusCode": 200,
    "data": {},
    "message": "User Logged Out Successfully.",
    "success": true
}

Error Response
Code: 401 Unauthorized

{
    "statusCode": 401,
    "data": null, 
    "message": "UnAuthorized User.",
    "success": false
}
```

### Get User Profile

Endpoint to fetch authenticated user's profile information.

- **URL** : `/api/users/profile` 
- **Method** : `GET`
- **Auth required** : `Yes`

### Headers
```json

{
    "Authorization": "Bearer <accessToken>"
}

Success Response
Code: 200 OK

{
    "statusCode": 200,
    "data": {
        "user": {
            "_id": "userId",
            "firstName": "John",
            "lastName": "Doe", 
            "email": "john@example.com",
            "socketId": null
        }
    },
    "message": "User Profile Data.",
    "success": true
}

Error Response
Code: 401 Unauthorized

{
    "statusCode": 401,
    "data": null,
    "message": "UnAuthorized User.",
    "success": false
}