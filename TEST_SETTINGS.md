# Complete Settings Test Guide

## Backend Setup

### 1. Start Backend
```bash
cd backend
python app.py
```

Look for these messages:
```
Running on http://127.0.0.1:5000
Added logo_path column
Added contact_info column
Added help_content column
```

### 2. Verify Backend Routes
```bash
# Test GET settings
curl http://127.0.0.1:5000/settings/admin

# Test file upload route exists
curl -X OPTIONS http://127.0.0.1:5000/settings/admin/upload-logo
```

---

## Frontend Tests

### Test 1: Logo Upload & Preview
**Steps:**
1. Open Admin Dashboard → Settings
2. Go to Organization tab
3. Click "Upload New Logo"
4. Select any image file (PNG/JPG)
5. You should see:
   - Success message: "Logo uploaded successfully!"
   - Logo preview thumbnail below button
   - Logo has border and cursor shows "pointer"

**Expected Result:**
✓ Logo appears as thumbnail
✓ Success message displays
✓ Message auto-disappears in 3 seconds

**Check Database:**
```bash
sqlite3 backend/instance/expenses.db
SELECT logo_path FROM user_settings WHERE role='admin';
```
Should return: `uploads/logos/uuid_filename.png`

---

### Test 2: Logo Preview Modal
**Steps:**
1. After uploading logo (Test 1)
2. Click the logo preview image
3. You should see:
   - Modal appears with dark background
   - Logo displays at full size
   - Red "X" button in top-right corner

**Expected Result:**
✓ Modal opens on click
✓ Image shows full size
✓ Can close with X button or click outside modal

---

### Test 3: Contact Information
**Steps:**
1. Organization tab → scroll down to "Contact Information"
2. Enter text:
   ```
   Support Email: support@company.com
   Phone: +1-234-567-8900
   Address: 123 Main St
   ```
3. Click "Save Contact Information"
4. You should see:
   - Success message: "Contact information saved!"
   - Text remains in field
   - Message auto-disappears in 3 seconds

**Expected Result:**
✓ Contact info saves without errors
✓ Success message displays
✓ Text persists in field

**Check Database:**
```bash
sqlite3 backend/instance/expenses.db
SELECT contact_info FROM user_settings WHERE role='admin';
```
Should return your entered text

**Check API:**
```bash
curl http://127.0.0.1:5000/settings/admin
```
Response should include:
```json
"contact": {
  "info": "Support Email: support@company.com..."
}
```

---

### Test 4: Help Documentation
**Steps:**
1. Organization tab → scroll down to "Help & Documentation"
2. Enter text:
   ```
   ## How to Submit Expenses
   1. Click New Expense
   2. Upload receipt
   3. Review AI analysis
   4. Submit for approval
   
   ## FAQ
   Q: How long does approval take?
   A: Usually 1-2 business days
   ```
3. Click "Save Help Documentation"
4. You should see:
   - Success message: "Help documentation saved!"
   - Text remains in large text area
   - Message auto-disappears in 3 seconds

**Expected Result:**
✓ Help content saves without errors
✓ Success message displays
✓ Multi-line text is preserved

**Check Database:**
```bash
sqlite3 backend/instance/expenses.db
SELECT help_content FROM user_settings WHERE role='admin';
```
Should return your entered text with line breaks preserved

---

### Test 5: Full Persistence & Reload
**Steps:**
1. Complete Tests 1-4 (upload logo, save contact, save help)
2. Refresh the page (F5)
3. Settings page should reload
4. Go to Organization tab
5. You should see:
   - Logo thumbnail is visible
   - Logo can still be clicked to open modal
   - Contact information text is displayed
   - Help documentation text is displayed

**Expected Result:**
✓ All data loads on page refresh
✓ Logo image loads correctly from backend
✓ Text fields populated with saved data

---

## Error Scenarios to Test

### Error 1: Logo File Too Large
**Steps:**
1. Try to upload image larger than 5MB
2. Should see error: "File too large. Maximum size: 5MB (your file: X.XXmb)"

**Expected Result:**
✓ Specific file size error displayed
✓ File not saved

### Error 2: Invalid File Type
**Steps:**
1. Try to upload a PDF, TXT, or non-image file
2. Should see error: "Invalid file format. Allowed: png, jpg, jpeg, gif, webp"

**Expected Result:**
✓ Format error displayed
✓ File not saved

### Error 3: Backend Not Running
**Steps:**
1. Stop backend (Ctrl+C)
2. Try to save any setting
3. Should see error in console

**Expected Result:**
✓ Error message displayed to user
✓ Console shows connection error (F12)

### Error 4: Database Issues
**Steps:**
1. Check browser console (F12)
2. Check backend console
3. If save fails, both should show error details

**Expected Result:**
✓ Error details visible in both locations
✓ Can identify exact problem

---

## API Testing with curl

### Upload Logo
```bash
curl -X POST http://127.0.0.1:5000/settings/admin/upload-logo \
  -F "file=@C:\path\to\image.png"
```

**Expected Response:**
```json
{
  "success": true,
  "logoPath": "uploads/logos/uuid_filename.png",
  "settings": {...}
}
```

### Save Contact
```bash
curl -X PUT http://127.0.0.1:5000/settings/admin \
  -H "Content-Type: application/json" \
  -d '{"contact":{"info":"Email: test@company.com"}}'
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "contact": {
      "info": "Email: test@company.com"
    }
  }
}
```

### Save Help
```bash
curl -X PUT http://127.0.0.1:5000/settings/admin \
  -H "Content-Type: application/json" \
  -d '{"help":{"content":"Help content here..."}}'
```

**Expected Response:**
```json
{
  "success": true,
  "settings": {
    "help": {
      "content": "Help content here..."
    }
  }
}
```

### Get All Settings
```bash
curl http://127.0.0.1:5000/settings/admin
```

**Expected Response includes all three:**
```json
{
  "success": true,
  "settings": {
    "organisation": {
      "logoPath": "uploads/logos/uuid_filename.png"
    },
    "contact": {
      "info": "Email: ..."
    },
    "help": {
      "content": "Help content..."
    }
  }
}
```

---

## Browser Console Debugging (F12)

**Look for:**

✓ No red errors
✓ Successful logo upload shows in Network tab
✓ API calls complete with 200 status
✓ Images load from `http://127.0.0.1:5000/uploads/logos/...`

**If errors appear:**
- Network tab shows actual response
- Console tab shows error details
- Click error to see full message

---

## Summary Checklist

- [ ] Backend starts with database migration
- [ ] Logo uploads successfully
- [ ] Logo preview clickable, opens modal
- [ ] Contact information saves
- [ ] Help documentation saves
- [ ] All data persists after page reload
- [ ] Database contains all three fields with data
- [ ] API calls return correct responses
- [ ] No browser console errors
- [ ] Error messages are specific and helpful

**If all checkboxes pass: Implementation Complete! ✅**
