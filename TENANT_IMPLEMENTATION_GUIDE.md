# 🏢 Tenant Management - Client Implementation Guide

## 📋 Tổng Quan

Hướng dẫn implement Tenant Management trên Client (Next.js + React).

---

## 🎯 Các API Cần Implement

### 1️⃣ **Service Layer** (`services/tenantService.ts`)

```typescript
// client-luxe-wear-ai/services/tenantService.ts

import http from './http';

// ===========================
// Types
// ===========================

export interface Tenant {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface UserTenantMembership {
  userId: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

// ===========================
// API Functions
// ===========================

/**
 * Create a new tenant
 * POST /api/tenants
 */
export const createTenant = async (data: {
  name: string;
  plan?: 'free' | 'pro' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended';
}): Promise<{ data: Tenant }> => {
  return http.post('/tenants', data);
};

/**
 * List user's tenants
 * GET /api/tenants
 */
export const listUserTenants = async (): Promise<{ data: Tenant[] }> => {
  return http.get('/tenants');
};

/**
 * Get tenant by ID
 * GET /api/tenants/:tenantId
 */
export const getTenantById = async (tenantId: string): Promise<{ data: Tenant }> => {
  return http.get(`/tenants/${tenantId}`);
};

/**
 * Update tenant
 * PUT /api/tenants/:tenantId
 */
export const updateTenant = async (
  tenantId: string,
  data: {
    name?: string;
    plan?: 'free' | 'pro' | 'enterprise';
    status?: 'active' | 'inactive' | 'suspended';
  }
): Promise<{ data: Tenant }> => {
  return http.put(`/tenants/${tenantId}`, data);
};

/**
 * Delete tenant
 * DELETE /api/tenants/:tenantId
 */
export const deleteTenant = async (tenantId: string): Promise<void> => {
  return http.delete(`/tenants/${tenantId}`);
};

/**
 * Get tenant statistics
 * GET /api/tenants/:tenantId/stats
 */
export const getTenantStats = async (tenantId: string): Promise<{ data: any }> => {
  return http.get(`/tenants/${tenantId}/stats`);
};

/**
 * List tenant members
 * GET /api/tenants/:tenantId/members
 */
export const listTenantMembers = async (tenantId: string): Promise<{ data: UserTenantMembership[] }> => {
  return http.get(`/tenants/${tenantId}/members`);
};

/**
 * Add user to tenant
 * POST /api/tenants/:tenantId/members
 */
export const addTenantMember = async (
  tenantId: string,
  data: {
    userId: string;
    role: 'owner' | 'admin' | 'member';
  }
): Promise<{ data: UserTenantMembership }> => {
  return http.post(`/tenants/${tenantId}/members`, data);
};

/**
 * Update member role
 * PUT /api/tenants/:tenantId/members/:userId
 */
export const updateMemberRole = async (
  tenantId: string,
  userId: string,
  data: { role: 'owner' | 'admin' | 'member' }
): Promise<{ data: UserTenantMembership }> => {
  return http.put(`/tenants/${tenantId}/members/${userId}`, data);
};

/**
 * Remove user from tenant
 * DELETE /api/tenants/:tenantId/members/:userId
 */
export const removeTenantMember = async (tenantId: string, userId: string): Promise<void> => {
  return http.delete(`/tenants/${tenantId}/members/${userId}`);
};
```

---

### 2️⃣ **Redux Store** (`store/tenantSlice.ts`)

```typescript
// client-luxe-wear-ai/store/tenantSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TenantState {
  tenants: Array<{
    id: string;
    name: string;
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'inactive' | 'suspended';
  }>;
  currentTenant: string | null; // tenantId hiện tại đang active
  loading: boolean;
  error: string | null;
}

const initialState: TenantState = {
  tenants: [],
  currentTenant: null,
  loading: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenants: (state, action: PayloadAction<TenantState['tenants']>) => {
      state.tenants = action.payload;
    },
    setCurrentTenant: (state, action: PayloadAction<string | null>) => {
      state.currentTenant = action.payload;
      // Lưu vào localStorage
      if (action.payload) {
        localStorage.setItem('currentTenant', action.payload);
      } else {
        localStorage.removeItem('currentTenant');
      }
    },
    addTenant: (state, action: PayloadAction<TenantState['tenants'][0]>) => {
      state.tenants.push(action.payload);
    },
    updateTenant: (state, action: PayloadAction<{ id: string; tenant: Partial<TenantState['tenants'][0]> }>) => {
      const index = state.tenants.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.tenants[index] = { ...state.tenants[index], ...action.payload.tenant };
      }
    },
    removeTenant: (state, action: PayloadAction<string>) => {
      state.tenants = state.tenants.filter((t) => t.id !== action.payload);
      if (state.currentTenant === action.payload) {
        state.currentTenant = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTenants,
  setCurrentTenant,
  addTenant,
  updateTenant,
  removeTenant,
  setLoading,
  setError,
} = tenantSlice.actions;

export default tenantSlice.reducer;
```

**Update `store/index.ts`:**

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authSlice from './authSlice';
import tenantSlice from './tenantSlice'; // Add this

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'tenant'], // Add 'tenant' here
};

const rootReducer = {
  auth: authSlice,
  tenant: tenantSlice, // Add this
};

// ... rest of your store config
```

---

### 3️⃣ **UI Components**

#### **A. Tenant Switcher Component**

```typescript
// components/tenant/TenantSwitcher.tsx

import { useAppSelector, useAppDispatch } from '@/store';
import { setCurrentTenant } from '@/store/tenantSlice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function TenantSwitcher() {
  const dispatch = useAppDispatch();
  const { tenants, currentTenant } = useAppSelector((state) => state.tenant);

  const handleSwitch = (tenantId: string) => {
    dispatch(setCurrentTenant(tenantId));
    toast.success('Switched tenant successfully');
    // Optionally reload page to refresh data
    window.location.reload();
  };

  return (
    <Select value={currentTenant || ''} onValueChange={handleSwitch}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select tenant" />
      </SelectTrigger>
      <SelectContent>
        {tenants.map((tenant) => (
          <SelectItem key={tenant.id} value={tenant.id}>
            <div className="flex items-center gap-2">
              <span>{tenant.name}</span>
              <span className="text-xs text-gray-500">({tenant.plan})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

#### **B. Create Tenant Modal**

```typescript
// components/tenant/CreateTenantModal.tsx

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTenant } from '@/services/tenantService';
import { useAppDispatch } from '@/store';
import { addTenant, setCurrentTenant } from '@/store/tenantSlice';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateTenantModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro' | 'enterprise'>('free');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      return toast.error('Tenant name is required');
    }

    setLoading(true);
    try {
      const res = await createTenant({ name, plan });
      const newTenant = res.data;

      dispatch(addTenant({
        id: newTenant.id,
        name: newTenant.name,
        plan: newTenant.plan,
        status: newTenant.status,
      }));

      // Switch to new tenant
      dispatch(setCurrentTenant(newTenant.id));

      toast.success('Tenant created successfully');
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tenant</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Tenant Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Company"
            />
          </div>

          <div>
            <Label htmlFor="plan">Plan</Label>
            <Select value={plan} onValueChange={(v: any) => setPlan(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### **C. Tenant List Page**

```typescript
// app/dashboard/tenants/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listUserTenants } from '@/services/tenantService';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTenants } from '@/store/tenantSlice';
import { toast } from 'sonner';
import CreateTenantModal from '@/components/tenant/CreateTenantModal';
import TenantSwitcher from '@/components/tenant/TenantSwitcher';

export default function TenantsPage() {
  const dispatch = useAppDispatch();
  const { tenants, currentTenant } = useAppSelector((state) => state.tenant);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadTenants = async () => {
      try {
        const res = await listUserTenants();
        const data = res.data || [];
        dispatch(setTenants(data));
      } catch (error: any) {
        toast.error('Failed to load tenants');
      } finally {
        setLoading(false);
      }
    };
    loadTenants();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const currentTenantData = tenants.find((t) => t.id === currentTenant);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tenants</h1>
        <div className="flex items-center gap-4">
          <TenantSwitcher />
          <Button onClick={() => setShowCreateModal(true)}>
            Create New Tenant
          </Button>
        </div>
      </div>

      {currentTenantData && (
        <Card>
          <CardHeader>
            <CardTitle>Current Tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {currentTenantData.name}</p>
              <p><strong>Plan:</strong> {currentTenantData.plan}</p>
              <p><strong>Status:</strong> {currentTenantData.status}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader>
              <CardTitle>{tenant.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Plan:</strong> {tenant.plan}</p>
                <p><strong>Status:</strong> {tenant.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTenantModal open={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
```

---

### 4️⃣ **Update Dashboard Layout** (Thêm Tenant Switcher)

```typescript
// components/dashboard/DashboardLayout.tsx

import TenantSwitcher from '@/components/tenant/TenantSwitcher';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // ... existing code

  return (
    <div className="min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4">
        {/* Existing sidebar */}
      </aside>

      <main className="ml-64">
        <header className="bg-white shadow px-6 py-4">
          <div className="flex items-center justify-between">
            <h1>Dashboard</h1>
            {/* Add Tenant Switcher here */}
            <TenantSwitcher />
            <UserAvatar />
          </div>
        </header>

        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

---

### 5️⃣ **Middleware - Auto-load Tenant on Login**

```typescript
// components/AuthProvider.tsx (or similar)

import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { setCurrentTenant } from '@/store/tenantSlice';
import { listUserTenants } from '@/services/tenantService';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      const loadTenants = async () => {
        try {
          const res = await listUserTenants();
          const tenants = res.data || [];

          if (tenants.length > 0) {
            // Get saved tenant or use first one
            const saved = localStorage.getItem('currentTenant');
            const tenantId = saved || tenants[0].id;
            dispatch(setCurrentTenant(tenantId));
          }
        } catch (error) {
          console.error('Failed to load tenants');
        }
      };
      loadTenants();
    }
  }, [isAuthenticated]);

  return <>{children}</>;
}
```

---

## ✅ Checklist Implementation

### Service Layer
- [ ] Create `services/tenantService.ts` with all API functions
- [ ] Add error handling
- [ ] Add TypeScript types

### Redux Store
- [ ] Create `store/tenantSlice.ts`
- [ ] Add to `store/index.ts`
- [ ] Implement `persist` cho tenant state

### UI Components
- [ ] `TenantSwitcher.tsx`
- [ ] `CreateTenantModal.tsx`
- [ ] `app/dashboard/tenants/page.tsx`
- [ ] Update `DashboardLayout` với TenantSwitcher

### Integration
- [ ] Auto-load tenant on login
- [ ] Switch tenant và reload data
- [ ] Handle tenant-specific data (agents, knowledge)
- [ ] Test create/update/delete tenant
- [ ] Test switch tenant

### Security
- [ ] Verify user has access to tenant
- [ ] Handle 403 Forbidden
- [ ] Handle tenant not found

---

## 📚 Tài Liệu Tham Khảo

- **API Docs:** `post.http` file (Tenant routes)
- **Backend Routes:** `server-luxe-wear-ai/src/routes/tenant.router.ts`
- **Backend Controller:** `server-luxe-wear-ai/src/controllers/tenant.controller.ts`


