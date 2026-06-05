import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listLogs, getSummary } from '../api/calories';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import type { CalorieLog } from '../types';

const TODAY = new Date().toISOString().split('T')[0];
const WEEK_START = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const momentoIcon: Record<string, string> = {
  'café da manhã': '☕',
  almoço: '🍽',
  jantar: '🌙',
  lanche: '🍎',
};

function AnimNum({ to, duration = 900 }: { to: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * to));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [to, duration]);
  return <>{val.toLocaleString('pt-BR')}</>;
}

function ArcProgress({ value, max, size = 180 }: { value: number; max: number; size?: number }) {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const ratio = Math.min(value / max, 1);
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1000, 1);
      setAnimated(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);
  const dash = circ * ratio * animated;
  const gap = circ - dash;
  const cor = ratio >= 1 ? '#C0392B' : ratio >= 0.8 ? '#E8621A' : '#2D6A4F';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F0EAE6" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={cor} strokeWidth="8"
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke 0.3s' }}
      />
    </svg>
  );
}

function BarChart({ data, meta }: { data: { date: string; cal: number }[]; meta: number }) {
  const [animated, setAnimated] = useState(false);
  const todayIdx = data.findIndex((d) => d.date === TODAY);
  const maxVal = Math.max(...data.map((d) => d.cal), meta);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex items-end gap-2.5 h-28 px-1">
      {data.map((d, i) => {
        const isHoje = i === todayIdx;
        const semDado = d.cal === 0;
        const dentro = d.cal > 0 && d.cal <= meta;
        const altura = semDado ? 0 : Math.max((d.cal / maxVal) * 100, 6);
        const cor = isHoje ? '#E8621A' : dentro ? '#2D6A4F' : '#C0392B';
        const diaSemana = diasSemana[new Date(d.date + 'T12:00:00').getDay()];

        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full h-24 flex items-end relative">
              {isHoje && (
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-cinza-borda"
                  style={{ bottom: `${(meta / maxVal) * 100}%` }}
                />
              )}
              <div
                className="w-full rounded-t"
                style={{
                  background: semDado ? '#F0EAE6' : cor,
                  height: animated ? `${altura}%` : '0%',
                  transition: `height 0.7s cubic-bezier(.32,.72,0,1) ${i * 60}ms`,
                  opacity: semDado ? 0.3 : 1,
                }}
              >
                {isHoje && !semDado && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-laranja whitespace-nowrap font-sans font-medium">
                    {d.cal.toLocaleString('pt-BR')}
                  </div>
                )}
              </div>
            </div>
            <span className={`text-[11px] font-sans ${isHoje ? 'text-laranja font-medium' : 'text-cinza-quente'}`}>
              {diaSemana}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function getMomento(log: CalorieLog): string {
  const notes = log.notes?.toLowerCase() ?? '';
  if (notes.includes('café') || notes.includes('manhã')) return 'café da manhã';
  if (notes.includes('almoço')) return 'almoço';
  if (notes.includes('jantar')) return 'jantar';
  if (notes.includes('lanche')) return 'lanche';
  const h = parseInt(log.created_at.split('T')[1] ?? '12');
  if (h < 10) return 'café da manhã';
  if (h < 15) return 'almoço';
  if (h < 18) return 'lanche';
  return 'jantar';
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const meta = user?.daily_calorie_goal ?? 2000;

  const { data: logsHoje = [] } = useQuery({
    queryKey: ['logs', TODAY],
    queryFn: () => listLogs(TODAY),
  });

  const { data: summary = [] } = useQuery({
    queryKey: ['summary', WEEK_START, TODAY],
    queryFn: () => getSummary(WEEK_START, TODAY),
  });

  const totalHoje = logsHoje.reduce((s, l) => s + l.calories, 0);
  const restam = Math.max(meta - totalHoje, 0);
  const progresso = totalHoje / meta;

  const last7: { date: string; cal: number }[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0];
    const found = summary.find((s) => s.log_date === d);
    return { date: d, cal: found?.total_calories ?? 0 };
  });

  const diasComDado = last7.filter((d) => d.cal > 0);
  const diasDentroMeta = diasComDado.filter((d) => d.cal <= meta).length;
  const mediaSemanal = diasComDado.length
    ? Math.round(diasComDado.reduce((s, d) => s + d.cal, 0) / diasComDado.length)
    : 0;

  const maisCalórica = [...logsHoje].sort((a, b) => b.calories - a.calories)[0];

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const primeiroNome = user?.name?.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-fundo-quente font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 pb-20">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-cinza-quente tracking-wide capitalize mb-1">{dataHoje}</p>
          <h1 className="font-serif italic font-normal text-4xl text-preto-carvao leading-tight">
            Bom dia, {primeiroNome}.
          </h1>
        </div>

        {/* ── DIÁRIO ── */}
        <p className="text-[11px] font-medium tracking-widest uppercase text-cinza-quente mb-5">Diário</p>

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 mb-4">
          {/* Arco de progresso */}
          <div className="bg-white rounded-xl border border-cinza-borda p-7 flex flex-col items-center justify-center gap-0">
            <div className="relative mb-2">
              <ArcProgress value={totalHoje} max={meta} size={160} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-serif font-bold text-3xl text-preto-carvao leading-none">
                  <AnimNum to={totalHoje} />
                </span>
                <span className="text-[11px] text-cinza-quente tracking-wide">
                  de {meta.toLocaleString('pt-BR')} kcal
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-cinza-quente mt-1 mb-0.5">Restam hoje</p>
              <p className={`font-serif font-bold text-2xl ${progresso >= 1 ? 'text-vermelho' : 'text-verde'}`}>
                {progresso >= 1 ? 'Meta atingida' : `${restam.toLocaleString('pt-BR')} kcal`}
              </p>
            </div>
          </div>

          {/* Refeições de hoje */}
          <div className="bg-white rounded-xl border border-cinza-borda p-6">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-medium text-preto-carvao">Refeições de hoje</span>
              <button
                onClick={() => navigate('/refeicoes')}
                className="text-xs text-laranja cursor-pointer hover:underline"
              >
                Ver todas →
              </button>
            </div>
            {logsHoje.length === 0 ? (
              <p className="text-sm text-cinza-quente text-center py-8">Nenhuma refeição registrada hoje.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {logsHoje.slice(0, 4).map((r) => {
                  const momento = getMomento(r);
                  return (
                    <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-fundo-quente">
                      <span className="text-base">{momentoIcon[momento] ?? '🍽'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-preto-carvao truncate">{r.meal_name}</p>
                        <p className="text-[11px] text-cinza-quente">
                          {new Date(r.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="font-serif font-bold text-base text-preto-carvao flex-shrink-0">
                        {r.calories}
                        <span className="text-[10px] text-cinza-quente font-normal font-sans ml-0.5">kcal</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── SEMANAL ── */}
        <div className="mt-10" />
        <p className="text-[11px] font-medium tracking-widest uppercase text-cinza-quente mb-5">Semanal</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1fr_200px_200px] gap-4 mb-4">
          {/* Gráfico */}
          <div className="bg-white rounded-xl border border-cinza-borda p-6 sm:col-span-2 md:col-span-1">
            <div className="flex justify-between items-center mb-5">
              <span className="text-sm font-medium text-preto-carvao">Calorias por dia</span>
              <div className="flex gap-3.5">
                {[{ cor: '#2D6A4F', label: 'Dentro da meta' }, { cor: '#E8621A', label: 'Hoje' }, { cor: '#C0392B', label: 'Acima da meta' }].map(({ cor, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm" style={{ background: cor }} />
                    <span className="text-[11px] text-cinza-quente">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <BarChart data={last7} meta={meta} />
          </div>

          {/* Dias dentro da meta */}
          <div className="bg-white rounded-xl border border-cinza-borda p-6 flex flex-col justify-center items-center text-center gap-1.5">
            <div className="flex gap-1.5 mb-2">
              {last7.map((d, i) => {
                const dentro = d.cal > 0 && d.cal <= meta;
                const isHoje = d.date === TODAY;
                const semDado = d.cal === 0;
                return (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-md flex items-center justify-center"
                    style={{
                      background: semDado ? '#F0EAE6' : isHoje ? '#E8621A' : dentro ? '#2D6A4F' : '#C0392B',
                    }}
                  >
                    {!semDado && (
                      <span className="text-[10px] text-white">{dentro || isHoje ? '✓' : '×'}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="font-serif font-bold text-3xl text-preto-carvao">
              {diasDentroMeta}/{diasComDado.length}
            </span>
            <span className="text-xs text-cinza-quente leading-snug">dias dentro<br />da meta</span>
          </div>

          {/* Média diária */}
          <div className="bg-white rounded-xl border border-cinza-borda p-6 flex flex-col justify-center items-center text-center gap-1.5">
            <div className="w-11 h-11 rounded-xl bg-laranja/10 flex items-center justify-center mb-2">
              <span className="text-xl">📊</span>
            </div>
            <span className="font-serif font-bold text-3xl text-preto-carvao">
              <AnimNum to={mediaSemanal} duration={1200} />
            </span>
            <span className="text-xs text-cinza-quente leading-snug">kcal de<br />média diária</span>
            {mediaSemanal > 0 && (
              <div
                className="mt-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{
                  background: mediaSemanal <= meta ? '#EAF4EF' : '#F9ECEA',
                  color: mediaSemanal <= meta ? '#2D6A4F' : '#C0392B',
                }}
              >
                {mediaSemanal <= meta
                  ? `${meta - mediaSemanal} kcal abaixo`
                  : `${mediaSemanal - meta} kcal acima`}
              </div>
            )}
          </div>
        </div>

        {/* ── COMPORTAMENTO ── */}
        <div className="mt-10" />
        <p className="text-[11px] font-medium tracking-widest uppercase text-cinza-quente mb-5">Comportamento</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mais calórica */}
          <div className="bg-white rounded-xl border border-cinza-borda p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-[10px] bg-vermelho/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🔥</span>
              </div>
              <div>
                <p className="text-[11px] font-medium tracking-wide uppercase text-cinza-quente mb-0.5">Mais calórica</p>
                <p className="text-sm font-medium text-preto-carvao">Hoje</p>
              </div>
            </div>
            {maisCalórica ? (
              <>
                <p className="text-base font-medium text-preto-carvao mb-1.5 leading-snug">{maisCalórica.meal_name}</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-serif font-bold text-2xl text-vermelho">{maisCalórica.calories}</span>
                  <span className="text-xs text-cinza-quente">kcal</span>
                </div>
              </>
            ) : (
              <p className="text-sm text-cinza-quente">Sem dados hoje.</p>
            )}
          </div>

          {/* Streak */}
          <div className="bg-white rounded-xl border border-cinza-borda p-6 md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-[10px] bg-amarelo/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⚡</span>
                </div>
                <div>
                  <p className="text-[11px] font-medium tracking-wide uppercase text-cinza-quente mb-0.5">Sequência</p>
                  <p className="text-sm font-medium text-preto-carvao">Dias dentro da meta</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-6xl text-preto-carvao leading-none">
                  {diasDentroMeta}
                </span>
                <span className="text-2xl">🔥</span>
              </div>
              <p className="text-sm text-cinza-quente mt-1">dias consecutivos esta semana</p>
            </div>
            <button
              onClick={() => navigate('/refeicoes')}
              className="px-5 py-2.5 bg-vermelho hover:bg-vermelho-escuro text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              + Registrar refeição
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
