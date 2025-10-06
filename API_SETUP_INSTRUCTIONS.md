# API Setup Instructions

## Current Status
✅ Mock data has been removed  
✅ Real API integration is enabled  
✅ Authentication handling is implemented  

## To Use Real Data

### 1. Authentication Required
The API requires a valid JWT token for all operations. You need to:

1. **Login first** using the login page (`index.html`)
2. **Get a valid token** from the login response
3. **Token is automatically stored** in localStorage

### 2. API Endpoints Required

Your backend should support these endpoints:

#### Get Clients (with search/filter)
```
GET /api/clients?search=john&type=Individual&isActive=true&page=1&limit=50
```

**Query Parameters:**
- `search` - Search by name or phone number
- `type` - Filter by client type (Individual, Company, Dealer)
- `isActive` - Filter by status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "client_id",
      "name": "Client Name",
      "phone": "+255123456789",
      "type": "Individual",
      "isActive": true,
      "outstandingBalance": 0,
      "createdAt": "2025-10-01T10:00:00.000Z",
      "updatedAt": "2025-10-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

#### Get Single Client
```
GET /api/clients/:id
```

#### Update Client
```
PUT /api/clients/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Name",
  "phone": "+255123456789",
  "type": "Individual",
  "isActive": true
}
```

#### Delete Client
```
DELETE /api/clients/:id
Authorization: Bearer <token>
```

### 3. Authentication Headers
All requests must include:
```
Authorization: Bearer <your-jwt-token>
```

### 4. Error Handling
The frontend handles these error cases:
- **401 Unauthorized** - Redirects to login
- **403 Forbidden** - Shows permission error
- **Token Invalid/Expired** - Redirects to login
- **Network Error** - Shows connection error

### 5. Testing
1. Start your backend server on `http://localhost:5001`
2. Open `index.html` and login with valid credentials
3. Navigate to `clients.html` to see real data
4. Test search, filters, edit, and delete functionality

### 6. Current Features Working
- ✅ Client listing with real API data
- ✅ Search by name and phone number
- ✅ Filter by type (Individual, Company, Dealer)
- ✅ Filter by status (Active/Inactive)
- ✅ Edit client functionality
- ✅ Delete client functionality
- ✅ Authentication handling
- ✅ Error handling and user feedback

## Notes
- Mock mode is disabled (`mockMode = false`)
- All API calls use real backend endpoints
- Authentication is required for all operations
- Search and filter parameters are properly formatted
