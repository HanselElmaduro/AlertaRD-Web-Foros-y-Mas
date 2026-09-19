"use client";
import type { ReactNode } from "react";
import {
  Siren,
  MapPin,
  Users,
  Smartphone,
  Car,
  Mic,
  HeartPulse,
  Activity,
  History,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
export { Button };
export function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const I =
    (
      {
        siren: Siren,
        map: MapPin,
        users: Users,
        smartphone: Smartphone,
        car: Car,
        mic: Mic,
        heart: HeartPulse,
        activity: Activity,
        history: History,
      } as Record<string, typeof Siren>
    )[name] || ShieldCheck;
  return <I size={size} strokeWidth={1.7} />;
}
export function LinkButton({
  href,
  children,
  variant = "default",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "default" | "outline" | "ghost";
  className?: string;
}) {
  return (
    <Button asChild variant={variant} className={"btn " + className}>
      <a href={href}>{children}</a>
    </Button>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {description && (
          <p className="muted section-description">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}
export function PageIntro({
  tag,
  title,
  description,
  children,
}: {
  tag: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-intro">
      <div className="container">
        <p className="eyebrow">{tag}</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
      </div>
    </div>
  );
}
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = "Selecciona una opción",
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (s: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div className="field">
      {label && <label htmlFor={id}>{label}</label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          id={id}
          className="select-control"
          aria-label={label || placeholder}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((x) => (
            <SelectItem key={x} value={x}>
              {x}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
export function LoadingCards() {
  return (
    <div className="card-grid" aria-label="Cargando contenido" role="status">
      {[1, 2, 3].map((i) => (
        <div className="card" key={i}>
          <Skeleton className="h-5 w-1/2 mb-5" />
          <Skeleton className="h-8 w-5/6 mb-3" />
          <Skeleton className="h-16 w-full" />
        </div>
      ))}
    </div>
  );
}
export function ErrorNotice({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={20} />
      <span>{message}</span>
      {retry && (
        <Button variant="outline" onClick={retry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <Empty className="empty-state">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MessageSquare />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {children}
    </Empty>
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className = "",
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"app-modal " + className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || "Comparte tu opinión para construir Alerta RD."}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a className="text-link" href={href}>
      {children}
      <ArrowRight size={17} />
    </a>
  );
}
export function Honeypot() {
  return (
    <input
      name="website"
      type="text"
      tabIndex={-1}
      autoComplete="off"
      className="honeypot"
      aria-hidden="true"
    />
  );
}
