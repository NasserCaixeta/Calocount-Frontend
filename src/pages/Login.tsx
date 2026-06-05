import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login, register } from '../api/auth';
import type { AxiosError } from 'axios';

type Mode = 'entrar' | 'cadastrar';

const playfair: React.CSSProperties = { fontFamily: "'Playfair Display', serif" };

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useAuth();

  const [modo, setModo] = useState<Mode>('entrar');
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [campos, setCampos] = useState({ nome: '', email: '', senha: '', meta: '2000' });

  const atualizar = (k: keyof typeof campos) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCampos((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      if (modo === 'entrar') {
        const resp = await login({ email: campos.email, password: campos.senha });
        setToken(resp.access_token);
        navigate('/dashboard');
      } else {
        await register({
          name: campos.nome,
          email: campos.email,
          password: campos.senha,
          daily_calorie_goal: Number(campos.meta) || 2000,
        });
        const resp = await login({ email: campos.email, password: campos.senha });
        setToken(resp.access_token);
        navigate('/dashboard');
      }
    } catch (err) {
      const ax = err as AxiosError<{ detail: string }>;
      setErro(ax.response?.data?.detail ?? 'Erro ao realizar operação.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = [
    'w-full py-[11px] px-[14px]',
    'border border-[#DDD5D0] rounded-[6px]',
    'text-[15px] text-[#1C1410] bg-white',
    'outline-none box-border',
    'transition-[border-color] duration-[180ms]',
    'focus:border-[#E8621A]',
  ].join(' ');

  const labelCls = 'block text-[11px] font-medium tracking-[0.09em] uppercase text-[#6B5B55] mb-[6px]';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF6F3]">

      {/* ── Painel esquerdo ── */}
      <div className="hidden md:flex w-[42%] shrink-0 flex-col justify-between py-[52px] px-12 relative overflow-hidden bg-[#1C1410]">
        <div className="absolute bottom-[-80px] right-[-60px] w-[280px] h-[280px] rounded-full border border-[#E8621A]/20 pointer-events-none" />
        <div className="absolute bottom-[-120px] right-[-100px] w-[380px] h-[380px] rounded-full border border-[#C0392B]/10 pointer-events-none" />

        {/* Logo */}
        <div>
          <div className="flex items-baseline gap-[3px] mb-[6px]">
            <span className="text-[15px] text-[#E8621A] tracking-[0.06em] italic font-normal" style={playfair}>
              calo
            </span>
            <span className="text-[22px] text-white font-bold tracking-[-0.01em]" style={playfair}>
              Count
            </span>
          </div>
          <div className="w-7 h-0.5 bg-[#C0392B] rounded" />
        </div>

        {/* Texto central */}
        <div>
          <p className="text-[38px] text-white leading-[1.2] mb-5 tracking-[-0.02em] italic font-normal" style={playfair}>
            Comer bem<br />
            <span className="text-[#E8621A]">começa</span> com<br />
            consciência.
          </p>
          <p className="text-[13px] text-[#8A7B75] leading-[1.7] max-w-[240px]">
            Registre refeições, fotografe seu prato e acompanhe sua meta calórica diária.
          </p>
        </div>

        {/* Rodapé */}
        <div className="flex items-center gap-3">
          {['café', 'almoço', 'jantar'].map((ref, i) => (
            <div
              key={i}
              className={`text-[11px] tracking-[0.1em] uppercase font-medium ${i === 0 ? 'text-[#E8621A]' : 'text-[#4A3E3A]'}`}
            >
              {ref}
              {i < 2 && <span className="ml-3 text-[#2E2420]">·</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Painel direito ── */}
      <div className="flex-1 flex items-center justify-center py-10 px-6 sm:py-[52px] sm:px-12">
        <div className="w-full max-w-[360px]">

          {/* Alternador de modo */}
          <div className="flex gap-6 mb-10">
            {(['entrar', 'cadastrar'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setModo(m); setErro(''); }}
                className="pb-2 text-[15px] bg-transparent border-0 border-b-2 transition-all duration-[180ms] cursor-pointer"
                style={{
                  fontWeight: modo === m ? 500 : 400,
                  color: modo === m ? '#1C1410' : '#6B5B55',
                  borderBottomColor: modo === m ? '#C0392B' : 'transparent',
                }}
              >
                {m === 'entrar' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {/* Campos */}
          <div className="flex flex-col gap-4">
            {modo === 'cadastrar' && (
              <div>
                <label className={labelCls}>Nome</label>
                <input className={inputCls} placeholder="Como quer ser chamado?" value={campos.nome} onChange={atualizar('nome')} required />
              </div>
            )}

            <div>
              <label className={labelCls}>E-mail</label>
              <input className={inputCls} type="email" placeholder="seu@email.com" value={campos.email} onChange={atualizar('email')} required />
            </div>

            <div>
              <div className="flex justify-between items-baseline mb-[6px]">
                <label className="text-[11px] font-medium tracking-[0.09em] uppercase text-[#6B5B55]">Senha</label>
                {modo === 'entrar' && (
                  <span className="text-[12px] text-[#E8621A] cursor-pointer">Esqueceu?</span>
                )}
              </div>
              <div className="relative">
                <input
                  className={`${inputCls} pr-11`}
                  type={verSenha ? 'text' : 'password'}
                  placeholder={modo === 'cadastrar' ? 'Mínimo 8 caracteres' : 'Sua senha'}
                  value={campos.senha}
                  onChange={atualizar('senha')}
                  required
                />
                <button
                  type="button"
                  onClick={() => setVerSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#6B5B55] bg-transparent border-none cursor-pointer p-0"
                >
                  {verSenha ? 'ocultar' : 'ver'}
                </button>
              </div>
            </div>

            {modo === 'cadastrar' && (
              <div>
                <label className={labelCls}>Meta diária (kcal)</label>
                <input className={inputCls} type="number" placeholder="ex: 2000" value={campos.meta} onChange={atualizar('meta')} />
                <p className="text-[12px] text-[#6B5B55] mt-[6px]">
                  Pode ajustar depois. Média adulto: 1800–2200 kcal.
                </p>
              </div>
            )}
          </div>

          {/* Erro */}
          {erro && (
            <p className="mt-4 px-[14px] py-[10px] rounded-[6px] text-[13px] text-[#C0392B] bg-[#F9ECEA] border border-[#C0392B]/20">
              {erro}
            </p>
          )}

          {/* Botão principal */}
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full mt-7 py-[14px] bg-[#C0392B] hover:bg-[#922B21] disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-[6px] text-[14px] font-medium tracking-[0.04em] border-none cursor-pointer transition-[background] duration-[180ms]"
          >
            {loading ? 'Aguarde...' : modo === 'entrar' ? 'Entrar na conta' : 'Criar conta'}
          </button>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#DDD5D0]" />
            <span className="text-[12px] text-[#6B5B55]">ou</span>
            <div className="flex-1 h-px bg-[#DDD5D0]" />
          </div>

          {/* Google — desabilitado */}
          <button
            disabled
            className="w-full py-3 border border-[#DDD5D0] rounded-[6px] text-[14px] text-[#6B5B55] bg-white flex items-center justify-center gap-[10px] opacity-50 cursor-not-allowed"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908C16.658 14.253 17.64 11.945 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.997 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          {/* Troca de modo */}
          <p className="text-center mt-7 text-[13px] text-[#6B5B55]">
            {modo === 'entrar' ? 'Ainda não tem conta? ' : 'Já tem conta? '}
            <span
              onClick={() => setModo(modo === 'entrar' ? 'cadastrar' : 'entrar')}
              className="text-[#C0392B] font-medium cursor-pointer"
            >
              {modo === 'entrar' ? 'Cadastre-se' : 'Entrar'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
