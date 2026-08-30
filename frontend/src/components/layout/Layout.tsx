
import { Home, Store, Package, ShoppingBag, BarChart3, BrainCircuit, FileText, Bell, Settings, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  disabled?: boolean;
  badge?: number;
}

const NavItem = ({ icon: Icon, label, active, disabled, badge }: NavItemProps) => (
  <button 
    className={cn(
      "flex items-center w-full px-4 py-3 rounded-xl mb-1 transition-all duration-200",
      active 
        ? "bg-[#c89f70] text-white shadow-md shadow-[#c89f70]/20 font-medium" 
        : "text-[#7a6b5d] hover:bg-[#f3ede4] hover:text-[#5c4d3c]",
      disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
    )}
    disabled={disabled}
  >
    <Icon className="w-5 h-5 mr-3" />
    <span className="flex-1 text-left">{label}</span>
    {badge !== undefined && (
      <span className="bg-[#e87c48] text-white text-xs font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#faf8f5] text-[#3d3228] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#fdfaf6] border-r border-[#ece3d4] flex flex-col h-full shadow-sm">
        <div className="p-6 flex flex-col items-center border-b border-[#ece3d4]/50">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-[#ece3d4] flex items-center justify-center mb-3">
             <Store className="w-8 h-8 text-[#c89f70]" />
          </div>
          <h1 className="text-2xl font-bold text-[#4a3b2c] tracking-tight">Brew Buzz</h1>
          <p className="text-[#8c7b6c] text-xs font-medium uppercase tracking-widest mt-1">Pizza • Coffee</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <NavItem icon={Home} label="Overview" active />
          <NavItem icon={Store} label="Outlet Performance" />
          <NavItem icon={Package} label="Products" />
          <NavItem icon={ShoppingBag} label="Orders" />
          <NavItem icon={BarChart3} label="Analytics" disabled />
          <NavItem icon={BrainCircuit} label="AI Insights" disabled />
          <NavItem icon={FileText} label="Reports" disabled />
          <NavItem icon={Bell} label="Alerts" badge={3} disabled />
          <NavItem icon={Settings} label="Settings" disabled />
        </div>
        
        <div className="p-6 border-t border-[#ece3d4]/50">
          <div className="bg-[#f5efe6] rounded-2xl p-4 text-center">
            <h4 className="font-bold text-[#5c4d3c] mb-1">Brew Buzz AI</h4>
            <p className="text-xs text-[#8c7b6c] mb-3">Intelligent franchise insights.</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#ece3d4] flex items-center justify-between px-8 z-10 sticky top-0">
          <div>
            <h2 className="text-2xl font-bold text-[#4a3b2c]">Welcome Admin</h2>
            <p className="text-[#8c7b6c] text-sm mt-0.5">Here's your franchise performance overview.</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8c7b6c] absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search outlets, products..." 
                className="pl-9 pr-4 py-2 bg-[#fdfaf6] border border-[#ece3d4] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#c89f70]/50 focus:border-[#c89f70] w-64 transition-all"
              />
            </div>
            
            <button className="relative p-2 text-[#8c7b6c] hover:bg-[#f3ede4] rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#e87c48] rounded-full ring-2 ring-white"></span>
            </button>
            
            <div className="flex items-center space-x-3 border-l border-[#ece3d4] pl-6">
              <div className="w-10 h-10 bg-[#c89f70] rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                AD
              </div>
              <div>
                <p className="text-sm font-bold text-[#4a3b2c]">Admin</p>
                <p className="text-xs text-[#8c7b6c]">Franchise Owner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
