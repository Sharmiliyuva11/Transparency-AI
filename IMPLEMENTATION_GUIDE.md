# Logo, Contact & Help Implementation Guide

## What's Implemented

### Backend Changes (`backend/app.py`)

1. **Database Model Updates**
   - Added `logo_path` field to store logo file path
   - Added `contact_info` field to store contact information
   - Added `help_content` field to store help documentation

2. **New Routes**
   - `POST /settings/<role>/upload-logo` - Upload organization logo
   - `PUT /settings/<role>` - Updated to handle contact and help updates

3. **File Upload Support**
   - Accepts: PNG, JPG, JPEG, GIF, WebP
   - Maximum file size: 5MB
   - Files stored in `uploads/logos/` folder
   - Unique filenames using UUID to prevent conflicts

### Frontend Changes (`src/pages/admin/AdminSettings.tsx`)

1. **Organization Tab Enhancements**
   - Logo upload input with preview
   - Contact information text area
   - Help documentation text area
   - Individual save buttons for each section

2. **Success/Error Messages**
   - Displays "Saved" message after each update
   - Auto-dismisses after 3 seconds
   - Shows specific success messages:
     - "Logo uploaded successfully!"
     - "Contact information saved!"
     - "Help documentation saved!"

### API Service Updates (`src/services/api.ts`)

Added three new methods:
```typescript
uploadLogo(role: string, file: File)
updateContact(role: string, contactInfo: string)
updateHelp(role: string, helpContent: string)
```

## How to Use

### 1. Upload Logo

In the **Organization** tab:
1. Click "Upload New Logo" button
2. Select an image file (PNG, JPG, GIF, WebP)
3. Logo preview appears below button once uploaded
4. Success message: "Logo uploaded successfully!"

**Note:** File is saved to `uploads/logos/` folder and path is stored in database.

### 2. Save Contact Information

In the **Organization** tab under "Contact Information" section:
1. Enter support contact details (email, phone, address)
2. Click "Save Contact Information" button
3. Success message: "Contact information saved!"

### 3. Save Help Documentation

In the **Organization** tab under "Help & Documentation" section:
1. Enter help content (FAQ, instructions, guidance)
2. Click "Save Help Documentation" button
3. Success message: "Help documentation saved!"

## How to Check Saved Items

### Method 1: Database Direct Query

```bash
sqlite3 backend/instance/expenses.db
```

Then run:
```sql
SELECT role, organization_name, logo_path, contact_info, help_content 
FROM user_settings 
WHERE role = 'admin';
```

### Method 2: Backend API Call

Get all admin settings:
```bash
curl http://127.0.0.1:5000/settings/admin
```

Response includes:
```json
{
  "success": true,
  "settings": {
    "organisation": {
      "name": "Your Company",
      "logoPath": "uploads/logos/uuid_filename.png"
    },
    "contact": {
      "info": "Support Email: support@company.com"
    },
    "help": {
      "content": "Help documentation here..."
    }
  }
}
```

### Method 3: Frontend Verification

1. Go to Admin Settings
2. Click Organization tab
3. Scroll down to see:
   - Logo preview (if uploaded)
   - Contact information (if saved)
   - Help documentation (if saved)
4. All saved data loads automatically on page load

## Database Fields Reference

| Field | Type | Purpose |
|-------|------|---------|
| `logo_path` | String | Path to uploaded logo file |
| `contact_info` | Text | Contact information for support |
| `help_content` | Text | Help documentation/FAQ content |

## File Storage

Uploaded logos are stored in:
```
uploads/logos/
└── {uuid}_{original_filename}
    Example: a1b2c3d4_company_logo.png
```

The database stores the relative path that can be directly used as image `src`.

## Error Handling

### Upload Errors
- "No file provided" - File upload field is empty
- "No file selected" - File input clicked but cancelled
- "Invalid file format. Allowed: png, jpg, jpeg, gif, webp" - Wrong file type
- "File too large. Maximum size: 5MB" - File exceeds size limit
- "Failed to upload logo" - Server-side error

### Save Errors
- "Failed to save contact information" - Backend error
- "Failed to save help documentation" - Backend error
- "Failed to load settings" - Cannot fetch from backend

## Features

✓ Real-time success/error notifications  
✓ Auto-dismiss messages after 3 seconds  
✓ Logo preview after upload  
✓ Separate save buttons for each section  
✓ Disable buttons while saving (prevents duplicates)  
✓ All data persists in SQLite database  
✓ Load settings on page mount  
✓ Support for admin role (easily extensible)

## Testing

Run the included test script:
```bash
python test_logo_contact_help.py
```

This tests:
1. Logo upload with image file
2. Contact information update
3. Help documentation update
4. Retrieving all settings
