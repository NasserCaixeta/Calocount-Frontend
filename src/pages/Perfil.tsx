import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { updateMe, changePassword, deleteAccount } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

function Section({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-cinza-borda overflow-hidden">
      <div className="px-7 py-5 border-b border-cinza-fundo">
        <h2 className="font-serif italic font-normal text-xl text-preto-carvao mb-0.5">{titulo}</h2>
        {subtitulo && <p className="text-sm text-cinza-quente">{subtitulo}</p>}
      </div>
      <div className="p-7">{children}</div>
    </div>
  );
}

function Toast({ msg, tipo }: { msg: string; tipo: 'ok' | 'erro' }) {
  return (
    <div
      className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-sans animate-[fadeIn_0.2s_ease]"
      style={{
        background: tipo === 'ok' ? '#EAF4EF' : '#F9ECEA',
        color: tipo === 'ok' ? '#2D6A4F' : '#C0392B',
        borderColor: tipo === 'ok' ? 'rgba(45,106,79,0.2)' : 'rgba(192,57,43,0.2)',
      }}
    >
      <span>{tipo === 'ok' ? '✓' : '✕'}</span>
      <span>{msg}</span>
    </div>
  );
}

function Field({
  label, type = 'text', value, onChange, placeholder, hint, disabled, suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-[11px] font-medium tracking-wide uppercase text-cinza-quente mb-1.5 font-sans">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: `1.5px solid ${focused ? '#E8621A' : disabled ? '#F0EAE6' : '#DDD5D0'}`,
            background: disabled ? '#F0EAE6' : '#FFFFFF',
            color: disabled ? '#6B5B55' : '#1C1410',
          }}
          className="w-full px-3 py-2.5 rounded-lg text-sm font-sans outline-none transition-colors box-border"
        />
        {suffix}
      </div>
      {hint && <p className="text-xs text-cinza-quente mt-1 leading-snug">{hint}</p>}
    </div>
  );
}

export default function Perfil() {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();

  const [nome, setNome] = useState(user?.name ?? '');
  const [meta, setMeta] = useState(String(user?.daily_calorie_goal ?? 2000));
  const [feedbackPerfil, setFeedbackPerfil] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [verAtual, setVerAtual] = useState(false);
  const [verNova, setVerNova] = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const [feedbackSenha, setFeedbackSenha] = useState<{ tipo: 'ok' | 'erro'; msg: string } | null>(null);

  const [modalExcluir, setModalExcluir] = useState(false);

  const { mutate: salvarPerfil, isPending: savingPerfil } = useMutation({
    mutationFn: () => updateMe({ name: nome, daily_calorie_goal: Number(meta) }),
    onSuccess: async () => {
      await refreshUser();
      setFeedbackPerfil({ tipo: 'ok', msg: 'Perfil atualizado com sucesso.' });
    },
    onError: () => setFeedbackPerfil({ tipo: 'erro', msg: 'Erro ao atualizar perfil.' }),
  });

  const { mutate: salvarSenha, isPending: savingSenha } = useMutation({
    mutationFn: () => changePassword({ current_password: senhaAtual, new_password: novaSenha }),
    onSuccess: () => {
      setFeedbackSenha({ tipo: 'ok', msg: 'Senha alterada com sucesso.' });
      setSenhaAtual(''); setNovaSenha(''); setConfirmarSenha('');
    },
    onError: () => setFeedbackSenha({ tipo: 'erro', msg: 'Senha atual incorreta.' }),
  });

  const { mutate: excluirConta, isPending: deleting } = useMutation({
    mutationFn: () => deleteAccount(),
    onSuccess: () => { logout(); navigate('/'); },
  });

  const forca = (() => {
    if (!novaSenha) return 0;
    let pts = 0;
    if (novaSenha.length >= 8) pts++;
    if (/[A-Z]/.test(novaSenha)) pts++;
    if (/[0-9]/.test(novaSenha)) pts++;
    if (/[^A-Za-z0-9]/.test(novaSenha)) pts++;
    return pts;
  })();
  const forcaLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
  const forcaCor = ['', '#C0392B', '#E8621A', '#D4A017', '#2D6A4F'];

  const senhaValida = senhaAtual.length >= 6 && novaSenha.length >= 8 && novaSenha === confirmarSenha;

  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  const ToggleSenha = ({ ver, onToggle }: { ver: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cinza-quente cursor-pointer font-sans tracking-wide"
    >
      {ver ? 'ocultar' : 'ver'}
    </button>
  );

  return (
    <div className="min-h-screen bg-fundo-quente font-sans">
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <Navbar />

      <div className="max-w-[680px] mx-auto px-8 py-12 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div
            className="w-16 h-16 rounded-full bg-preto-carvao flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '0 0 0 3px #FAF6F3, 0 0 0 5px #DDD5D0' }}
          >
            <span className="font-serif font-bold text-2xl text-laranja">{initials}</span>
          </div>
          <div>
            <h1 className="font-serif italic font-normal text-3xl text-preto-carvao mb-0.5">{user?.name}</h1>
            <p className="text-sm text-cinza-quente">{user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* ── Dados gerais ── */}
          <Section titulo="Dados do perfil" subtitulo="Nome e meta calórica diária.">
            <div className="flex flex-col gap-4">
              <Field label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
              <div>
                <label className="block text-[11px] font-medium tracking-wide uppercase text-cinza-quente mb-3 font-sans">
                  Meta calórica diária
                </label>
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {[1500, 1800, 2000, 2200, 2500, 3000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMeta(String(v))}
                      className="py-2.5 rounded-lg text-sm font-sans cursor-pointer transition-all"
                      style={{
                        border: `1.5px solid ${meta === String(v) ? '#E8621A' : '#DDD5D0'}`,
                        background: meta === String(v) ? 'rgba(232,98,26,0.08)' : '#FFFFFF',
                        color: meta === String(v) ? '#E8621A' : '#6B5B55',
                        fontWeight: meta === String(v) ? '500' : '400',
                      }}
                    >
                      {v.toLocaleString('pt-BR')} kcal
                    </button>
                  ))}
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <Field
                      label="Ou insira manualmente"
                      type="number"
                      value={meta}
                      onChange={(e) => setMeta(e.target.value)}
                      placeholder="ex: 1900"
                      hint="Média adulto: 1800–2200 kcal."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-1">
                {feedbackPerfil ? <Toast msg={feedbackPerfil.msg} tipo={feedbackPerfil.tipo} /> : <div />}
                <button
                  onClick={() => salvarPerfil()}
                  disabled={savingPerfil}
                  className="px-5 py-2.5 bg-vermelho hover:bg-vermelho-escuro text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {savingPerfil ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          </Section>

          {/* ── Senha ── */}
          <Section titulo="Senha" subtitulo="Use uma senha forte com letras, números e símbolos.">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Field
                  label="Senha atual"
                  type={verAtual ? 'text' : 'password'}
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  placeholder="Digite sua senha atual"
                  suffix={<ToggleSenha ver={verAtual} onToggle={() => setVerAtual((v) => !v)} />}
                />
              </div>

              <div className="h-px bg-cinza-fundo" />

              <div className="relative">
                <Field
                  label="Nova senha"
                  type={verNova ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  suffix={<ToggleSenha ver={verNova} onToggle={() => setVerNova((v) => !v)} />}
                />
              </div>

              {novaSenha.length > 0 && (
                <div>
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="flex-1 h-[3px] rounded-sm transition-colors duration-300"
                        style={{ background: n <= forca ? forcaCor[forca] : '#F0EAE6' }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: forcaCor[forca] }}>
                    {forcaLabel[forca]}
                  </p>
                </div>
              )}

              <div className="relative">
                <Field
                  label="Confirmar nova senha"
                  type={verConfirmar ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  suffix={<ToggleSenha ver={verConfirmar} onToggle={() => setVerConfirmar((v) => !v)} />}
                  hint={confirmarSenha.length > 0 && confirmarSenha !== novaSenha ? 'As senhas não coincidem.' : undefined}
                />
              </div>

              <div className="flex justify-between items-center mt-1">
                {feedbackSenha ? <Toast msg={feedbackSenha.msg} tipo={feedbackSenha.tipo} /> : <div />}
                <button
                  onClick={() => salvarSenha()}
                  disabled={!senhaValida || savingSenha}
                  className="px-5 py-2.5 bg-vermelho hover:bg-vermelho-escuro text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                >
                  {savingSenha ? 'Alterando...' : 'Alterar senha'}
                </button>
              </div>
            </div>
          </Section>

          {/* ── Zona de perigo ── */}
          <Section titulo="Zona de perigo">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-preto-carvao mb-0.5">Excluir conta</p>
                <p className="text-xs text-cinza-quente">Remove permanentemente seus dados e refeições registradas.</p>
              </div>
              <button
                onClick={() => setModalExcluir(true)}
                className="flex-shrink-0 ml-5 px-4 py-2.5 border border-vermelho rounded-lg text-sm font-medium text-vermelho bg-transparent hover:bg-vermelho-fundo transition-colors cursor-pointer"
              >
                Excluir conta
              </button>
            </div>
          </Section>
        </div>
      </div>

      {/* Modal confirmação */}
      {modalExcluir && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <h3 className="font-serif italic text-2xl text-preto-carvao mb-2">Tem certeza?</h3>
            <p className="text-sm text-cinza-quente mb-6 leading-relaxed">
              Sua conta e todas as refeições serão removidas permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalExcluir(false)}
                className="flex-1 py-2.5 border border-cinza-borda rounded-lg text-sm text-cinza-quente hover:bg-cinza-fundo transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => excluirConta()}
                disabled={deleting}
                className="flex-1 py-2.5 bg-vermelho hover:bg-vermelho-escuro text-white text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                {deleting ? 'Excluindo...' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
