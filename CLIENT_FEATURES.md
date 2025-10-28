# 📱 Client Features - Complete Feature List

## 📋 Tổng Quan

Danh sách đầy đủ các **features/chức năng** cần implement cho **tất cả pages** trong Client app.

---

## 🏠 **1. Home Page** (`/`)

### Features:
- [x] **Hero Section** - Video autoplay, CTA button
- [x] **How It Works** - Video showcase với play/pause
- [x] **Features Section** - Grid các tính năng
- [x] **Testimonials** - Component độc lập
- [x] **CTA Banner** - "Make customer experience your competitive edge"
- [x] **Footer** - Links, social icons, security badges

### API Usage:
- Không cần API

---

## 💰 **2. Pricing Page** (`/pricing`)

### Features:
- [x] **Hero Section** - Title và description
- [x] **Monthly/Yearly Toggle** - Switch pricing
- [x] **Pricing Cards** (5 levels):
  - Free, Hobby, Standard, Pro, Enterprise
  - Icons (star-1.svg đến star-5.svg)
  - Features list
  - Price (dynamic based on toggle)
- [x] **Enterprise CTA** - "Let's Talk" button

### API Usage:
- Không cần API (static pricing)

---

## 📚 **3. Docs Pages** (`/docs/*`)

### **3.1 User Guides** (`/docs/user-guides`)
### Features:
- [x] **Left Sidebar** - Navigation (Quick Start, AI Agent Management)
- [x] **Right Sidebar** - "On This Page" anchors
- [x] **Main Content** - MDX content

### **3.2 Build Your First Agent** (`/docs/user-guides/your-first-agent`)
### Features:
- [x] **Header** - Title, description, copy page button
- [x] **Prerequisites** - Callout info box
- [x] **Overview Steps** - Step-by-step guide
- [x] **Detailed Steps** - Images, callouts, tabs
- [x] **What's Next?** - Navigation suggestions

### API Usage:
- Không cần API (static content)

---

## 🔐 **4. Auth Pages**

### **4.1 Login** (`/login`)
### Features:
- [x] **Email/Password Form** - Input fields
- [x] **Validation** - Client-side validation
- [x] **Submit** - POST `/api/auth/login`
- [x] **Success Handling** - Save tokens, redirect `/dashboard`
- [x] **Error Handling** - Display error messages
- [x] **Loading State** - Button disabled
- [x] **Link to Register** - "Don't have account?"

### API Endpoints:
```http
POST /api/auth/login
Response: { accessToken, refreshToken, user }
```

---

### **4.2 Register** (`/register`)
### Features:
- [x] **Register Form** - Email, Password, Name
- [x] **Validation** - Client-side validation
- [x] **Submit** - POST `/api/auth/register`
- [x] **Success Handling** - Dispatch Redux, save tokens
- [x] **Email Confirmation** - Info message nếu cần verify
- [x] **Error Handling** - Display errors
- [x] **Loading State** - Button disabled
- [x] **Link to Login** - "Already have account?"

### API Endpoints:
```http
POST /api/auth/register
Response: { accessToken, refreshToken, user } hoặc { message: "Check email" }
```

---

## 📊 **5. Dashboard Pages**

### **5.1 Dashboard Home** (`/dashboard`)
### Features:
- [ ] **Page Title** - "AI Agents"
- [ ] **New Agent Button** - Link to `/dashboard/agents/new`
- [ ] **Search Bar** - Search agents by name/description
- [ ] **Agent Grid**:
  - Agent cards với gradient thumbnail
  - Name, description, created_at
  - 3 dots menu (Edit, View Details, Delete)
  - Mini chat overlay
- [ ] **Empty State** - "No agents yet" + CTA
- [ ] **Loading State** - Skeleton cards
- [ ] **Pagination** - Page/perPage controls
- [ ] **Sorting** - By name, created_at

### API Endpoints:
```http
GET /api/agents?page=1&perPage=100
GET /api/agents/search?q=keyword&page=1
```

---

### **5.2 Create Agent** (`/dashboard/agents/new`)
### Features:
- [ ] **Form Fields**:
  - Name (required, 3-100 chars)
  - Description (optional, max 500)
  - Config section (collapsed by default):
    - Model (gemini-1.5-pro, gemini-2.5-flash)
    - Temperature (0-2)
    - Max Tokens (1-4096)
    - System Prompt (textarea, max 2000)
    - Instructions (textarea, max 1000)
    - Tools (checkboxes)
- [ ] **Submit** - POST `/api/agents`
- [ ] **Success** - Redirect to `/dashboard/agents/[id]`
- [ ] **Error Handling** - Display field errors
- [ ] **Validation** - Zod validation

### API Endpoints:
```http
POST /api/agents
Body: { name, description, config: {...} }
```

---

### **5.3 Agent Details** (`/dashboard/agents/[id]`)
### Features:

#### **Config Tab**:
- [ ] **View Mode** - Display name, description, config
- [ ] **Edit Mode Toggle** - Enable/disable editing
- [ ] **Save Changes** - PUT `/api/agents/:id`
- [ ] **Success Toast** - "Agent updated"

#### **API & Security Tab**:
- [ ] **Display API Key** - Show/hide toggle
- [ ] **Copy Button** - Copy to clipboard
- [ ] **Regenerate Key** - POST `/api/agents/:id/regenerate-key`
  - Confirm modal: "Old key will be invalid"
  - Show new key 1 time only
- [ ] **Toggle Public** - PATCH `/api/agents/:id/public`
- [ ] **Allowed Origins Manager**:
  - List current origins
  - Add origin (validate URL, max 10)
  - Remove origin
  - Test CORS button
- [ ] **Embed Snippet** - Code to copy
  - Warning if not public hoặc no origins

#### **Knowledge Tab**:
- [ ] **Link to Knowledge** - Navigate to `/dashboard/knowledge?agentId=xxx`
- [ ] **Show Count** - "X knowledge entries"

#### **Analytics Tab**:
- [ ] **Statistics** - Conversation count, avg response time
- [ ] **Popular Queries** - List top queries

#### **Common Actions**:
- [ ] **Delete Agent** - Confirm modal → DELETE
- [ ] **Back Button** - Link to `/dashboard`

### API Endpoints:
```http
GET /api/agents/:id
PUT /api/agents/:id
DELETE /api/agents/:id
POST /api/agents/:id/regenerate-key
PATCH /api/agents/:id/public
GET /api/agents/:id/stats
```

---

### **5.4 Chat Page** (`/dashboard/chat`)
### Features:
- [ ] **Agent Selector** - Dropdown chọn agent
  - Load list: GET `/api/agents`
  - Save last used agent in localStorage
- [ ] **Chat Area**:
  - Message history (user/assistant)
  - Markdown render cho responses
  - Copy button cho mỗi message
  - Loading indicator
  - Scroll to bottom on new message
- [ ] **Input Section**:
  - Text input (max 4000 chars)
  - Character counter
  - Send button
- [ ] **Advanced Sidebar**:
  - Context textarea (optional, max 2000)
  - Toggle show/hide
- [ ] **Bottom Toolbar**:
  - Clear chat button
  - Export to Markdown
  - "Start new chat" button
- [ ] **History Persistence** - Save to localStorage per agent

### API Endpoints:
```http
GET /api/agents (list for selector)
POST /api/agents/:agentId/chat
Body: { message, context?: "" }
Response: { response: "..." }
```

---

### **5.5 Knowledge Base** (`/dashboard/knowledge`)
### Features:

#### **List Tab**:
- [ ] **Table View**:
  - Columns: Title, Agent, Content Preview, Created At, Actions
- [ ] **Search Bar** - Search by title (debounce 500ms)
- [ ] **Pagination** - Page/perPage
- [ ] **Filter** - By agent (dropdown)
- [ ] **Actions** - Edit, Delete (confirm modal)

#### **Add Manual Tab**:
- [ ] **Form**:
  - Title (required)
  - Content (large textarea)
  - Metadata (JSON editor)
  - Agent selector (optional)
- [ ] **Submit** - POST `/api/knowledge`

#### **Upload Files Tab**:
- [ ] **Drag & Drop** - Upload zone
- [ ] **File Input** - Click to select
- [ ] **File Types** - PDF, DOCX, TXT, MD
- [ ] **Multiple Files** - Select nhiều file
- [ ] **Upload Progress**:
  - Show progress bar
  - File name, chunk count, word count
- [ ] **Error Handling** - Continue nếu 1 file lỗi
- [ ] **Submit** - POST `/api/knowledge/upload`
  - Form data: files[], title?, agentId?, chunkSize?, overlap?

#### **View Knowledge** (`/dashboard/knowledge/[id]`):
- [ ] **Display** - Content, metadata
- [ ] **Edit Button** - Modal hoặc navigate to edit page
- [ ] **Delete Button** - Confirm modal

### API Endpoints:
```http
GET /api/knowledge?page=1&perPage=20&agentId=xxx
POST /api/knowledge
POST /api/knowledge/upload (multipart/form-data)
GET /api/knowledge/:id
PUT /api/knowledge/:id
DELETE /api/knowledge/:id
GET /api/knowledge/search?query=xxx&limit=10
```

---

### **5.6 Analytics Page** (`/dashboard/analytics`)
### Features:
- [ ] **Filters**:
  - Agent dropdown (all agents)
  - Time range (Today, 7d, 30d, Custom date range)
- [ ] **Summary Cards**:
  - Credits Used (number)
  - Agents Used (number)
- [ ] **Charts**:
  - Usage Over Time (Line chart - queries per day)
  - Credits Used Per Agent (Bar chart)
  - Conversations By Agent (Pie chart)
- [ ] **Recent Queries Table**:
  - Columns: Query, Response (truncated), Timestamp
  - Expand row → full query/response
  - Pagination
- [ ] **Export CSV** - Download analytics data

### API Endpoints:
```http
GET /api/analytics/user
GET /api/analytics/tenant
GET /api/analytics/agents/:agentId
GET /api/analytics/export?format=csv&startDate=xxx&endDate=xxx
```

---

### **5.7 Settings Page** (`/dashboard/settings`)
### Features:

#### **Security Tab**:
- [ ] **API Keys** - Show/hide toggle
- [ ] **Allowed Origins** - CRUD list
  - Add origin (validate URL)
  - Remove origin
  - Test CORS

#### **Embed Widget Tab**:
- [ ] **Preview Area** - Iframe preview
- [ ] **Config Options**:
  - Theme (light/dark)
  - Position (bottom-right, bottom-left, etc.)
- [ ] **Code Snippet** - Copy button
- [ ] **Check Readiness** - Warning if agent not public

### API Endpoints:
```http
PATCH /api/agents/:agentId/public
```

---

### **5.8 User Account** (`/dashboard/user`)
### Features:
- [ ] **Profile Section**:
  - Avatar upload (image preview)
  - Name input
  - Save button
- [ ] **Email Section**:
  - Email display
  - Change email button
- [ ] **Danger Zone**:
  - Delete all conversations button
  - Delete account button
  - Confirm modals

### API Endpoints:
```http
GET /api/users/profile
PUT /api/users/profile
PUT /api/users/email
PUT /api/users/avatar (multipart)
DELETE /api/users/avatar
```

---

### **5.9 Usage Page** (`/dashboard/usage`)
### Features:
- [ ] **Filters**:
  - Agent dropdown
  - Time range selector
- [ ] **Usage Per Agent** - Card với chart
- [ ] **Credits History** - Line chart over time
- [ ] **Daily Usage** - Table view
- [ ] **Export CSV** - Download usage data

### API Endpoints:
```http
GET /api/analytics/tenant
GET /api/analytics/export
```

---

## 🏢 **6. Tenant Management** (`/dashboard/tenants`)

Vis chưa implement. Features cần có:

- [ ] **Create Tenant Modal** - Name, Plan
- [ ] **Tenant List** - Grid cards
- [ ] **Tenant Switcher** - Dropdown in header
- [ ] **Current Tenant Display** - Name, Plan, Status
- [ ] **Switch Tenant** - Reload data
- [ ] **Members Management** - List, add, remove, update role

### API Endpoints:
```http
GET /api/tenants
POST /api/tenants
GET /api/tenants/:id
PUT /api/tenants/:id
DELETE /api/tenants/:id
GET /api/tenants/:id/stats
GET /api/tenants/:id/members
POST /api/tenants/:id/members
PUT /api/tenants/:id/members/:userId
DELETE /api/tenants/:id/members/:userId
```

---

## 🎨 **7. Shared UI Components**

### Already Implemented:
- [x] `Button.tsx`
- [x] `Input.tsx`
- [x] `Navbar.tsx`
- [x] `Footer.tsx`
- [x] `ThemeToggle.tsx`
- [x] `DashboardLayout.tsx`
- [x] `UserAvatar.tsx` (dropdown)

### Need to Implement:
- [ ] **Modal** - Reusable modal component
- [ ] **Dropdown** - Menu dropdown
- [ ] **Toast** - Notification system (maybe sonner)
- [ ] **Loading Skeleton** - For tables/cards
- [ ] **Empty State** - No data component
- [ ] **Error State** - Error message component
- [ ] **Table** - Data table với sorting, pagination
- [ ] **Chart** - Wrapper cho recharts
- [ ] **File Upload** - Drag & drop uploader
- [ ] **JSON Editor** - For metadata editing
- [ ] **Code Snippet** - Display code with copy button

---

## 🔄 **8. Global Features**

### State Management:
- [x] Redux Toolkit setup
- [x] Redux Persist
- [x] Auth slice (user, tokens)
- [ ] **Tenant slice** - Current tenant, list tenants
- [ ] **Agents slice** - Cached agents list
- [ ] **Knowledge slice** - Cached knowledge entries

### Services:
- [x] `authService.ts` - Login, register
- [x] `http.ts` - Axios instance với interceptors
- [ ] `agentService.ts` - CRUD agents
- [ ] `knowledgeService.ts` - CRUD knowledge
- [ ] `analyticsService.ts` - Get analytics
- [ ] `tenantService.ts` - CRUD tenants
- [ ] `chatService.ts` - Chat with agent

### Middleware:
- [x] Auth interceptor (add token)
- [x] Error interceptor (handle 401, 403, 429)
- [ ] **Tenant context** - Add tenant-id header

### Routing:
- [x] Protected routes `/dashboard/*`
- [ ] **Tenant-aware routes** - Reload data khi switch tenant
- [ ] **Deep linking** - Preserve state in URL

---

## 📝 **9. Form Validation**

### Zod Schemas Needed:
- [ ] **Agent Form** - Name, description, config
- [ ] **Knowledge Form** - Title, content, metadata
- [ ] **User Profile** - Name, email, phone
- [ ] **Tenant Form** - Name, plan

---

## 🎯 **10. UX Features**

### Loading States:
- [ ] Skeleton loaders
- [ ] Button loading states
- [ ] Full page loading

### Error Handling:
- [ ] Toast notifications
- [ ] Error boundaries
- [ ] Retry mechanisms

### Empty States:
- [ ] No agents
- [ ] No knowledge
- [ ] No analytics data

### Search & Filter:
- [ ] Debounced search (500ms)
- [ ] URL params for filters
- [ ] Clear filters button

### Pagination:
- [ ] Page controls
- [ ] Per-page selector
- [ ] Jump to page

### Export:
- [ ] CSV download
- [ ] Markdown export
- [ ] JSON export

---

## ✅ Summary Checklist

### Pages:
- [x] Home (`/`)
- [x] Pricing (`/pricing`)
- [x] Docs (`/docs/*`)
- [x] Login (`/login`)
- [x] Register (`/register`)
- [ ] Dashboard (`/dashboard`)
- [ ] Create Agent (`/dashboard/agents/new`)
- [ ] Agent Details (`/dashboard/agents/[id]`)
- [x] Chat (`/dashboard/chat`) - Basic implementation
- [x] Knowledge (`/dashboard/knowledge`) - Basic implementation
- [x] Analytics (`/dashboard/analytics`) - Basic implementation
- [ ] Settings (`/dashboard/settings`)
- [x] User Account (`/dashboard/user`)
- [x] Usage (`/dashboard/usage`) - Basic implementation
- [ ] Tenant Management (`/dashboard/tenants`)

### Priority Order:
1. **High Priority**: Dashboard home, Create agent, Agent details, Chat improvements
2. **Medium Priority**: Knowledge upload, Analytics charts, Settings
3. **Low Priority**: Usage page, Tenant management (nếu cần multi-tenant)

---

## 📚 Tài Liệu Tham Khảo

- **API Documentation**: `server-luxe-wear-ai/post.http`
- **Knowledge API**: `server-luxe-wear-ai/KNOWLEDGE_API_TEST.md`
- **Embed Chatbox**: `server-luxe-wear-ai/EMBED_CHATBOX_GUIDE.md`
- **Tenant Implementation**: `client-luxe-wear-ai/TENANT_IMPLEMENTATION_GUIDE.md`

