'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { adminListUsers, adminUpdateUser, adminDeleteUser, adminResetPassword } from '@/services/userService';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, Tag, Space, Avatar } from 'antd';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editRole, setEditRole] = useState<string>('user');
  const [editActive, setEditActive] = useState<boolean>(true);
  const [editName, setEditName] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  // ban/reset actions are available via buttons in the dialog footer
  const [showResetPwd, setShowResetPwd] = useState<boolean>(false);
  const [resetPwdValue, setResetPwdValue] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminListUsers({ page, perPage, q: q.trim() || undefined });
      const body = (res as any)?.data || res;
      const payload = body?.data || body;
      const list = Array.isArray(payload?.users)
        ? payload.users
        : Array.isArray(payload)
        ? payload
        : Array.isArray(body?.users)
        ? body.users
        : [];
      const pagination = payload?.pagination || body?.pagination || { totalCount: list.length };
      setUsers(list);
      setTotal(pagination?.totalCount || list.length);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, perPage]);
  useEffect(() => { const t = setTimeout(() => { setPage(1); load(); }, 400); return () => clearTimeout(t); }, [q]);

  const onChangeRole = async (id: string, role: string) => {
    try {
      await adminUpdateUser(id, { role });
      toast.success('Role updated');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to update role');
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      await adminDeleteUser(id);
      toast.success('User deleted');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to delete user');
    }
  };

  const columns = [
    { title: 'Avatar', dataIndex: 'avatar_url', key: 'avatar_url', render: (url: string) => <Avatar src={url || '/images/avatar-default.jpg'} /> },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: (_: any, u: any) => (
        <Select value={u.role || 'user'} onValueChange={(v) => onChangeRole(u.id, v)}>
          <SelectTrigger className="h-8 w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="super_admin">super_admin</SelectItem>
            <SelectItem value="admin">admin</SelectItem>
            <SelectItem value="member">member</SelectItem>
            <SelectItem value="user">user</SelectItem>
            <SelectItem value="guest">guest</SelectItem>
          </SelectContent>
        </Select>
      ) },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', render: (v: boolean) => v === false ? <Tag color="red">banned</Tag> : <Tag color="green">active</Tag> },
    { title: 'Email verified', dataIndex: 'email_verified', key: 'email_verified', render: (v: boolean) => String(!!v) },
    { title: 'ID', dataIndex: 'id', key: 'id', render: (v: string) => <span className="break-all inline-block max-w-[260px] align-middle">{v}</span> },
    { title: 'Actions', key: 'actions', fixed: 'right' as const, render: (_: any, u: any) => (
        <Space>
          <Button variant="outline" size="sm" onClick={() => { setSelected(u); setViewOpen(true); }}>View</Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelected(u);
              setEditRole(u.role || 'user');
              setEditActive(!(u.is_active === false));
              setEditName(u.name || '');
              setEditEmail(u.email || '');
              setShowResetPwd(false);
              setResetPwdValue('');
              setEditOpen(true);
            }}
          >
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(u.id)}>Delete</Button>
        </Space>
      ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex items-center gap-3">
          <Input placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} className="w-72" />
          <Select value={String(perPage)} onValueChange={(v) => { setPerPage(parseInt(v)); setPage(1); }}>
            <SelectTrigger className="w-[110px]"><SelectValue placeholder="Per page" /></SelectTrigger>
            <SelectContent>
              {[10,20,30,50].map((n) => (<SelectItem key={n} value={String(n)}>{n}/page</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="rounded-2xl border overflow-x-auto p-2">
        <Table
          size="middle"
          rowKey="id"
          columns={columns as any}
          dataSource={users}
          loading={loading}
          pagination={{ current: page, pageSize: perPage, total, showSizeChanger: false, onChange: (p) => setPage(p) }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {Math.ceil(total / perPage) > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="py-2 px-4 text-sm">{page} / {Math.ceil(total / perPage)}</span>
          <Button variant="outline" onClick={() => setPage((p) => Math.min(Math.ceil(total / perPage), p + 1))} disabled={page >= Math.ceil(total / perPage)}>Next</Button>
        </div>
      )}

      {/* View dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Name:</span> {selected.name || '-'} </div>
              <div><span className="font-medium">Email:</span> {selected.email}</div>
              <div><span className="font-medium">Role:</span> {selected.role || 'user'}</div>
              <div><span className="font-medium">Status:</span> {selected.is_active === false ? 'banned' : 'active'}</div>
              <div><span className="font-medium">Email verified:</span> {String(!!selected.email_verified)}</div>
              <div><span className="font-medium">Phone:</span> {selected.phone || '-'}</div>
              <div><span className="font-medium">Website:</span> {selected.website || '-'}</div>
              <div><span className="font-medium">Last login:</span> {selected.last_login ? new Date(selected.last_login).toLocaleString() : '-'}</div>
              <div><span className="font-medium">Created:</span> {selected.created_at ? new Date(selected.created_at).toLocaleString() : '-'}</div>
              <div><span className="font-medium">Updated:</span> {selected.updated_at ? new Date(selected.updated_at).toLocaleString() : '-'}</div>
              <div><span className="font-medium">ID:</span> <span className="break-all inline-block max-w-[260px] align-middle">{selected.id}</span></div>
              <div><span className="font-medium">Password hash:</span> {selected.password_hash ? String(selected.password_hash).slice(0,24) + '…' : '-'}</div>
              <div><span className="font-medium">Preferences:</span> {(() => { try { const s = JSON.stringify(selected.preferences||{}); return s.slice(0, 60) + (s.length>60?'…':''); } catch { return '-'; } })()}</div>
              <div><span className="font-medium">Avatar URL:</span> <span className="break-all inline-block max-w-[260px] align-middle">{selected.avatar_url || '-'}</span></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Name</div>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Email</div>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Role</div>
              <Select value={editRole} onValueChange={(v) => setEditRole(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">super_admin</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                  <SelectItem value="member">member</SelectItem>
                  <SelectItem value="user">user</SelectItem>
                  <SelectItem value="guest">guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Status</div>
              <Select value={editActive ? 'active' : 'banned'} onValueChange={(v) => setEditActive(v === 'active')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="banned">banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showResetPwd && (
              <div className="space-y-2 md:col-span-2">
                <div className="text-xs text-muted-foreground">New password</div>
                <Input type="password" value={resetPwdValue} onChange={(e) => setResetPwdValue(e.target.value)} placeholder="Enter new password" />
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="mr-auto flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  if (!selected) return;
                  try {
                    const newActive = !editActive;
                    await adminUpdateUser(selected.id, { is_active: newActive });
                    setEditActive(newActive);
                    toast.success(newActive ? 'User unbanned' : 'User banned');
                    load();
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'Failed to update status');
                  }
                }}
              >
                {editActive ? 'Ban' : 'Unban'}
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (!selected) return;
                  if (!showResetPwd) {
                    setShowResetPwd(true);
                    setResetPwdValue('');
                    return;
                  }
                  try {
                    await adminResetPassword(selected.id, resetPwdValue || undefined);
                    toast.success(resetPwdValue ? 'Password reset' : 'Temporary password generated');
                    setShowResetPwd(false);
                    setResetPwdValue('');
                  } catch (e: any) {
                    toast.error(e?.response?.data?.message || 'Failed to reset password');
                  }
                }}
              >
                Reset pwd
              </Button>
            </div>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (!selected) return;
                try {
                  await adminUpdateUser(selected.id, { role: editRole, is_active: editActive, name: editName.trim() || undefined, email: editEmail.trim() || undefined });
                  toast.success('User updated');
                  setEditOpen(false);
                  load();
                } catch (e: any) {
                  toast.error(e?.response?.data?.message || 'Failed to update user');
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
