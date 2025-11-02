# 📚 DynamoDB Operations Explained - PutItem vs UpdateItem

## ✅ YES - You Can Use GetItem + UpdateItem!

Your Lambda functions **already use the correct approach** for updating user profiles.

---

## 🔍 Three DynamoDB Operations You're Using

### 1. **PutItem** (Used in `postConfirmation.js`)

**When**: User signs up for the first time

**What it does**:

- Creates a NEW item in the table
- If item already exists, **replaces the ENTIRE item** (overwrites everything)

**Code example** (from postConfirmation.js):

```javascript
const putCommand = new PutCommand({
  TableName: USERS_TABLE,
  Item: {
    user_id: "cognito-uuid",
    username: "johndoe",
    email: "john@example.com",
    name: "John Doe",
    role: "customer",
    phoneNumber: null,
    address: null,
    // ... all fields
  },
  ConditionExpression: "attribute_not_exists(user_id)", // ✅ Prevents overwriting
});
```

**Perfect for**: Initial user creation (signup)

---

### 2. **GetItem** (Used in `getUser.js` and `updateUser.js`)

**When**: Fetching user profile or checking if user exists before updating

**What it does**:

- Reads a single item from the table
- Returns the entire item with all its attributes
- Doesn't modify anything

**Code example** (from getUser.js):

```javascript
const getCommand = new GetCommand({
  TableName: USERS_TABLE,
  Key: {
    user_id: userId, // Primary key
  },
});

const response = await docClient.send(getCommand);
// response.Item contains all user data
```

**Perfect for**:

- Loading user profile
- Checking if user exists before updating
- Reading user data for display

---

### 3. **UpdateItem** (Used in `updateUser.js`)

**When**: User edits their profile (name, phone, address, etc.)

**What it does**:

- Updates ONLY the specified fields
- Keeps all other fields unchanged
- Creates the item if it doesn't exist (unless you add a condition)
- Most efficient for partial updates

**Code example** (from updateUser.js):

```javascript
// Step 1: Check if user exists (GetItem)
const getCommand = new GetCommand({
  TableName: USERS_TABLE,
  Key: { user_id: userId },
});
const existingUser = await docClient.send(getCommand);

if (!existingUser.Item) {
  return { error: "User not found" };
}

// Step 2: Update only specific fields (UpdateItem)
const updateCommand = new UpdateCommand({
  TableName: USERS_TABLE,
  Key: { user_id: userId },

  // Only updates the fields you specify
  UpdateExpression:
    "SET #name = :name, #phone = :phone, #address = :address, #updatedAt = :updatedAt",

  ExpressionAttributeNames: {
    "#name": "name",
    "#phone": "phoneNumber",
    "#address": "address",
    "#updatedAt": "updatedAt",
  },

  ExpressionAttributeValues: {
    ":name": "John Updated",
    ":phone": "+91 9876543210",
    ":address": { street: "123 New St", city: "Mumbai" },
    ":updatedAt": new Date().toISOString(),
  },

  ReturnValues: "ALL_NEW", // Returns the updated item
});

const result = await docClient.send(updateCommand);
// result.Attributes contains the full updated user object
```

**Perfect for**: Profile updates, changing specific fields

---

## 📊 Comparison Table

| Operation      | Use Case      | Behavior                     | When to Use          |
| -------------- | ------------- | ---------------------------- | -------------------- |
| **PutItem**    | User signup   | Replaces entire item         | Initial creation     |
| **GetItem**    | Fetch profile | Read only, no changes        | Load data            |
| **UpdateItem** | Edit profile  | Updates specific fields only | Modify existing data |

---

## 🎯 Your Current Setup (Perfect!)

### 1. **User Signs Up** → `postConfirmation.js`

```javascript
Operation: PutItem
Action: Creates new user with all default fields
Table: livekart-users
Trigger: Cognito Post-Confirmation
```

### 2. **User Loads Profile Page** → `getUser.js`

```javascript
Operation: GetItem
Action: Fetches user data from DynamoDB
Returns: Full user object (name, email, phone, address, etc.)
```

### 3. **User Edits Profile** → `updateUser.js`

```javascript
Step 1: GetItem - Check if user exists
Step 2: UpdateItem - Update only changed fields
Returns: Updated user object
```

---

## 💡 Why GetItem + UpdateItem is Better Than PutItem

### ❌ **Bad Approach: Using PutItem for updates**

```javascript
// DON'T DO THIS for profile updates!
const putCommand = new PutCommand({
  TableName: USERS_TABLE,
  Item: {
    user_id: userId,
    name: "Updated Name", // ✅ Updates name
    phone: "+91 1234567890", // ✅ Updates phone
    // ❌ PROBLEM: All other fields are LOST!
    // email, role, createdAt, wishlist, cart, etc. = GONE!
  },
});
```

**Problem**: PutItem replaces the ENTIRE item. If you only send `name` and `phone`, all other fields (email, role, wishlist, orders, etc.) are **deleted**! 😱

### ✅ **Good Approach: Using UpdateItem**

```javascript
// ✅ CORRECT for profile updates!
const updateCommand = new UpdateCommand({
  TableName: USERS_TABLE,
  Key: { user_id: userId },
  UpdateExpression:
    "SET #name = :name, #phone = :phone, #updatedAt = :updatedAt",
  ExpressionAttributeNames: {
    "#name": "name",
    "#phone": "phoneNumber",
    "#updatedAt": "updatedAt",
  },
  ExpressionAttributeValues: {
    ":name": "Updated Name",
    ":phone": "+91 1234567890",
    ":updatedAt": new Date().toISOString(),
  },
});
```

**Benefits**:

- ✅ Updates ONLY `name`, `phone`, and `updatedAt`
- ✅ All other fields remain unchanged (email, role, wishlist, cart, etc.)
- ✅ Safer and more efficient
- ✅ Works even if some fields are missing in the request

---

## 🔧 IAM Permissions Needed

For your Lambda functions to work, the execution role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem", // ✅ For postConfirmation.js (create user)
        "dynamodb:GetItem", // ✅ For getUser.js + updateUser.js (read user)
        "dynamodb:UpdateItem" // ✅ For updateUser.js (update user)
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/livekart-users"
    }
  ]
}
```

**Your current setup already has `PutItem` and `GetItem`**, so you just need to **add `UpdateItem`** permission.

---

## 🧪 Testing Examples

### Test GetItem (Fetch User Profile)

```bash
# Via Lambda Function URL
curl -X GET "https://your-function-url/getUser?userId=USER_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response**:

```json
{
  "success": true,
  "user": {
    "user_id": "abc-123-def",
    "email": "john@example.com",
    "name": "John Doe",
    "phoneNumber": "+91 1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "role": "customer",
    "createdAt": "2025-11-01T...",
    "updatedAt": "2025-11-02T..."
  }
}
```

### Test UpdateItem (Update User Profile)

```bash
curl -X PUT "https://your-function-url/updateUser" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phoneNumber": "+91 9876543210",
    "address": {
      "street": "456 New Street",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001"
    }
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "user_id": "abc-123-def",
    "email": "john@example.com", // ✅ Unchanged
    "name": "John Updated", // ✅ Updated
    "phoneNumber": "+91 9876543210", // ✅ Updated
    "address": {
      // ✅ Updated
      "street": "456 New Street",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001"
    },
    "role": "customer", // ✅ Unchanged
    "createdAt": "2025-11-01T...", // ✅ Unchanged
    "updatedAt": "2025-11-02T12:30:00Z" // ✅ Auto-updated
  }
}
```

---

## ✅ Summary

**Your Question**: Can I use GetItem and UpdateItem to update the user table in DynamoDB?

**Answer**: **YES!** And you should! 🎉

**What you're already doing**:

- ✅ `postConfirmation.js` uses **PutItem** (correct for user creation)
- ✅ `getUser.js` uses **GetItem** (correct for fetching data)
- ✅ `updateUser.js` uses **GetItem + UpdateItem** (correct for updates)

**Why this is the right approach**:

1. **GetItem** checks if user exists
2. **UpdateItem** modifies only specific fields
3. All other fields remain intact
4. Safe and efficient

**What you need to do**:

1. ✅ Code is already correct (no changes needed)
2. ⏳ Add `dynamodb:UpdateItem` permission to Lambda execution role
3. ⏳ Deploy `updateUser.js` Lambda function
4. ⏳ Test with your app

---

**Bottom Line**: Your Lambda functions are already using the best practice approach! Just deploy them and add the UpdateItem IAM permission. 🚀
