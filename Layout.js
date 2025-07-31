'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '@/utils';
import { ArrowLeft, LogOut, Settings } from 'lucide-react';
import KanbanIcon from './components/crm/icons/KanbanIcon';

// Componente SidebarToggleIcon (agora importado diretamente)
const SidebarToggleIcon = ({ className, ...props }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M0 2.56641C0 1.60938 0.765625 0.816406 1.75 0.816406L12.25 0.816406C13.207 0.816406 14 1.60938 14 2.56641L14 11.3164C14 12.3008 13.207 13.0664 12.25 13.0664L1.75 13.0664C0.765625 13.0664 0 12.3008 0 11.3164L0 2.56641ZM6.125 11.7539L12.25 11.7539C12.4687 11.7539 12.6875 11.5625 12.6875 11.3164L12.6875 2.56641C12.6875 2.34766 12.4687 2.12891 12.25 2.12891L6.125 2.12891L6.125 11.7539ZM2.40625 3.87891L3.71875 3.87891C4.07422 3.87891 4.375 3.60547 4.375 3.22266C4.375 2.86719 4.07422 2.56641 3.71875 2.56641L2.40625 2.56641C2.02344 2.56641 1.75 2.86719 1.75 3.22266C1.75 3.60547 2.02344 3.87891 2.40625 3.87891ZM2.40625 5.19141C2.02344 5.19141 1.75 5.49219 1.75 5.84766C1.75 6.23047 2.02344 6.50391 2.40625 6.50391H3.71875C4.07422 6.50391 4.375 6.23047 4.375 5.84766C4.375 5.49219 4.07422 5.19141 3.71875 5.19141H2.40625ZM2.40625 9.12891H3.71875C4.07422 9.12891 4.375 8.85547 4.375 8.47266C4.375 8.11719 4.07422 7.81641 3.71875 7.81641H2.40625C2.02344 7.81641 1.75 8.11719 1.75 8.47266C1.75 8.85547 2.02344 9.12891 2.40625 9.12891Z"
      fill="#464646"
    />
  </svg>
);
// Fim do componente SidebarToggleIcon

const ToggleSidebarContext = React.createContext();

export function useToggleSidebar() {
  return React.useContext(ToggleSidebarContext);
}

function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          setLoggedUser(JSON.parse(user));
        } catch (err) {
          console.error('Erro ao ler usuário logado:', err);
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuRef]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setLoggedUser(null);
    router.push('/');
  };

  const navigationItems = [
    { title: 'Voltar ao Sistema', action: () => window.history.back(), icon: ArrowLeft },
    { title: 'CRM', url: createPageUrl('crm'), icon: KanbanIcon }
  ];

  const NavItem = ({ item }) => {
    const isActive = router.pathname === item.url || router.pathname === `/${item.url}` || router.pathname === '/crm';
    const content = (
      <>
        <item.icon className="flex-shrink-0 w-4 h-4" style={{ fill: isActive ? '#C2946D' : '#A0A0A0' }} />
        <span
          className={`text-span ${isCollapsed ? 'collapsed' : 'expanded'}`}
          style={{ marginLeft: '0.75rem' }}
        >
          {item.title}
        </span>
      </>
    );

    if (item.url) {
      return (
        <Link href={item.url} className={`nav-item ${isActive ? 'active' : ''}`}>
          {content}
        </Link>
      );
    }

    return (
      <div onClick={item.action} className="nav-item">
        {content}
      </div>
    );
  };
  
  const UserCard = ({ user, isCollapsed }) => {
    if (!user) return null;
    return (
      <div
        className={`
          p-2 rounded-xl transition-all duration-300 cursor-pointer
          ${isCollapsed ? 'hover:bg-gray-100' : ''}
          ${isUserMenuOpen ? 'bg-gray-100' : ''}
        `}
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      >
        <div className="flex items-center gap-3">
          <div className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
            <p className="text-sm font-semibold text-gray-900 whitespace-nowrap truncate">{user.name || 'Usuário'}</p>
            <p className="text-xs text-gray-500 whitespace-nowrap truncate">{user.email}</p>
          </div>
        </div>
      </div>
    );
  };
  
  if (router.pathname === createPageUrl('Welcome')) {
    return children;
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --background: #fcfcfc;
          --card: #ffffff;
          --border: #e1e1e2;
          --primary: #C2946D;
          --primary-foreground: #ffffff;
          --muted-foreground: #A0A0A0;
          --error: #E53E3E;
        }
        .nav-item-container {
          padding-left: 0.75rem;
          padding-right: 0.75rem;
        }
        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          padding-left: 1.25rem;
          padding-right: 1.25rem;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          min-height: 2.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.25;
          border-radius: 0.75rem;
          transition: all 0.2s;
          cursor: pointer;
          color: #545454;
        }
        .nav-item:hover {
          background-color: rgb(243 244 246 / 1);
        }
        .nav-item.active {
          color: #545454;
          border: 1px solid #c2946d;
          min-height: 45px;
        }
        .nav-item .text-span {
          margin-left: 0.75rem !important;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .nav-item .text-span.collapsed {
          opacity: 0;
          width: 0;
        }
        .nav-item .text-span.expanded {
          opacity: 1;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }
        ._next-dev-overlay,
        [data-nextjs-toast],
        #__next-build-watcher {
          display: none !important;
        }
      `}</style>
      <div className="flex text-gray-800 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif", height: '100vh' }}>
        <aside
          className={`flex flex-col bg-white transition-all duration-300 ease-in-out border-r border-[#E1E1E2] ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
          style={{ height: '100vh', overflowX: 'hidden' }}
        >
          <div className="flex items-center h-20 px-4 flex-shrink-0">
            <img
              src={
                isCollapsed
                  ? 'https://web.secretariaplus.com.br/media/logo-col.svg'
                  : 'https://web.secretariaplus.com.br/media/logo-blk.svg'
              }
              alt="Logo"
              className="h-10 transition-all duration-300"
            />
          </div>

          <nav className="flex-1 py-4 nav-item-container">
            {navigationItems.map((item) => (
              <NavItem key={item.title} item={item} />
            ))}
          </nav>

          <div className="p-3 relative flex-shrink-0" ref={userMenuRef}>
            {loggedUser && (
              <UserCard user={loggedUser} isCollapsed={isCollapsed} />
            )}
            {isUserMenuOpen && loggedUser && (
              <div 
                className={`absolute left-0 w-full p-2 bg-white border border-gray-200 rounded-xl shadow-lg transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'} z-50`}
                style={{ bottom: '70px' }}
              >
                <Link href="/login" className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  Perfil
                </Link>
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 px-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-gray-500" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-auto">
          <ToggleSidebarContext.Provider value={{ isCollapsed, toggleSidebar: () => setIsCollapsed(!isCollapsed) }}>
            {children}
          </ToggleSidebarContext.Provider>
        </main>
      </div>
    </>
  );
}

export default Layout;