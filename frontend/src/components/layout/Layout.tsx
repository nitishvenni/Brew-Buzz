import { NavLink, useLocation, Link } from 'react-router-dom';
import { Home, Store, Package, BarChart3, ChevronDown, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  to?: string;
  disabled?: boolean;
  badge?: number;
  comingSoon?: boolean;
  isActiveOverride?: boolean;
}

const NavItem = ({ icon: Icon, label, to, disabled, badge, comingSoon, isActiveOverride }: NavItemProps) => {
  if (disabled || !to) {
    return (
      <div className="flex flex-col mb-1 group">
        <button
          className={cn(
            "flex items-center w-full px-4 py-2.5 rounded-xl transition-all duration-200",
            "text-[#8c7b6c] opacity-60 cursor-not-allowed"
          )}
          disabled
        >
          <Icon className="w-5 h-5 mr-3 shrink-0" />
          <span className="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">{label}</span>
          {comingSoon && (
            <span className="text-[9px] font-bold text-[#bbaaa0] bg-[#f5efe6] border border-[#ece3d4] px-1.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wider">
              Soon
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          "flex items-center w-full px-4 py-2.5 rounded-xl mb-1 transition-all duration-200 group",
          isActive || isActiveOverride
            ? "bg-[#c89f70] text-white shadow-sm shadow-[#c89f70]/20 font-medium"
            : "text-[#7a6b5d] hover:bg-[#f3ede4] hover:text-[#5c4d3c]"
        )
      }
    >
      <Icon className="w-5 h-5 mr-3 shrink-0" />
      <span className="flex-1 text-left text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2">{label}</span>
      {isActiveOverride && (
         <span className="text-[9px] font-bold text-green-700 bg-green-100 border border-green-200 px-1.5 py-0.5 rounded flex-shrink-0 uppercase tracking-wider">
           Active
         </span>
      )}
      {badge !== undefined && (
        <span className="bg-[#e87c48] text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0">
          {badge}
        </span>
      )}
    </NavLink>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  const location = useLocation();

  const pageTitle = title || (location.pathname === '/outlet-performance' ? 'Outlet Performance' : 'Welcome Admin');
  const pageSubtitle = subtitle || (location.pathname === '/outlet-performance'
    ? 'Monitor, compare, and investigate franchise outlet performance.'
    : "Here's your franchise performance overview.");

  return (
    <div className="flex h-screen bg-[#faf8f5] text-[#3d3228] font-sans">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#fdfaf6] border-r border-[#ece3d4] flex flex-col h-full shadow-sm shrink-0">
        <div className="p-6 flex flex-col items-center border-b border-[#ece3d4]/50 shrink-0">
          <Link to="/landing" state={{ returnToReveal: true }} className="focus:outline-none focus:ring-2 focus:ring-[#c89f70] rounded-md transition-all hover:opacity-80">
            <img src="/images/logo.png" alt="Brew Buzz" className="w-32 h-auto object-contain mb-2" />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto py-5 px-4 custom-scrollbar">
          
          <div className="mb-8">
            <h4 className="text-[10px] font-bold text-[#bbaaa0] uppercase tracking-widest mb-3 px-4">Business Intelligence</h4>
            <NavItem icon={Home} label="Franchise Intelligence" to="/" />
            <NavItem icon={Store} label="Outlet Performance" to="/outlet-performance" isActiveOverride={location.pathname.startsWith('/outlet-performance')} />
            <NavItem icon={Package} label="Inventory Intelligence" to="/inventory" isActiveOverride={location.pathname.startsWith('/inventory')} />
            <NavItem icon={Users} label="Workforce Intelligence" to="/workforce" isActiveOverride={location.pathname.startsWith('/workforce')} />
            <NavItem icon={BarChart3} label="Marketing Intelligence" to="/marketing" isActiveOverride={location.pathname.startsWith('/marketing')} />
          </div>
        </div>
        
        <div className="p-4 border-t border-[#ece3d4]/50 shrink-0 bg-[#fdfaf6]">
           <div className="flex items-center space-x-3 hover:bg-[#f3ede4] p-2 rounded-xl transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-[#c89f70] rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0 border border-[#b08558]">
                AD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#4a3b2c] truncate">Admin</p>
                <p className="text-xs text-[#8c7b6c] truncate">Franchise Owner</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#8c7b6c]" />
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-[#ece3d4] flex items-center justify-between px-8 z-10 sticky top-0 shrink-0">
          <div>
            <h2 className="text-2xl font-extrabold text-[#4a3b2c] tracking-tight">{pageTitle}</h2>
            <p className="text-[#8c7b6c] text-sm mt-0.5 font-medium">{pageSubtitle}</p>
          </div>
          

        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
