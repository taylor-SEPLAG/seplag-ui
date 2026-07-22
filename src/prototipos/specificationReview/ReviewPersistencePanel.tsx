import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { reviewBackendConfigured, reviewRepository } from "./reviewRepository";
import type { PrototypeReview, ReviewStatus, ReviewUser } from "./types";

interface ReviewItem { id: string; title: string }
interface Props {
  screenId: string;
  metadata: ReviewItem;
  status: ReviewStatus;
  comment: string;
  items: ReviewItem[];
  onRestore: (componentId: string, status: ReviewStatus, comment: string) => void;
}
type AdminTab = "REVIEWERS" | "COMPONENTS" | "PENDING";
const labels: Record<ReviewStatus, string> = { PENDENTE: "Pendente", APROVADO: "Aprovado", RESSALVA: "Com ressalva", AJUSTE: "Ajuste solicitado", DUVIDA: "Dúvida" };

export function ReviewPersistencePanel({ screenId, metadata, status, comment, items, onRestore }: Props) {
  const [user, setUser] = useState<ReviewUser | null>(null);
  const [reviews, setReviews] = useState<PrototypeReview[]>([]);
  const [reviewers, setReviewers] = useState<ReviewUser[]>([]);
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
    const [savedReviews, savedReviewers] = await Promise.all([
      reviewRepository.list(screenId, activeUser, version),
      activeUser.role === "ADMIN" ? reviewRepository.listReviewers() : Promise.resolve([]),
    ]);
    setReviews(savedReviews);
    setReviewers(savedReviewers);
    baseline.current = currentSignature.current;
  }, [screenId, version]);

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
  }, [load]);

  useEffect(() => {
    if (selectedId.current !== metadata.id) {
      selectedId.current = metadata.id;
      baseline.current = currentSignature.current;
      return;
    }
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
    if (!user || user.role === "ADMIN") return;
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
    setUser(null); setReviews([]); setReviewers([]); baseline.current = "";
  };

  if (!user) return <div className="prototype-review-gate"><div className="prototype-review-login">
    <i className="pi pi-lock"/><h3>Identificação do avaliador</h3>
    <p>Entre para registrar e compartilhar sua avaliação.</p>
    {!reviewBackendConfigured && <small>Modo local de demonstração. Configure o Supabase para compartilhar entre dispositivos.</small>}
    <label>E-mail<input type="email" value={email} onChange={(event)=>setEmail(event.target.value)} placeholder="nome@seplag.mt.gov.br"/></label>
    <label>Senha<input type="password" value={password} onChange={(event)=>setPassword(event.target.value)} placeholder="Sua senha"/></label>
    {error && <div className="prototype-review-error">{error}</div>}
    <button type="button" disabled={!email || !password || busy} onClick={()=>void signIn()}><i className="pi pi-sign-in"/>{busy ? "Entrando..." : "Entrar para avaliar"}</button>
  </div></div>;

  return <div className="prototype-review-session">
    <div className="prototype-review-user"><div><strong>{user.name}</strong><span>{user.email} · {user.role === "ADMIN" ? "Administrador" : "Avaliador"}</span></div><div className="prototype-review-state"><i className={busy ? "pi pi-spin pi-spinner" : reviewBackendConfigured ? "pi pi-cloud" : "pi pi-desktop"}/><span>{busy ? "Sincronizando" : reviewBackendConfigured ? "Sincronizado" : "Salvo localmente"}</span><button type="button" onClick={()=>void signOut()} title="Sair"><i className="pi pi-sign-out"/></button></div></div>
    {error && <div className="prototype-review-error">{error}</div>}
    {user.role === "ADMIN" && <AdminWorkspace reviews={reviews} reviewers={reviewers} items={items}/>}
  </div>;
}

function AdminWorkspace({ reviews, reviewers, items }: { reviews: PrototypeReview[]; reviewers: ReviewUser[]; items: ReviewItem[] }) {
  const [tab, setTab] = useState<AdminTab>("REVIEWERS");
  const validIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const validReviews = useMemo(() => reviews.filter((review) => validIds.has(review.componentId)), [reviews, validIds]);
  const totalExpected = reviewers.length * items.length;
  const completedReviewers = reviewers.filter((reviewer) => new Set(validReviews.filter((review) => review.reviewerId === reviewer.id).map((review) => review.componentId)).size >= items.length).length;
  const startedReviewers = reviewers.filter((reviewer) => validReviews.some((review) => review.reviewerId === reviewer.id)).length;
  const adjustments = validReviews.filter((review) => review.status === "AJUSTE").length;
  const questions = validReviews.filter((review) => review.status === "DUVIDA").length;

  return <div className="prototype-review-admin-workspace">
    <header className="prototype-review-admin-header"><div><strong>Acompanhamento da validação</strong><span>Versão atual do protótipo</span></div><span>{validReviews.length} de {totalExpected} avaliações</span></header>
    <div className="prototype-review-admin-kpis">
      <article><strong>{reviewers.length}</strong><span>Convidados</span></article>
      <article><strong>{startedReviewers}</strong><span>Iniciaram</span></article>
      <article><strong>{completedReviewers}</strong><span>Concluíram</span></article>
      <article className="attention"><strong>{adjustments + questions}</strong><span>Pendências</span></article>
    </div>
    <div className="prototype-review-admin-progress"><span style={{ width: totalExpected ? Math.round(validReviews.length / totalExpected * 100) + "%" : "0%" }}/></div>
    <nav className="prototype-review-admin-tabs" aria-label="Visões administrativas">
      <button className={tab === "REVIEWERS" ? "is-active" : ""} onClick={()=>setTab("REVIEWERS")}>Avaliadores</button>
      <button className={tab === "COMPONENTS" ? "is-active" : ""} onClick={()=>setTab("COMPONENTS")}>Por componente</button>
      <button className={tab === "PENDING" ? "is-active" : ""} onClick={()=>setTab("PENDING")}>Pendências</button>
    </nav>
    {tab === "REVIEWERS" && <ReviewerAccordions reviews={validReviews} reviewers={reviewers} items={items}/>}
    {tab === "COMPONENTS" && <ComponentAccordions reviews={validReviews} reviewers={reviewers} items={items}/>}
    {tab === "PENDING" && <PendingList reviews={validReviews} reviewers={reviewers} items={items}/>}
  </div>;
}

function ReviewerAccordions({ reviews, reviewers, items }: { reviews: PrototypeReview[]; reviewers: ReviewUser[]; items: ReviewItem[] }) {
  return <div className="prototype-review-accordions">{reviewers.map((reviewer) => {
    const own = reviews.filter((review) => review.reviewerId === reviewer.id);
    const reviewedIds = new Set(own.map((review) => review.componentId));
    const approved = own.filter((review) => review.status === "APROVADO").length;
    const adjustments = own.filter((review) => review.status === "AJUSTE").length;
    const questions = own.filter((review) => review.status === "DUVIDA").length;
    const progress = items.length ? Math.round(reviewedIds.size / items.length * 100) : 0;
    const state = reviewedIds.size === 0 ? "Não iniciou" : reviewedIds.size >= items.length ? "Concluiu" : "Em andamento";
    return <details key={reviewer.id}><summary><div><strong>{reviewer.name}</strong><span>{state} · {reviewedIds.size} de {items.length}</span></div><b>{progress}%</b></summary>
      <div className="prototype-review-person-kpis"><span>{approved} aprovados</span><span>{adjustments} ajustes</span><span>{questions} dúvidas</span></div>
      <div className="prototype-review-items">{items.map((item) => {
        const review = own.find((entry) => entry.componentId === item.id);
        return <ReviewRow key={item.id} item={item} review={review}/>;
      })}</div>
    </details>;
  })}</div>;
}

function ComponentAccordions({ reviews, reviewers, items }: { reviews: PrototypeReview[]; reviewers: ReviewUser[]; items: ReviewItem[] }) {
  return <div className="prototype-review-accordions">{items.map((item) => {
    const componentReviews = reviews.filter((review) => review.componentId === item.id);
    const statuses = new Set(componentReviews.map((review) => review.status));
    const result = componentReviews.length < reviewers.length ? "Avaliação incompleta" : statuses.size === 1 ? "Consenso" : "Divergência";
    return <details key={item.id}><summary><div><strong>{item.title}</strong><span>{componentReviews.length} de {reviewers.length} avaliaram</span></div><b className={result === "Divergência" ? "is-danger" : ""}>{result}</b></summary>
      <div className="prototype-review-items">{reviewers.map((reviewer) => {
        const review = componentReviews.find((entry) => entry.reviewerId === reviewer.id);
        return <ReviewRow key={reviewer.id} item={{ id: reviewer.id, title: reviewer.name }} review={review}/>;
      })}</div>
    </details>;
  })}</div>;
}

function PendingList({ reviews, reviewers, items }: { reviews: PrototypeReview[]; reviewers: ReviewUser[]; items: ReviewItem[] }) {
  const critical = reviews.filter((review) => review.status === "AJUSTE" || review.status === "DUVIDA" || review.status === "RESSALVA");
  const missing = reviewers.flatMap((reviewer) => items.filter((item) => !reviews.some((review) => review.reviewerId === reviewer.id && review.componentId === item.id)).map((item) => ({ reviewer, item })));
  return <div className="prototype-review-pending">
    <h4>Ajustes, dúvidas e ressalvas</h4>
    {critical.length === 0 ? <p>Nenhuma pendência registrada.</p> : critical.map((review)=><article key={review.id}><strong>{review.componentTitle}</strong><span>{review.reviewerName} · {labels[review.status]}</span>{review.comment && <p>{review.comment}</p>}</article>)}
    <h4>Avaliações ainda não realizadas</h4>
    {missing.length === 0 ? <p>Todos os componentes foram avaliados.</p> : <p>{missing.length} avaliações pendentes entre {reviewers.length} avaliadores.</p>}
  </div>;
}

function ReviewRow({ item, review }: { item: ReviewItem; review?: PrototypeReview }) {
  return <article className="prototype-review-row"><div><strong>{item.title}</strong>{review?.comment && <p>{review.comment}</p>}</div><div><span className={"review-status status-" + (review?.status ?? "PENDENTE").toLowerCase()}>{review ? labels[review.status] : "Pendente"}</span>{review && <small>{new Date(review.updatedAt).toLocaleString("pt-BR")}</small>}</div></article>;
}
