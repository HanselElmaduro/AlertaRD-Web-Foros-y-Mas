"use client";
import { useState, useEffect } from "react";
import { Pencil, Trash2, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import { useApp, useResource } from "@/components/providers";
import {
  Button,
  Modal,
  SelectField,
  LoadingCards,
  ErrorNotice,
  EmptyState,
  LinkButton,
} from "@/components/ui-kit";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { PROVINCES } from "@/lib/content";
import { dateLabel } from "@/lib/api";
export function ProfilePage() {
  const { state, act } = useApp();
  const { data, loading, error, reload } = useResource("profile");
  const [alias, setAlias] = useState(""),
    [province, setProvince] = useState("Prefiero no responder"),
    [busy, setBusy] = useState(false),
    [edit, setEdit] = useState<any>(null),
    [remove, setRemove] = useState<any>(null);
  useEffect(() => {
    if (data) {
      setAlias(data.profile.alias);
      setProvince(data.profile.province || "Prefiero no responder");
    }
  }, [data]);
  async function action(path: string, input: any) {
    setBusy(true);
    try {
      await act(path, input);
      await reload();
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }
  if (loading)
    return (
      <div className="container page-content">
        <LoadingCards />
      </div>
    );
  if (error)
    return (
      <div className="container page-content">
        <ErrorNotice message={error} retry={reload} />
      </div>
    );
  if (!data) return null;
  const groups = [
    ["threads", "Conversaciones", "thread"],
    ["comments", "Comentarios", "comment"],
    ["suggestions", "Propuestas", "suggestion"],
    ["surveys", "Encuestas", "survey"],
    ["bookmarks", "Guardados", "bookmark"],
  ];
  return (
    <section className="container page-content profile-layout">
      <aside className="profile-summary">
        <div className="profile-avatar">
          {data.profile.alias.slice(0, 2).toUpperCase()}
        </div>
        <h1>{data.profile.alias}</h1>
        <p>
          {data.profile.role === "guest"
            ? "Participas como invitado"
            : "Tu cuenta de Alerta RD"}
        </p>
        <form
          className="form-stack"
          onSubmit={async (e) => {
            e.preventDefault();
            await action("profile", {
              alias,
              province: province === "Prefiero no responder" ? null : province,
            });
          }}
        >
          <div className="field">
            <label htmlFor="profile-alias">Alias público</label>
            <input
              id="profile-alias"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
              minLength={2}
              maxLength={40}
            />
          </div>
          <SelectField
            id="profile-province"
            label="Provincia (opcional)"
            value={province}
            onChange={setProvince}
            options={["Prefiero no responder", ...PROVINCES]}
          />
          <Button className="btn" disabled={busy} type="submit">
            Guardar perfil
          </Button>
        </form>
        {data.profile.role === "guest" ? (
          <div className="spaced">
            <p>
              Guarda tu historial en una cuenta. Si borras las cookies, podrías
              perder el acceso a esta sesión.
            </p>
            <a className="text-link spaced" href="/cuenta">
              Crear una cuenta
              <ArrowRight size={15} />
            </a>
          </div>
        ) : (
          <div className="spaced button-row">
            <Button
              variant="outline"
              onClick={async () => {
                if (await action("auth/logout", {})) window.location.href = "/";
              }}
            >
              <LogOut size={15} />
              Cerrar sesión
            </Button>
            {["admin", "moderator"].includes(data.profile.role) && (
              <LinkButton href="/admin" variant="outline">
                <ShieldCheck size={16} />
                Administración
              </LinkButton>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          className="spaced"
          style={{ fontSize: 12, color: "#a63446" }}
          onClick={() => setRemove({ type: "account" })}
        >
          Eliminar mi participación
        </Button>
      </aside>
      <div>
        <p className="eyebrow">MI PARTICIPACIÓN</p>
        <h2 style={{ fontSize: 29, marginBottom: 25 }}>Cada aporte cuenta.</h2>
        <Tabs defaultValue="threads" className="admin-tabs">
          <TabsList>
            {groups.map(([key, title]) => (
              <TabsTrigger value={key} key={key}>
                {title} ({data[key]?.length || 0})
              </TabsTrigger>
            ))}
          </TabsList>
          {groups.map(([key, title, type]) => (
            <TabsContent key={key} value={key}>
              {!data[key]?.length ? (
                <EmptyState
                  title={"Todavía no tienes " + title.toLowerCase() + "."}
                  description="Explora el foro, responde una encuesta o comparte tu primera propuesta."
                >
                  <LinkButton href="/participar">
                    Comenzar a participar
                  </LinkButton>
                </EmptyState>
              ) : (
                data[key].map((item: any) => (
                  <article className="profile-item" key={item.id}>
                    {item.status && (
                      <span className={"badge status-" + item.status}>
                        {(
                          {
                            pending: "Pendiente",
                            approved: "Aprobado",
                            rejected: "Rechazado",
                            reported: "Reportado",
                          } as any
                        )[item.status] || item.status}
                      </span>
                    )}
                    <h3>{item.title || item.body}</h3>
                    {item.created_at && (
                      <p className="small-text" style={{ fontSize: 11 }}>
                        {dateLabel(item.created_at)}
                      </p>
                    )}
                    <div className="button-row">
                      {["thread", "comment", "bookmark"].includes(type) && (
                        <a
                          className="text-link"
                          href={"/foro/" + (item.thread_id || item.id)}
                        >
                          Abrir conversación
                          <ArrowRight size={14} />
                        </a>
                      )}
                      {["thread", "comment", "suggestion"].includes(type) && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => setEdit({ ...item, type })}
                          >
                            <Pencil size={14} />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => setRemove({ type, id: item.id })}
                          >
                            <Trash2 size={14} />
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </article>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <Modal
        open={!!edit}
        onOpenChange={(v) => !v && setEdit(null)}
        title="Editar mi aporte"
        description="Las publicaciones editadas volverán a moderación antes de mostrarse al público."
      >
        {edit && (
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              if (
                await action("forum/edit", {
                  type: edit.type,
                  id: edit.id,
                  title: d.get("title") || undefined,
                  body: d.get("body"),
                })
              )
                setEdit(null);
            }}
          >
            {edit.type !== "comment" && (
              <div className="field">
                <label htmlFor="edit-title">Título</label>
                <input
                  id="edit-title"
                  name="title"
                  defaultValue={edit.title}
                  required
                  minLength={8}
                  maxLength={160}
                />
              </div>
            )}
            <div className="field">
              <label htmlFor="edit-body">Contenido</label>
              <textarea
                id="edit-body"
                name="body"
                defaultValue={edit.body || edit.description || ""}
                minLength={3}
                maxLength={5000}
                required
                rows={6}
              />
            </div>
            <Button className="btn" type="submit" disabled={busy}>
              Guardar cambios
            </Button>
          </form>
        )}
      </Modal>
      <AlertDialog open={!!remove} onOpenChange={(v) => !v && setRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Eliminar{" "}
              {remove?.type === "account"
                ? "tu participación"
                : "este contenido"}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {remove?.type === "account"
                ? "Se eliminarán tu cuenta, tus votos, respuestas y aportes asociados. Esta acción no se puede deshacer."
                : "El contenido será eliminado. Si es una conversación, también se eliminarán sus respuestas. Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              onClick={async (e) => {
                e.preventDefault();
                if (await action("profile/delete", remove)) {
                  const account = remove.type === "account";
                  setRemove(null);
                  if (account) window.location.href = "/";
                }
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
