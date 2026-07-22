import { useCallback, useEffect, useRef, useState } from "react";
import { reviewBackendConfigured, reviewRepository } from "./reviewRepository";
import type { PrototypeReview, ReviewStatus, ReviewUser } from "./types";

interface Props {
  screenId: string;
  metadata: { id: string; title: string };
  status: ReviewStatus;
  comment: string;
}

export function ReviewPersistencePanel({ screenId, metadata, status, comment, onRestore }: Props) {
  const [user, setUser] = useState<ReviewUser | null>(null);
  const [reviews, setReviews] = useState<PrototypeReview[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const baseline = useRef("");
  const selectedId = useRef(metadata.id);
  const currentSignature = useRef(status + "|" + comment);
  currentSignature.current = status + "|" + comment;
  const version = import.meta.env.VITE_PROTOTYPE_VERSION?.trim() || "controle-vagas-prototipo-atual";

  const load = useCallback(async (activeUser: ReviewUser) => {
    const data = await reviewRepository.list(screenId, activeUser);
    setReviews(data);
    baseline.current = currentSignature.current;
  }, [screenId]);

  useEffect(() => {
    let mounted = true;
    const refresh = async () => {
      const activeUser = await reviewRepository.getUser();
      if (!mounted) return;
      setUser(activeUser);
      if (activeUser) await load(activeUser);
    };
    void refresh();
    const unsubscribe = reviewRepository.onAuthChange(() => void refresh());
    return () => { mounted = false; unsubscribe(); };
  }, [load, screenId]);

  useEffect(() => {
    if (!user || user.role === "ADMIN" || baseline.current === "") return;
    const signature = status + "|" + comment;
    if (signature === baseline.current) return;
    baseline.current = signature;
    setBusy(true);
    setError("");
    void reviewRepository.save({
      prototypeId: "SIGEP",
      prototypeVersion: version,
      screenId,
      componentId: metadata.id,
      componentTitle: metadata.title,
      status,
      comment,
    }, user).then(() => load(user)).catch((reason: unknown) => {
      setError(reason instanceof Error ? reason.message : "Não foi possível sincronizar.");
    }).finally(() => setBusy(false));
  }, [comment, load, metadata.id, metadata.title, screenId, status, user, version]);

  useEffect(() => {
    if (!user) return;
    const saved = reviews.find((item) => item.componentId === metadata.id && item.reviewerId === user.id);
    if (saved) onRestore(metadata.id, saved.status, saved.comment);
  }, [metadata.id, onRestore, reviews, user]);

  const signIn = async () => {
    setBusy(true); setError("");
    try {
      await reviewRepository.signIn(email, password);
      const activeUser = await reviewRepository.getUser();
      setUser(activeUser);
      if (activeUser) await load(activeUser);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Login não realizado.");
    } finally { setBusy(false); }
  };

  const signOut = async () => {
    await reviewRepository.signOut();
    setUser(null); setReviews([]); baseline.current = "";
  };

  if (!user) return <div className="prototype-review-gate">
    <div className="prototype-review-login">
      <i className="pi pi-lock"/>
      <h3>Identificação do avaliador</h3>
      <p>Entre para registrar e compartilhar sua avaliação.</p>
      {!reviewBackendConfigured && <small>Modo local de demonstração. Configure o Supabase para compartilhar entre dispositivos.</small>}
      <label>E-mail<input type="email" value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="nome@seplag.mt.gov.br"/></label>
      <label>Senha<input type="password" value={password} onChange={(event)=>setPassword(event.target.value)} placeholder="Sua senha"/></label>
      {error && <div className="prototype-review-error">{error}</div>}
      <button type="button" disabled={!email || !password || busy} onClick={()=>void signIn()}><i className="pi pi-sign-in"/>{busy ? "Entrando..." : "Entrar para avaliar"}</button>
    </div>
  </div>;

  return <div className="prototype-review-session">
    <div className="prototype-review-user"><div><strong>{user.name}</strong><span>{user.email} · {user.role === "ADMIN" ? "Administrador" : "Avaliador"}</span></div><div className="prototype-review-state"><i className={busy ? "pi pi-spin pi-spinner" : reviewBackendConfigured ? "pi pi-cloud" : "pi pi-desktop"}/><span>{busy ? "Sincronizando" : reviewBackendConfigured ? "Sincronizado" : "Salvo localmente"}</span><button type="button" onClick={()=>void signOut()} title="Sair"><i className="pi pi-sign-out"/></button></div></div>
    {error && <div className="prototype-review-error">{error}</div>}
    {user.role === "ADMIN" && <AdminSummary reviews={reviews}/>}
  </div>;
}

function AdminSummary({ reviews }: { reviews: PrototypeReview[] }) {
  return <details className="prototype-review-admin" open>
    <summary>Acompanhamento · {reviews.length} avaliações · {new Set(reviews.map((item)=>item.reviewerId)).size} avaliadores</summary>
    <div>{reviews.length === 0 ? <p>Nenhuma avaliação recebida nesta tela.</p> : reviews.slice(0, 20).map((review)=><article key={review.id}><header><strong>{review.componentTitle}</strong><span>{review.status}</span></header><small>{review.reviewerName} · {new Date(review.updatedAt).toLocaleString("pt-BR")}</small>{review.comment && <p>{review.comment}</p>}</article>)}</div>
  </details>;
}
