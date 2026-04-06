import React, { useRef, useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FilePlus, Settings, Menu, Sun, Moon, BarChart3, Mail, LogOut, Shield, ClipboardList, FolderOpen, ShoppingCart, Boxes, ChevronDown } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { gsap } from 'gsap';

const GLOW_COLOR = '132, 0, 255';

const MagicNavLink: React.FC<{
  to: string;
  isActive: boolean;
  icon: React.ElementType;
  label: string;
  mobile?: boolean;
  onClick?: () => void;
}> = ({ to, isActive, icon: Icon, label, mobile = false, onClick }) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const handleMouseEnter = useCallback(() => {
    if (!linkRef.current) return;
    gsap.to(linkRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (!linkRef.current) return;
    gsap.to(linkRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
  }, []);
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maxDistance = Math.max(rect.width, rect.height);
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute; width: ${maxDistance * 2}px; height: ${maxDistance * 2}px; border-radius: 50%;
      background: radial-gradient(circle, rgba(${GLOW_COLOR}, 0.4) 0%, rgba(${GLOW_COLOR}, 0.2) 30%, transparent 70%);
      left: ${x - maxDistance}px; top: ${y - maxDistance}px; pointer-events: none; z-index: 1000;
    `;
    linkRef.current.appendChild(ripple);
    gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.5, ease: 'power2.out', onComplete: () => ripple.remove() });
    onClick?.();
  }, [onClick]);

  return (
    <Link
      ref={linkRef}
      to={to}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`hover-glow relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'} ${mobile ? 'w-full' : ''}`}
      style={{ transformOrigin: 'center' }}
    >
      <Icon className="h-4 w-4" />
      <span className="font-sans">{label}</span>
    </Link>
  );
};

const MagicIconButton: React.FC<{
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}> = ({ onClick, title, children }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleMouseEnter = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, { scale: 1.1, rotation: 10, duration: 0.2, ease: 'power2.out' });
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, { scale: 1, rotation: 0, duration: 0.2, ease: 'power2.out' });
  }, []);
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maxDistance = Math.max(rect.width, rect.height);
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute; width: ${maxDistance * 2}px; height: ${maxDistance * 2}px; border-radius: 50%;
      background: radial-gradient(circle, rgba(${GLOW_COLOR}, 0.4) 0%, rgba(${GLOW_COLOR}, 0.2) 30%, transparent 70%);
      left: ${x - maxDistance}px; top: ${y - maxDistance}px; pointer-events: none; z-index: 1000;
    `;
    buttonRef.current.appendChild(ripple);
    gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 1, opacity: 0, duration: 0.4, ease: 'power2.out', onComplete: () => ripple.remove() });
    onClick();
  }, [onClick]);

  return (
    <Button ref={buttonRef} variant="ghost" size="icon" onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} title={title} className="relative overflow-hidden">
      {children}
    </Button>
  );
};

/* ---------- Dropdown Nav Group ---------- */
const NavDropdown: React.FC<{
  label: string;
  icon: React.ElementType;
  items: { path: string; label: string; icon: React.ElementType }[];
  currentPath: string;
  onNavigate?: () => void;
}> = ({ label, icon: Icon, items, currentPath, onNavigate }) => {
  const navigate = useNavigate();
  const isGroupActive = items.some(i => currentPath.startsWith(i.path));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`hover-glow relative overflow-hidden flex items-center gap-1.5 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isGroupActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'}`}
        >
          <Icon className="h-4 w-4" />
          <span className="font-sans">{label}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {items.map(item => (
          <DropdownMenuItem
            key={item.path}
            onClick={() => { navigate(item.path); onNavigate?.(); }}
            className={`flex items-center gap-2 cursor-pointer ${currentPath === item.path ? 'bg-accent' : ''}`}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/* ---------- Mobile dropdown group (accordion-like) ---------- */
const MobileNavGroup: React.FC<{
  label: string;
  icon: React.ElementType;
  items: { path: string; label: string; icon: React.ElementType }[];
  currentPath: string;
  onClose?: () => void;
}> = ({ label, icon: Icon, items, currentPath, onClose }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent text-foreground transition-colors"
      >
        <Icon className="h-4 w-4" />
        <span className="font-sans flex-1 text-left">{label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="ml-4 flex flex-col gap-1 mt-1">
          {items.map(item => (
            <MagicNavLink
              key={item.path}
              to={item.path}
              isActive={currentPath === item.path}
              icon={item.icon}
              label={item.label}
              mobile
              onClick={onClose}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const { t } = useLanguage();
  const { logo, isDarkMode, toggleDarkMode } = useSettings();
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const location = useLocation();

  // Group 1: Dashboard dropdown (Dashboard, New Invoice, Insights)
  const dashboardGroup = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    ...(isAdmin ? [{ path: '/new-invoice', label: t('newInvoice'), icon: FilePlus }] : []),
    { path: '/insights', label: t('insights'), icon: BarChart3 },
  ];

  // Group 2: B/L dropdown (Used BL, Unused BL)
  const blGroup = isAdmin ? [
    { path: '/used-bl', label: t('usedBL'), icon: ClipboardList },
    { path: '/unused-bl', label: t('unusedBL'), icon: FolderOpen },
  ] : [];

  // Group 3: POS dropdown (POS, Inventory)
  const posGroup = [
    { path: '/pos', label: 'POS', icon: ShoppingCart },
    { path: '/inventory', label: 'Inventory', icon: Boxes },
  ];

  // Standalone items
  const standaloneItems = [
    { path: '/contact', label: t('contact'), icon: Mail },
    ...(isAdmin ? [{ path: '/settings', label: t('settings'), icon: Settings }] : []),
  ];

  const DesktopNav = () => (
    <>
      <NavDropdown label={t('dashboard')} icon={LayoutDashboard} items={dashboardGroup} currentPath={location.pathname} />
      {blGroup.length > 0 && (
        <NavDropdown label="B/L" icon={ClipboardList} items={blGroup} currentPath={location.pathname} />
      )}
      <NavDropdown label="POS" icon={ShoppingCart} items={posGroup} currentPath={location.pathname} />
      {standaloneItems.map(item => (
        <MagicNavLink key={item.path} to={item.path} isActive={location.pathname === item.path} icon={item.icon} label={item.label} />
      ))}
    </>
  );

  const MobileNav = ({ onClose }: { onClose?: () => void }) => (
    <>
      <MobileNavGroup label={t('dashboard')} icon={LayoutDashboard} items={dashboardGroup} currentPath={location.pathname} onClose={onClose} />
      {blGroup.length > 0 && (
        <MobileNavGroup label="B/L" icon={ClipboardList} items={blGroup} currentPath={location.pathname} onClose={onClose} />
      )}
      <MobileNavGroup label="POS" icon={ShoppingCart} items={posGroup} currentPath={location.pathname} onClose={onClose} />
      {standaloneItems.map(item => (
        <MagicNavLink key={item.path} to={item.path} isActive={location.pathname === item.path} icon={item.icon} label={item.label} mobile onClick={onClose} />
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-card">
              <div className="flex flex-col gap-2 mt-8">
                <MobileNav onClose={() => {}} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Logo" className="h-10 w-auto object-scale-down border border-transparent px-[10px] py-[8px] mx-px my-px" />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">📄</span>
              </div>
            )}
            <h1 className="text-lg font-bold text-foreground hidden sm:block">
              {t('appTitle')}
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <DesktopNav />
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <MagicIconButton onClick={toggleDarkMode}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </MagicIconButton>
          <MagicIconButton onClick={signOut} title={t('logout')}>
            <LogOut className="h-5 w-5" />
          </MagicIconButton>
        </div>
      </div>
    </header>
  );
};

export default Header;
