import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  FolderKanban,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import {
  authApi,
  clearSession,
  getStoredSession,
  projectApi,
  storeSession,
} from "./lib/api";

const roles = ["admin", "project_admin", "member"];

function normalizeProject(item) {
  return item?.project || item;
}

function App() {
  const initialSession = getStoredSession();
  const [user, setUser] = useState(initialSession.user);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialSession.token));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const signedIn = Boolean(user);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await projectApi.list();
      const data = Array.isArray(response.data) ? response.data : [];
      setProjects(data);
      setSelectedProject((current) => {
        if (!current?._id) return current;
        const nextSelected = data.find(
          (item) => normalizeProject(item)?._id === current._id,
        );
        return nextSelected ? normalizeProject(nextSelected) : current;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  async function loadMembers(projectId) {
    if (!projectId) return;
    setMembers([]);
    try {
      const response = await projectApi.members(projectId);
      setMembers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (signedIn) loadProjects();
  }, [signedIn, loadProjects]);

  useEffect(() => {
    if (selectedProject?._id) loadMembers(selectedProject._id);
  }, [selectedProject?._id]);

  function handleLogout() {
    clearSession();
    setUser(null);
    setProjects([]);
    setSelectedProject(null);
    setMembers([]);
    setNotice("");
    setError("");
  }

  async function handleAuth(mode, form) {
    setError("");
    setNotice("");
    try {
      const payload =
        mode === "login"
          ? await authApi.login({ email: form.email, password: form.password })
          : await authApi.register(form);

      if (mode === "login") {
        const sessionUser = payload.data?.user;
        const token = payload.data?.accessToken;
        storeSession({ token, user: sessionUser });
        setUser(sessionUser);
        setNotice("Signed in successfully.");
        return true;
      }

      setNotice("Account created. You can sign in now.");
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleSaveProject(project) {
    setError("");
    setNotice("");
    try {
      if (project._id) {
        const response = await projectApi.update(project._id, {
          name: project.name,
          description: project.description,
        });
        setSelectedProject(response.data);
        setNotice("Project updated.");
      } else {
        const response = await projectApi.create(project);
        setSelectedProject(response.data);
        setNotice("Project created.");
      }
      await loadProjects();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  async function handleDeleteProject(projectId) {
    setError("");
    try {
      await projectApi.remove(projectId);
      setSelectedProject(null);
      setMembers([]);
      setNotice("Project deleted.");
      await loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddMember(projectId, member) {
    setError("");
    try {
      await projectApi.addMember(projectId, member);
      setNotice("Member added.");
      await loadMembers(projectId);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  const stats = useMemo(() => {
    const totalMembers = projects.reduce((sum, item) => {
      const project = normalizeProject(item);
      return sum + Number(project?.members || 0);
    }, 0);

    return [
      { label: "Projects", value: projects.length },
      { label: "Known members", value: totalMembers },
      { label: "Active user", value: user?.username || "You" },
    ];
  }, [projects, user]);

  if (!signedIn) {
    return (
      <main className="min-h-screen bg-[#f6f7fb] px-4 py-8 text-slate-900">
        <AuthPanel onSubmit={handleAuth} error={error} notice={notice} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FolderKanban size={23} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Workspace</p>
              <h1 className="text-xl font-semibold tracking-normal">
                Project Dashboard
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={loadProjects}
              title="Refresh projects"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-800"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[330px_1fr] lg:px-8">
        <aside className="space-y-4">
          <UserCard user={user} />
          <Stats stats={stats} />
          <ProjectForm onSubmit={handleSaveProject} />
        </aside>

        <section className="space-y-4">
          <Status error={error} notice={notice} loading={loading} />
          <ProjectList
            projects={projects}
            selectedId={selectedProject?._id}
            onSelect={setSelectedProject}
            onDelete={handleDeleteProject}
          />
          <ProjectDetails
            project={selectedProject}
            members={members}
            onSave={handleSaveProject}
            onAddMember={handleAddMember}
          />
        </section>
      </section>
    </main>
  );
}

function AuthPanel({ onSubmit, error, notice }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const ok = await onSubmit(mode, form);
      if (ok && mode === "register") {
        setMode("login");
        setForm((current) => ({ ...current, password: "" }));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_430px]">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
          <Shield size={16} />
          Authenticated project management
        </div>
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
            Manage projects, roles, and members from one clean workspace.
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            A Vite React frontend wired to your MERN authentication and project
            APIs.
          </p>
        </div>
      </div>

      <form
        onSubmit={submit}
        className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft"
      >
        <div className="mb-5 grid grid-cols-2 rounded-md bg-slate-100 p-1">
          {["login", "register"].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setMode(item)}
              className={`h-10 rounded-md text-sm font-semibold capitalize ${
                mode === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <Field
            label="Username"
            value={form.username}
            onChange={(username) => setForm({ ...form, username })}
            placeholder="lowercase username"
          />
        )}
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(email) => setForm({ ...form, email })}
          placeholder="you@example.com"
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(password) => setForm({ ...form, password })}
          placeholder="Your password"
        />

        <Status error={error} notice={notice} />
        <button
          disabled={busy}
          className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {busy ? "Working..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </label>
  );
}

function UserCard({ user }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <img
          src={user?.avatar?.url || "https://placehold.co/120x120"}
          alt=""
          className="size-12 rounded-md object-cover"
        />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950">
            {user?.username || "User"}
          </p>
          <p className="truncate text-sm text-slate-500">{user?.email}</p>
        </div>
      </div>
    </div>
  );
}

function Stats({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-slate-200 bg-white p-3"
        >
          <p className="truncate text-xs text-slate-500">{stat.label}</p>
          <p className="mt-1 truncate text-lg font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function ProjectForm({ initialProject, onSubmit }) {
  const [form, setForm] = useState({
    name: initialProject?.name || "",
    description: initialProject?.description || "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({
      name: initialProject?.name || "",
      description: initialProject?.description || "",
    });
  }, [initialProject]);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const ok = await onSubmit({ ...initialProject, ...form });
      if (ok && !initialProject) setForm({ name: "", description: "" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-slate-200 bg-white p-4"
    >
      <h2 className="mb-4 flex items-center gap-2 font-semibold">
        {initialProject ? <Pencil size={17} /> : <Plus size={17} />}
        {initialProject ? "Edit project" : "New project"}
      </h2>
      <Field
        label="Name"
        value={form.name}
        onChange={(name) => setForm({ ...form, name })}
        placeholder="Project name"
      />
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Description
        </span>
        <textarea
          value={form.description}
          onChange={(event) =>
            setForm({ ...form, description: event.target.value })
          }
          placeholder="What is this project for?"
          rows={4}
          className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
        />
      </label>
      <button
        disabled={busy}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        <Check size={16} />
        {busy ? "Saving..." : "Save project"}
      </button>
    </form>
  );
}

function ProjectList({ projects, selectedId, onSelect, onDelete }) {
  if (!projects.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        No projects yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((item) => {
        const project = normalizeProject(item);
        const active = selectedId === project?._id;
        return (
          <article
            key={project?._id}
            className={`rounded-lg border bg-white p-4 transition ${
              active ? "border-emerald-500 shadow-soft" : "border-slate-200"
            }`}
          >
            <button
              className="block w-full text-left"
              onClick={() => onSelect(project)}
            >
              <h3 className="truncate font-semibold text-slate-950">
                {project?.name}
              </h3>
              <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                {project?.description || "No description"}
              </p>
            </button>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Users size={15} />
                {project?.members || 0}
              </span>
              <button
                onClick={() => onDelete(project?._id)}
                className="inline-flex size-9 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                title="Delete project"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProjectDetails({ project, members, onSave, onAddMember }) {
  const [member, setMember] = useState({ email: "", role: "member" });

  if (!project) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-500">
        Select a project to edit details and manage members.
      </div>
    );
  }

  async function submitMember(event) {
    event.preventDefault();
    const ok = await onAddMember(project._id, member);
    if (ok) setMember({ email: "", role: "member" });
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_330px]">
      <ProjectForm initialProject={project} onSubmit={onSave} />
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="mb-4 flex items-center gap-2 font-semibold">
          <UserPlus size={17} />
          Members
        </h2>
        <form onSubmit={submitMember} className="space-y-3">
          <input
            required
            type="email"
            value={member.email}
            onChange={(event) =>
              setMember({ ...member, email: event.target.value })
            }
            placeholder="member@email.com"
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <select
            value={member.role}
            onChange={(event) =>
              setMember({ ...member, role: event.target.value })
            }
            className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700">
            <UserPlus size={16} />
            Add member
          </button>
        </form>

        <div className="mt-5 space-y-2">
          {members.length ? (
            members.map((item) => (
              <div
                key={item?._id || item?.user?._id}
                className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm"
              >
                <p className="truncate font-medium">
                  {item?.user?.username || item?.email || "Member"}
                </p>
                <p className="truncate text-slate-500">{item?.role}</p>
              </div>
            ))
          ) : (
            <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">
              No member data returned yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Status({ error, notice, loading }) {
  if (!error && !notice && !loading) return null;

  return (
    <div className="space-y-2">
      {loading && (
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
          Loading...
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {notice}
        </div>
      )}
    </div>
  );
}

export default App;
