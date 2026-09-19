"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Modal, SelectField, ErrorNotice } from "@/components/ui-kit";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/components/providers";
export function PollEditor({
  poll,
  onClose,
  onDone,
}: {
  poll: any;
  onClose: () => void;
  onDone: () => void;
}) {
  const { act } = useApp();
  const [title, setTitle] = useState(poll.title || ""),
    [description, setDescription] = useState(poll.description || ""),
    [active, setActive] = useState(poll.active !== 0),
    [questions, setQuestions] = useState<any[]>(
      poll.questions || [
        {
          id: "q1",
          title: "",
          type: "choice",
          required: true,
          options: ["Sí", "No", "No estoy seguro/a"],
        },
      ],
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const locked = !!poll.responses;
  function change(i: number, key: string, value: any) {
    setQuestions((q) =>
      q.map((x, j) => (j === i ? { ...x, [key]: value } : x)),
    );
  }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await act("admin/poll", {
        id: poll.id,
        title,
        description,
        active,
        questions,
      });
      onDone();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      open
      onOpenChange={(v) => !v && onClose()}
      title={poll.id ? "Editar encuesta" : "Crear una encuesta"}
      description="Las preguntas se bloquean después de recibir respuestas para conservar su significado."
      className="wide-modal"
    >
      <form className="form-stack" onSubmit={submit}>
        <div className="field">
          <label htmlFor="poll-title">Título</label>
          <input
            id="poll-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            minLength={8}
            maxLength={150}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="poll-description">Descripción</label>
          <textarea
            id="poll-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            maxLength={600}
            required
          />
        </div>
        <label className="checkbox-option">
          <Switch checked={active} onCheckedChange={setActive} />
          Encuesta abierta a respuestas
        </label>
        {questions.map((q, i) => (
          <div className="question-editor" key={q.id}>
            <div className="row-between">
              <strong>Pregunta {i + 1}</strong>
              <Button
                type="button"
                variant="ghost"
                disabled={locked || questions.length === 1}
                aria-label={"Eliminar pregunta " + (i + 1)}
                onClick={() => setQuestions((q) => q.filter((_, j) => j !== i))}
              >
                <Trash2 size={15} />
              </Button>
            </div>
            <div className="field">
              <label htmlFor={"q-title-" + i}>Pregunta</label>
              <input
                id={"q-title-" + i}
                value={q.title}
                disabled={locked}
                onChange={(e) => change(i, "title", e.target.value)}
                required
                minLength={4}
                maxLength={300}
              />
            </div>
            <SelectField
              id={"q-type-" + i}
              label="Tipo de respuesta"
              value={q.type === "text" ? "Texto abierto" : "Selección única"}
              onChange={(v) =>
                !locked &&
                setQuestions((a) =>
                  a.map((x, j) =>
                    j === i
                      ? {
                          ...x,
                          type: v === "Texto abierto" ? "text" : "choice",
                          options:
                            v === "Texto abierto" ? undefined : ["Sí", "No"],
                        }
                      : x,
                  ),
                )
              }
              options={["Selección única", "Texto abierto"]}
            />
            {q.type !== "text" && (
              <div className="field">
                <label htmlFor={"q-options-" + i}>
                  Opciones (una por línea)
                </label>
                <textarea
                  id={"q-options-" + i}
                  value={(q.options || []).join("\n")}
                  disabled={locked}
                  onChange={(e) =>
                    change(i, "options", e.target.value.split("\n"))
                  }
                  required
                  rows={Math.min(6, (q.options || []).length + 1)}
                />
              </div>
            )}
            <label className="checkbox-option">
              <Checkbox
                checked={q.required}
                disabled={locked}
                onCheckedChange={(v) => change(i, "required", v === true)}
              />
              Respuesta obligatoria
            </label>
          </div>
        ))}
        {!locked && (
          <Button
            variant="outline"
            type="button"
            disabled={questions.length >= 25}
            onClick={() =>
              setQuestions((q) => [
                ...q,
                {
                  id: "q-" + crypto.randomUUID().slice(0, 8),
                  title: "",
                  type: "choice",
                  required: true,
                  options: ["Sí", "No"],
                },
              ])
            }
          >
            <Plus size={15} />
            Añadir pregunta
          </Button>
        )}
        {error && <ErrorNotice message={error} />}
        <Button className="btn" type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Guardar encuesta"}
        </Button>
      </form>
    </Modal>
  );
}
export function ChangeEditor({
  change,
  onClose,
  onDone,
}: {
  change: any;
  onClose: () => void;
  onDone: () => void;
}) {
  const { act } = useApp();
  const [status, setStatus] = useState(change.status || "En evaluación"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      open
      onOpenChange={(v) => !v && onClose()}
      title="Documentar una decisión"
      description="Registra únicamente aportes y decisiones reales. No inventes citas de la comunidad."
    >
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const d = Object.fromEntries(new FormData(e.currentTarget).entries());
          setBusy(true);
          try {
            await act("admin/change", { ...d, id: change.id, status });
            onDone();
            onClose();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {[
          ["concern", "Inquietud de la sociedad", change.concern],
          ["suggestion", "Sugerencia recibida", change.suggestion],
          ["decision", "Decisión del proyecto", change.decision],
          [
            "changeMade",
            "Cambio realizado (si corresponde)",
            change.change_made,
          ],
        ].map(([key, label, value]) => (
          <div className="field" key={key}>
            <label htmlFor={"change-" + key}>{label}</label>
            <textarea
              id={"change-" + key}
              name={key}
              defaultValue={value || ""}
              required={key !== "changeMade"}
              minLength={key !== "changeMade" ? 5 : 0}
              maxLength={1200}
            />
          </div>
        ))}
        <SelectField
          id="change-status"
          label="Estado"
          value={status}
          onChange={setStatus}
          options={[
            "En evaluación",
            "En diseño",
            "Implementado",
            "No viable actualmente",
          ]}
        />
        {error && <ErrorNotice message={error} />}
        <Button className="btn" type="submit" disabled={busy}>
          Guardar y publicar decisión
        </Button>
      </form>
    </Modal>
  );
}
export function CreatorEditor() {
  const { state, act } = useApp();
  const c = state?.creator || {
    name: "Gabriel Robles",
    role: "Fundador / Creador de Alerta RD",
    bio: "Una iniciativa de innovación tecnológica dominicana que escucha a las personas para explorar nuevas formas de solicitar ayuda durante emergencias.",
    github: "",
    linkedin: "",
    email: "",
  };
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="card form-stack"
      onSubmit={async (e) => {
        e.preventDefault();
        const d = Object.fromEntries(new FormData(e.currentTarget).entries());
        setBusy(true);
        try {
          await act("admin/creator", d);
        } catch {
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>Información del creador</h3>
      {[
        ["name", "Nombre"],
        ["role", "Rol"],
        ["github", "GitHub (opcional)"],
        ["linkedin", "LinkedIn (opcional)"],
        ["email", "Correo de contacto público (opcional)"],
      ].map(([key, label]) => (
        <div className="field" key={key}>
          <label htmlFor={"creator-" + key}>{label}</label>
          <input
            id={"creator-" + key}
            name={key}
            type={
              key === "email"
                ? "email"
                : ["github", "linkedin"].includes(key)
                  ? "url"
                  : "text"
            }
            defaultValue={c[key] || ""}
            required={["name", "role"].includes(key)}
            maxLength={200}
          />
        </div>
      ))}
      <div className="field">
        <label htmlFor="creator-bio">Presentación</label>
        <textarea
          id="creator-bio"
          name="bio"
          defaultValue={c.bio}
          minLength={10}
          maxLength={2000}
          required
          rows={5}
        />
      </div>
      <Button type="submit" className="btn" disabled={busy}>
        Actualizar información pública
      </Button>
    </form>
  );
}
