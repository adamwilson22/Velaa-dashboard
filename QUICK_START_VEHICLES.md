# 🚗 Vehicle Management - Quick Start Guide

## 📂 Files Overview

### Frontend Files
1. **`vehicles-list.html`** - Main vehicles listing page (NEW)
2. **`vehicle-add.html`** - Add/Edit vehicle form (SIMPLIFIED)
3. **`js/vehicles-list.js`** - Listing page JavaScript (NEW)
4. **`js/api.js`** - API service (UPDATED with vehicle methods)

### Backend Files (Already Complete)
- `Velaa-Backend/src/controllers/vehicleController.js`
- `Velaa-Backend/src/routes/vehicles.js`
- `Velaa-Backend/src/models/Vehicle.js`

---

## 🎯 How to Use

### 1. Start the Servers

**Backend:**
```bash
cd /Users/muhammadosama/Projects/Velaa/Velaa-Backend
npm run dev
# Server: http://localhost:5001
```

**Frontend:**
```bash
cd /Users/muhammadosama/Projects/Velaa/Frontend
npx serve . -p 8080
# Server: http://localhost:8080
```

### 2. Access Vehicles Page

**Direct URL:** http://localhost:8080/vehicles-list.html

**Or via navigation:**
- Open any page → Click "Vehicles" in sidebar

---

## 🧪 Testing with Mock Data

Open browser console and run:
```javascript
// Enable mock mode
api.mockMode = true;

// Refresh the page to see 7 sample vehicles
location.reload();
```

---

## 📋 Features Checklist

### Vehicles Listing Page (`vehicles-list.html`)
- ✅ Search by chassis number
- ✅ Filter by brand (Audi, Toyota, Nissan, Benz)
- ✅ Filter by status (Available, Reserved, Sold)
- ✅ Pagination (5/10/25/50 rows per page)
- ✅ View vehicle details (Edit button)
- ✅ Delete vehicle (with confirmation)
- ✅ Add new vehicle button

### Add/Edit Vehicle Form (`vehicle-add.html`)
- ✅ Select customer from dropdown
- ✅ Enter chassis number (VIN)
- ✅ Set asking price
- ✅ Toggle marketplace visibility
- ✅ Enter make, year, color
- ✅ Set mileage and monthly fee
- ✅ Set arrival and expiry dates
- ✅ Set status (Available/Reserved/Sold)
- ✅ Set system status (Active/Inactive)
- ✅ Add keywords/tags
- ✅ Auto-load data for editing
- ✅ Success notifications

---

## 🎨 UI Components

### Table Structure
```
Chassis Number | Make | Arrival Date | Expiry Date | Status | Actions
---------------+------+--------------+-------------+--------+--------
GYWBR32E...    | Audi | 18 Oct 2025  | 18 Sep 2025 | [✓]    | [✏️][🗑️]
```

### Status Badges
- 🟢 **Available** - Green badge
- 🟠 **Reserved** - Orange badge
- 🔴 **Sold** - Red badge

### Pagination Controls
```
Showing 1-10 of 25 vehicles    [Previous] [1] [2] [3] [Next]    Rows: [10 ▼]
```

---

## 🔌 API Endpoints

### GET `/api/vehicles`
Get all vehicles with pagination
```javascript
api.getVehicles({
    page: 1,
    limit: 10,
    search: 'GYWBR',
    brand: 'Audi',
    status: 'Available'
})
```

### GET `/api/vehicles/:id`
Get single vehicle
```javascript
api.getVehicle('68dcf942f3e11ba0fd634d6e')
```

### POST `/api/vehicles`
Create new vehicle
```javascript
api.createVehicle({
    owner: '68dcf942f3e11ba0fd634d6e',
    chassisNumber: 'GYWBR32E779056478',
    brand: 'Audi',
    year: 2023,
    color: 'Black',
    status: 'Available',
    isActive: true
})
```

### PUT `/api/vehicles/:id`
Update vehicle
```javascript
api.updateVehicle('vehicle_id', {
    status: 'Sold',
    mileage: 50000
})
```

### DELETE `/api/vehicles/:id`
Delete vehicle
```javascript
api.deleteVehicle('vehicle_id')
```

---

## 🐛 Troubleshooting

### Issue: Pagination not visible
**Solution:** Check if `css/pagination.css` is loaded

### Issue: Clients not loading in dropdown
**Solution:** 
1. Check if backend is running
2. Enable mock mode: `api.mockMode = true`
3. Check console for errors

### Issue: Search not working
**Solution:**
1. Clear search filters
2. Check backend logs
3. Verify `search` parameter in validation.js

### Issue: Form validation errors
**Solution:**
1. Check required fields (marked with *)
2. Ensure chassis number is 8-17 characters
3. Year must be between 1900-2100

---

## 📝 Quick Code Snippets

### Change Mock Mode
```javascript
// In js/api.js (line 13)
this.mockMode = true;  // Use mock data
this.mockMode = false; // Use real API
```

### Add More Mock Vehicles
```javascript
// In js/api.js, find getVehicles() method
const allVehicles = [
    // Add more vehicles here
    { _id: 'mock_8', chassisNumber: 'XYZ123...', brand: 'Honda', ... }
];
```

### Customize Pagination Limits
```javascript
// In vehicles-list.js, find pageSizeHTML
<option value="100" ${limit === 100 ? 'selected' : ''}>100</option>
```

---

## ✅ Verification Steps

1. **✅ Backend Running?**
   ```bash
   curl http://localhost:5001/api/vehicles
   ```

2. **✅ Frontend Accessible?**
   Open: http://localhost:8080/vehicles-list.html

3. **✅ Mock Data Working?**
   Console: `api.mockMode = true` → Refresh page

4. **✅ Pagination Working?**
   Click page numbers, change rows per page

5. **✅ Search Working?**
   Type in search box → See filtered results

6. **✅ Filters Working?**
   Select brand/status → See filtered results

7. **✅ Add Vehicle Working?**
   Click "Add new vehicle" → Fill form → Save

8. **✅ Edit Vehicle Working?**
   Click Edit button → See form with data → Update

9. **✅ Delete Vehicle Working?**
   Click Delete → Confirm → Vehicle removed

---

## 📞 Support

If you encounter any issues:
1. Check browser console for errors (F12)
2. Check backend logs in terminal
3. Verify all files are in place
4. Review `VEHICLE_IMPLEMENTATION_COMPLETE.md` for details

---

**Created:** October 2, 2025
**Project:** Velaa Fleet Management System
**Version:** 1.0.0
