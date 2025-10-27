export default function UserAccountPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Account</h1>

      {/* Profile Information */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold">Profile Information</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal information and profile picture.
        </p>

        <div className="mt-6 space-y-5">
          {/* Avatar + URL */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
              {/* avatar placeholder */}
              <img src="https://i.pravatar.cc/100" alt="avatar" className="h-full w-full object-cover" />
            </div>
            <input
              type="text"
              readOnly
              value="ACg8ocLXHb1njMghVypQM9LNnZkKUZUfyIL-_eXtdiHNkc7Z4CrotSrp=s96-c"
              className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm"
            />
            <button className="h-9 w-9 rounded-lg border">⋯</button>
          </div>

          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              defaultValue="0140_Vũ Đức Anh"
              className="mt-2 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div className="flex justify-end">
            <button className="rounded-lg bg-foreground px-4 py-2 text-background text-sm font-semibold">
              Save changes
            </button>
          </div>
        </div>
      </section>

      {/* Email */}
      <section className="rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold">Email</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Please enter the email address you want to sign in with
        </p>

        <div className="mt-4 flex items-center gap-3">
          <input
            type="email"
            defaultValue="vng15960@gmail.com"
            className="w-full rounded-lg border px-3 py-2"
          />
          <button className="rounded-lg bg-foreground px-4 py-2 text-background text-sm font-semibold">
            Save
          </button>
        </div>
      </section>

      {/* Danger zone */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-0 flex items-center justify-center text-[11px] uppercase tracking-widest text-red-600">
          Danger Zone
        </div>
      </div>

      <section className="rounded-2xl border bg-background p-6">
        <div className="text-lg font-semibold text-red-600">Delete account</div>
        <p className="mt-1 text-sm text-muted-foreground">
          Once you delete your account, there is no going back. Please be certain. All your uploaded data and
          trained agents will be deleted. <span className="font-semibold">This action is not reversible</span>
        </p>
        <div className="mt-4 flex justify-end">
          <button className="rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-semibold">Delete</button>
        </div>
      </section>
    </div>
  );
}
