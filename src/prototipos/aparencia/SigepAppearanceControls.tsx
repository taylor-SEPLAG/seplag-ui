import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { setSigepAppearance, useSigepAppearance, type SigepAppearance } from "./appearanceStore";
import "./sigepAppearance.css";
export function SigepAppearanceScope({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const appearance = useSigepAppearance();
  return <div className="prototype-shell" data-sigep-appearance={enabled ? appearance : undefined}>{children}</div>;
}
const options: { value: SigepAppearance; icon: string; label: string }[] = [
  { value: "padrao", icon: "☀️", label: "Padrão" },
  { value: "natal", icon: "🎄", label: "Modo Natalino" },
];
export function SigepAppearanceMenu() {
  const appearance = useSigepAppearance();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const choices = useRef<(HTMLButtonElement|null)[]>([]);
  const id = useId();
  const close = (restore = false) => { setOpen(false); if(restore) trigger.current?.focus(); };
  useEffect(() => {
    if(!open)return;
    choices.current[options.findIndex(option => option.value === appearance)]?.focus();
    const outside = (event: PointerEvent) => { if(!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if(event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside);document.removeEventListener("keydown", escape); };
  }, [open, appearance]);
  return <div ref={root} className="sigep-appearance-control" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setOpen(false);}}>
    <button ref={trigger} className="sigep-appearance-trigger" type="button" aria-label="Aparência do sistema" title="Aparência do sistema" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={()=>setOpen(value=>!value)} onKeyDown={event=>{if(event.key === "ArrowDown" || event.key === "ArrowUp"){event.preventDefault();setOpen(true);}}}><span aria-hidden="true">{options[1].icon}</span></button>
    {open && <div className="sigep-appearance-menu" id={id} role="menu" aria-labelledby={id+"-title"} onKeyDown={event=>{
      const index=choices.current.indexOf(document.activeElement as HTMLButtonElement);
      let next: number|undefined;
      if(event.key === "ArrowDown" || event.key === "ArrowRight")next=(index+1)%options.length;
      if(event.key === "ArrowUp" || event.key === "ArrowLeft")next=(index+options.length-1)%options.length;
      if(event.key === "Home")next=0;if(event.key === "End")next=options.length-1;
      if(next !== undefined){event.preventDefault();choices.current[next]?.focus();}
    }}>
      <h2 id={id+"-title"}>Aparência do sistema</h2>
      {options.map((option,index)=><button key={option.value} ref={element=>{choices.current[index]=element;}} type="button" role="menuitemradio" aria-checked={appearance === option.value} tabIndex={appearance === option.value ? 0 : -1} onClick={()=>{setSigepAppearance(option.value);close(true);}}><span aria-hidden="true">{option.icon}</span><span>{option.label}</span><span className="sigep-appearance-radio" aria-hidden="true" /></button>)}
    </div>}
  </div>;
}
