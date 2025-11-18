# Save Settings Fix Guide

## Issues Fixed

### 1. **Database Schema Missing Columns**
- **Problem**: Old database didn't have `logo_path`, `contact_info`, `help_content` columns
- **Solution**: Added automatic migration in backend that creates columns on startup
- **Result**: No need to manually delete database

### 2. **Poor Error Reporting**
- **Problem**: Frontend showed generic error messages, no actual error details
- **Solution**: 
  - Enhanced API service to log errors
  - Updated all save functions to display actual backend error messages
  - Added console logging for debugging
- **Result**: You can now see exact error in the UI and browser console

### 3. **Missing Exception Handling**
- **Problem**: Backend didn't catch exceptions during save operations
- **Solution**: Wrapped update_settings and upload_logo routes in try-catch blocks
- **Result**: All errors now properly logged and returned with 500 status

## What to Do Now

### Step 1: Restart Backend
```bash
cd backend
python app.py
```

**Look for these messages in the backend console:**
```
Added logo_path column
Added contact_info column
Added help_content column
```

If you see these, database migration was successful.

### Step 2: Open Settings Page
- Navigate to Admin Dashboard → Settings
- Go to Organization tab
- You should see:
  - Logo upload button
  - Contact Information section
  - Help & Documentation section

### Step 3: Test Each Feature

#### Test Logo Upload:
1. Click "Upload New Logo"
2. Select an image file
3. You should see success message or specific error if it fails

#### Test Contact Information:
1. Enter text in "Support Contact Details"
2. Click "Save Contact Information"
3. Check for success message

#### Test Help Documentation:
1. Enter text in "Help Content"
2. Click "Save Help Documentation"
3. Check for success message

## Debugging: Reading Error Messages

### If Save Fails
You'll see an error message like:
- "Failed to update settings: [specific error]"
- "Failed to upload logo: [specific error]"
- "No file selected"
- "File too large..."

### Check Browser Console
Press F12 in browser → Console tab → Look for errors like:
```javascript
API Error Response: {status: 500, data: {error: "..."}}
Organization save error: Error: ...
```

### Check Backend Console
Look at the terminal running Flask for lines like:
```
Error updating settings: [detailed error message]
Error uploading logo: [detailed error message]
```

## Common Issues & Solutions

### Issue 1: "Failed to update settings: database table user_settings has no column named logo_path"
**Solution**: 
- Backend migration didn't run. Stop and restart the backend.
- Should see migration messages in backend console.

### Issue 2: "File too large"
**Solution**:
- Maximum logo size is 5MB
- Choose a smaller image file
- Try: PNG or JPG format under 1MB

### Issue 3: "Invalid file format"
**Solution**:
- Only PNG, JPG, JPEG, GIF, WebP allowed
- Check file extension
- Don't upload: TIFF, BMP, etc.

### Issue 4: "Failed to upload logo: Permission denied"
**Solution**:
- Check `uploads/` folder exists
- Check folder has write permissions
- Windows: Run terminal as Administrator

### Issue 5: Backend not responding / CORS error
**Solution**:
- Ensure backend is running: `python app.py`
- Check backend is on http://127.0.0.1:5000
- Check browser shows "failed to fetch" in console

## Verification: Checking Saved Data

### Method 1: Database Query
```bash
sqlite3 backend/instance/expenses.db
SELECT organization_name, logo_path, contact_info, help_content FROM user_settings WHERE role='admin';
```

### Method 2: API Call
```bash
curl http://127.0.0.1:5000/settings/admin
```

Response should include:
```json
{
  "organisation": {
    "name": "Your Company",
    "logoPath": "uploads/logos/uuid_filename.png"
  },
  "contact": {
    "info": "Support email: ..."
  },
  "help": {
    "content": "Help content here..."
  }
}
```

### Method 3: Frontend Reload
- Go to Settings → Organization tab
- All saved data loads automatically
- Should see:
  - Logo preview image
  - Contact info text
  - Help documentation text

## Files Modified for Fix

1. **backend/app.py**
   - Added database migration function
   - Added error handling to routes
   - Better error messages returned to frontend

2. **src/services/api.ts**
   - Enhanced error logging
   - Detailed error messages from backend

3. **src/pages/admin/AdminSettings.tsx**
   - Displays actual error messages
   - Console logging for debugging
   - All save functions updated

## Testing Backend API Manually

```bash
# Test get settings
curl -X GET http://127.0.0.1:5000/settings/admin

# Test update organization
curl -X PUT http://127.0.0.1:5000/settings/admin \
  -H "Content-Type: application/json" \
  -d '{"organisation":{"name":"My Company","industry":"tech"}}'

# Test update contact
curl -X PUT http://127.0.0.1:5000/settings/admin \
  -H "Content-Type: application/json" \
  -d '{"contact":{"info":"Email: support@company.com"}}'

# Test upload logo
curl -X POST http://127.0.0.1:5000/settings/admin/upload-logo \
  -F "file=@/path/to/logo.png"
```

## Next Steps

1. Restart backend with fixed code
2. Try saving settings
3. Check browser console for errors (F12)
4. Check backend console for detailed logs
5. Verify data in database

If still failing, take note of the exact error message and share it for further debugging.
