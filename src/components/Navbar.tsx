import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Refeições', path: '/refeicoes' },
  { label: 'Histórico', path: '/historico' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <nav className="bg-preto-carvao px-4 sm:px-10 flex items-center justify-between h-14 sticky top-0 z-10">
      <button onClick={() => navigate('/dashboard')} className="flex items-baseline gap-1 cursor-pointer shrink-0">
        <span className="font-serif italic text-laranja text-sm tracking-wide">calo</span>
        <span className="font-serif font-bold text-white text-lg">Count</span>
      </button>

      <div className="flex gap-2 sm:gap-7 items-center">
        {links.map((link) => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`text-xs sm:text-sm cursor-pointer border-b-[1.5px] pb-0.5 transition-colors ${
                active
                  ? 'text-laranja border-laranja font-medium'
                  : 'text-[#4A3E3A] border-transparent hover:text-white'
              }`}
            >
              {link.label}
            </button>
          );
        })}

        <div className="relative group">
          <button
            onClick={() => navigate('/perfil')}
            className="w-8 h-8 rounded-full bg-laranja flex items-center justify-center cursor-pointer text-white font-bold text-sm font-serif"
          >
            {initials}
          </button>
          <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-cinza-borda opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
            <button
              onClick={() => navigate('/perfil')}
              className="w-full text-left px-4 py-2 text-sm text-cinza-quente hover:text-preto-carvao"
            >
              Perfil
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-vermelho hover:bg-vermelho-fundo rounded-b-lg"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
