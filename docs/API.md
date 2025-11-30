
# StreamPay API Documentation

## Overview

The StreamPay API provides RESTful endpoints for integration between frontend, backend, smart contracts, and external providers. It covers registration, streams, history, compliance, monitoring, notifications, and authentication, with security, automation, and test coverage.

## Authentication

- JWT for protected routes
- Public and private endpoints
- Login example:

  ```http
  POST /api/auth/login
  {
    "email": "user@email.com",
    "password": "123456"
  }
  ```

  Response:

  ```json
  {
    "token": "..."
  }
  ```

## Main Endpoints


### Create Stream

- `POST /api/streams`
  - Creates a new stream
  - Parameters: recipient, token, rate, duration
  - Authenticated


### List Streams

- `GET /api/streams`
  - Lists active streams
  - Filters: status, recipient, token


### Stream History

- `GET /api/streams?finalized=true`
  - Lists finalized streams


### Stream Details

- `GET /api/streams/:id`
  - Full details of a stream


### Compliance & KYC

- `GET /api/kyc-status`
  - User KYC status
  - Response: status, reason, date


### Monitoring

- `GET /api/monitoring-status`
  - Status of integrated services
  - Response: status, alerts


### User Profile

- `GET /api/user/profile`
  - Get profile

- `PUT /api/user/profile`
  - Update profile
  - Parameters: name, email


### Notifications

- `POST /api/notifications`
  - Send notification (email, webhook)

## Responses and Errors

- Success: HTTP 200/201, JSON body
- Validation error: HTTP 400, message
- Authentication error: HTTP 401
- Permission error: HTTP 403
- Internal error: HTTP 500

## Usage Examples



### Create Stream (Example)

```http
POST /api/streams
Authorization: Bearer <token>
{
  "recipient": "0xabc...",
  "token": "USDC",
  "rate": "50",
  "duration": 100
}
```


### Get History

```http
GET /api/streams?finalized=true
Authorization: Bearer <token>
```


### Get Compliance

```http
GET /api/kyc-status
Authorization: Bearer <token>
```

## Security

- All sensitive routes require JWT
- Data validation on all endpoints
- Operation logs and auditing

## Testing & Coverage

- Automated tests for all endpoints
- Coverage for success, error, null data scenarios
- Reports in `coverage/lcov-report/index.html`

## References

- [OpenAPI](https://swagger.io/specification/)
- [Express](https://expressjs.com/)
- [JWT](https://jwt.io/)

---

For advanced details, see the route and controller files in `backend/src/` or contact the development team.
