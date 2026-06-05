import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listLogs, createLog, deleteLog } from '../api/calories';
import { analyzePhoto } from '../api/ai';
import Navbar from '../components/Navbar';
import type { CalorieLog, MealAnalysisResult } from '../types';

const TODAY = new Date().toISOString().split('T')[0];

const momentoOrdem = ['café da manhã', 'almoço', 'jantar', 'lanche'];
const momentoCor: Record<string, string> = {
  'café da manhã': '#E8621A',
  almoço: '#B94A2C',
  jantar: '#7B4F3A',
  lanche: '#A0826D',
};
const momentoIcon: Record<string, string> = {
  'café da manhã': '☕',
  almoço: '🍽',
  jantar: '🌙',
  lanche: '🍎',
};

function RefeicaoCard({ item, onRemover }: { item: CalorieLog; onRemover: (id: number) => void }) {
  const [hover, setHover] = useState(false);
  const momento = item.notes?.toLowerCase().includes('café') ? 'café da manhã'
    : item.notes?.toLowerCase().includes('almoço') ? 'almoço'
    : item.notes?.toLowerCase().includes('jantar') ? 'jantar'
    : item.notes?.toLowerCase().includes('lanche') ? 'lanche'
    : 'almoço';

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="bg-white rounded-[10px] px-5 py-4 grid gap-3 items-center transition-all"
      style={{
        gridTemplateColumns: '1fr auto',
        border: `1px solid ${hover ? '#DDD5D0' : 'transparent'}`,
        boxShadow: hover ? '0 3px 14px rgba(28,20,16,0.07)' : '0 1px 3px rgba(28,20,16,0.04)',
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">{momentoIcon[momento] ?? '🍽'}</span>
          <span className="text-base font-medium text-preto-carvao font-sans">{item.meal_name}</span>
          {item.via === 'foto' && (
            <span className="text-[10px] tracking-wide uppercase text-laranja bg-laranja/10 px-1.5 py-0.5 rounded font-medium">
              IA
            </span>
          )}
        </div>
        <div className="flex gap-4">
          {item.protein_g != null && <Macro label="prot" valor={item.protein_g} />}
          {item.carbs_g != null && <Macro label="carb" valor={item.carbs_g} />}
          {item.fat_g != null && <Macro label="gord" valor={item.fat_g} />}
          <span className="text-xs text-cinza-quente">
            · {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="font-serif font-bold text-2xl text-preto-carvao leading-none">{item.calories}</div>
          <div className="text-[11px] text-cinza-quente tracking-wide">kcal</div>
        </div>
        {hover && (
          <button
            onClick={() => onRemover(item.id)}
            className="bg-cinza-fundo border-none cursor-pointer text-cinza-quente w-7 h-7 rounded-md text-lg flex items-center justify-center hover:bg-[#e8ddd8] transition-colors"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

function Macro({ label, valor }: { label: string; valor: number }) {
  return (
    <span className="text-xs text-cinza-quente font-sans">
      <span className="font-medium text-preto-carvao">{valor}g</span> {label}
    </span>
  );
}

interface FormCampos {
  nome: string;
  kcal: string;
  prot: string;
  carb: string;
  gord: string;
  momento: string;
}

function FormAdicionar({
  onAdicionar,
  onCancelar,
}: {
  onAdicionar: (data: {
    meal_name: string;
    calories: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    via: string;
    momento: string;
  }) => void;
  onCancelar: () => void;
}) {
  const [aba, setAba] = useState<'manual' | 'foto'>('manual');
  const [campos, setCampos] = useState<FormCampos>({
    nome: '', kcal: '', prot: '', carb: '', gord: '', momento: 'almoço',
  });
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [resultadoIA, setResultadoIA] = useState<MealAnalysisResult | null>(null);
  const [erroIA, setErroIA] = useState('');
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const atualizar = (k: keyof FormCampos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCampos((p) => ({ ...p, [k]: e.target.value }));

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFotoUrl(URL.createObjectURL(f));
    setAnalisando(true);
    setResultadoIA(null);
    setErroIA('');
    try {
      const res = await analyzePhoto(f);
      setResultadoIA(res);
      setCampos((p) => ({
        ...p,
        nome: res.meal_name,
        kcal: String(res.calories),
        prot: String(res.protein_g ?? ''),
        carb: String(res.carbs_g ?? ''),
        gord: String(res.fat_g ?? ''),
      }));
    } catch {
      setErroIA('Não foi possível analisar a imagem. Tente novamente.');
    } finally {
      setAnalisando(false);
    }
  };

  const podeConfirmar = campos.nome.trim() && campos.kcal;

  const inputBase =
    'w-full px-3 py-2 border border-cinza-borda rounded-lg text-sm font-sans text-preto-carvao bg-white outline-none focus:border-laranja transition-colors';

  return (
    <div className="bg-white rounded-xl border-[1.5px] border-cinza-borda px-6 pt-6 pb-5 shadow-[0_4px_20px_rgba(28,20,16,0.08)]">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-serif italic text-lg text-preto-carvao">Nova refeição</h3>
        <button onClick={onCancelar} className="text-cinza-quente text-xl cursor-pointer hover:text-preto-carvao px-1">×</button>
      </div>

      {/* Momento */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {momentoOrdem.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setCampos((p) => ({ ...p, momento: m }))}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide cursor-pointer transition-all"
            style={{
              border: `1.5px solid ${campos.momento === m ? momentoCor[m] : '#DDD5D0'}`,
              background: campos.momento === m ? `${momentoCor[m]}12` : 'transparent',
              color: campos.momento === m ? momentoCor[m] : '#6B5B55',
            }}
          >
            {momentoIcon[m]} {m}
          </button>
        ))}
      </div>

      {/* Abas */}
      <div className="flex bg-cinza-fundo rounded-lg p-0.5 mb-5 w-fit">
        {([['manual', 'Digitar'], ['foto', 'Foto + IA']] as [string, string][]).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setAba(k as 'manual' | 'foto')}
            className="px-4 py-1.5 rounded-md text-sm cursor-pointer transition-all"
            style={{
              background: aba === k ? '#1C1410' : 'transparent',
              color: aba === k ? '#FFFFFF' : '#6B5B55',
              fontWeight: aba === k ? '500' : '400',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {aba === 'foto' ? (
        <div className="mb-5">
          <div
            onClick={() => inputFotoRef.current?.click()}
            className="border-[1.5px] border-dashed rounded-[10px] p-8 text-center cursor-pointer relative overflow-hidden mb-3.5 transition-all"
            style={{
              borderColor: fotoUrl ? '#E8621A' : '#DDD5D0',
              background: fotoUrl ? 'rgba(232,98,26,0.04)' : '#FAF6F3',
            }}
          >
            {fotoUrl ? (
              <>
                <img
                  src={fotoUrl}
                  alt="prato"
                  className="max-h-44 max-w-full rounded-md object-contain mx-auto"
                  style={{ filter: analisando ? 'blur(2px) brightness(0.75)' : 'none', transition: 'filter 0.3s' }}
                />
                {analisando && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-preto-carvao/35 rounded-[10px]">
                    <div className="w-6 h-6 border-[3px] border-laranja/40 border-t-laranja rounded-full animate-spin mb-2.5" />
                    <span className="text-xs text-white font-sans">Analisando…</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="text-3xl mb-2">📷</div>
                <p className="text-sm text-cinza-quente">Clique para enviar uma foto do prato</p>
                <p className="text-xs text-[#B0A09A] mt-1">A IA estima calorias e macronutrientes</p>
              </>
            )}
          </div>
          <input ref={inputFotoRef} type="file" accept="image/*" onChange={handleFoto} className="hidden" />

          {erroIA && <p className="text-sm text-vermelho mb-3">{erroIA}</p>}

          {resultadoIA && (
            <div className="bg-verde-claro rounded-lg px-4 py-3.5 border border-verde/20">
              <p className="text-[11px] tracking-wide uppercase text-verde font-medium mb-2.5">Estimativa da IA</p>
              <div className="flex gap-6">
                {[
                  ['kcal', resultadoIA.calories, ''],
                  ['prot', resultadoIA.protein_g, 'g'],
                  ['carb', resultadoIA.carbs_g, 'g'],
                  ['gord', resultadoIA.fat_g, 'g'],
                ].map(([l, v, u]) => v != null && (
                  <div key={String(l)} className="text-center">
                    <div className="font-semibold text-base text-verde">{v}{u}</div>
                    <div className="text-[10px] text-cinza-quente tracking-wide uppercase">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_120px] gap-3 mb-5">
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-cinza-quente mb-1.5">Nome</label>
            <input className={inputBase} placeholder="ex: Omelete de queijo" value={campos.nome} onChange={atualizar('nome')} />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-wide uppercase text-cinza-quente mb-1.5">Calorias</label>
            <input className={inputBase} type="number" placeholder="kcal" value={campos.kcal} onChange={atualizar('kcal')} />
          </div>
          <div className="col-span-2 grid grid-cols-3 gap-2.5">
            {([['prot', 'Proteína (g)'], ['carb', 'Carb. (g)'], ['gord', 'Gordura (g)']] as [keyof FormCampos, string][]).map(([k, lbl]) => (
              <div key={k}>
                <label className="block text-[11px] font-medium tracking-wide uppercase text-cinza-quente mb-1.5">{lbl}</label>
                <input className={inputBase} type="number" placeholder="0" value={campos[k]} onChange={atualizar(k)} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2.5 justify-end">
        <button
          type="button"
          onClick={onCancelar}
          className="px-5 py-2.5 border border-cinza-borda rounded-lg text-sm text-cinza-quente bg-transparent cursor-pointer hover:bg-cinza-fundo transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={aba === 'manual' ? !podeConfirmar : !resultadoIA}
          onClick={() => {
            const via = aba === 'foto' ? 'foto' : 'manual';
            const meal_name = campos.nome || resultadoIA?.meal_name || '';
            const calories = parseFloat(campos.kcal) || resultadoIA?.calories || 0;
            onAdicionar({
              meal_name,
              calories,
              protein_g: parseFloat(campos.prot) || (resultadoIA?.protein_g ?? undefined),
              carbs_g: parseFloat(campos.carb) || (resultadoIA?.carbs_g ?? undefined),
              fat_g: parseFloat(campos.gord) || (resultadoIA?.fat_g ?? undefined),
              via,
              momento: campos.momento,
            });
          }}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#C0392B' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#922B21'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#C0392B'; }}
        >
          Registrar
        </button>
      </div>
    </div>
  );
}

export default function Refeicoes() {
  const queryClient = useQueryClient();
  const [formAberto, setFormAberto] = useState(false);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['logs', TODAY],
    queryFn: () => listLogs(TODAY),
  });

  const { mutate: addLog } = useMutation({
    mutationFn: (data: Parameters<typeof createLog>[0]) => createLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      setFormAberto(false);
    },
  });

  const { mutate: removeLog } = useMutation({
    mutationFn: (id: number) => deleteLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const porMomento = momentoOrdem.reduce<Record<string, CalorieLog[]>>((acc, m) => {
    const lista = logs.filter((r) => {
      const n = r.notes?.toLowerCase() ?? '';
      if (m === 'café da manhã') return n.includes('café') || n.includes('manhã');
      if (m === 'almoço') return n.includes('almoço');
      if (m === 'jantar') return n.includes('jantar');
      if (m === 'lanche') return n.includes('lanche');
      return false;
    });
    if (lista.length) acc[m] = lista;
    return acc;
  }, {});

  const semMomento = logs.filter((r) => {
    const n = r.notes?.toLowerCase() ?? '';
    return !n.includes('café') && !n.includes('manhã') && !n.includes('almoço') && !n.includes('jantar') && !n.includes('lanche');
  });
  if (semMomento.length) porMomento['almoço'] = [...(porMomento['almoço'] ?? []), ...semMomento];

  const totalKcal = logs.reduce((s, r) => s + r.calories, 0);
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  const handleAdicionar = (data: {
    meal_name: string;
    calories: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    via: string;
    momento: string;
  }) => {
    addLog({
      meal_name: data.meal_name,
      calories: data.calories,
      protein_g: data.protein_g,
      carbs_g: data.carbs_g,
      fat_g: data.fat_g,
      via: data.via,
      log_date: TODAY,
      notes: data.momento,
    });
  };

  return (
    <div className="min-h-screen bg-fundo-quente font-sans">
      <Navbar />

      <div className="max-w-[820px] mx-auto px-8 py-12 pb-20">
        {/* Cabeçalho */}
        <div className="flex justify-between items-end mb-9">
          <div>
            <p className="text-xs text-cinza-quente tracking-wide capitalize mb-1">{hoje}</p>
            <h1 className="font-serif italic font-normal text-4xl text-preto-carvao mb-1 leading-tight">
              Refeições do dia
            </h1>
            <p className="text-sm text-cinza-quente">
              {logs.length} {logs.length === 1 ? 'refeição registrada' : 'refeições registradas'}
              {logs.length > 0 && (
                <>
                  <span className="text-cinza-borda"> · </span>
                  <span className="text-preto-carvao font-medium">{totalKcal} kcal total</span>
                </>
              )}
            </p>
          </div>
          {!formAberto && (
            <button
              onClick={() => setFormAberto(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-vermelho hover:bg-vermelho-escuro text-white text-sm font-medium rounded-lg shadow-[0_2px_12px_rgba(192,57,43,0.3)] transition-colors cursor-pointer"
            >
              <span className="text-base leading-none">+</span>
              Adicionar refeição
            </button>
          )}
        </div>

        {/* Formulário */}
        {formAberto && (
          <div className="mb-9 animate-[fadeSlide_0.22s_ease]">
            <FormAdicionar onAdicionar={handleAdicionar} onCancelar={() => setFormAberto(false)} />
          </div>
        )}

        {/* Lista */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-laranja border-t-transparent rounded-full animate-spin" />
          </div>
        ) : Object.keys(porMomento).length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-cinza-borda">
            <div className="text-4xl mb-3">🍽</div>
            <p className="font-serif italic text-xl text-cinza-quente mb-1.5">Nenhuma refeição ainda</p>
            <p className="text-sm text-[#B0A09A]">Adicione sua primeira refeição do dia acima</p>
          </div>
        ) : (
          <div className="flex flex-col gap-9">
            {momentoOrdem.filter((m) => porMomento[m]).map((momento) => {
              const lista = porMomento[momento];
              const subtotal = lista.reduce((s, r) => s + r.calories, 0);
              return (
                <section key={momento}>
                  <div className="flex items-center gap-3 mb-3.5">
                    <span
                      className="text-[11px] font-medium tracking-widest uppercase"
                      style={{ color: momentoCor[momento] }}
                    >
                      {momentoIcon[momento]} {momento}
                    </span>
                    <div className="flex-1 h-px bg-cinza-borda" />
                    <span className="text-xs text-cinza-quente">{subtotal} kcal</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {lista.map((item) => (
                      <RefeicaoCard key={item.id} item={item} onRemover={(id) => removeLog(id)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
