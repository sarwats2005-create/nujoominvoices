import React, { useRef, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FilePlus, Settings, Menu, Sun, Moon, BarChart3, Mail, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { gsap } from 'gsap';
const GLOW_COLOR = '132, 0, 255';
const MagicNavLink: React.FC<{
  to: string;
  isActive: boolean;
  icon: React.ElementType;
  label: string;
  mobile?: boolean;
  onClick?: () => void;
}> = ({
  to,
  isActive,
  icon: Icon,
  label,
  mobile = false,
  onClick
}) => {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const handleMouseEnter = useCallback(() => {
    if (!linkRef.current) return;
    gsap.to(linkRef.current, {
      scale: 1.05,
      duration: 0.2,
      ease: 'power2.out'
    });
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (!linkRef.current) return;
    gsap.to(linkRef.current, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  }, []);
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maxDistance = Math.max(rect.width, rect.height);
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${maxDistance * 2}px;
      height: ${maxDistance * 2}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(${GLOW_COLOR}, 0.4) 0%, rgba(${GLOW_COLOR}, 0.2) 30%, transparent 70%);
      left: ${x - maxDistance}px;
      top: ${y - maxDistance}px;
      pointer-events: none;
      z-index: 1000;
    `;
    linkRef.current.appendChild(ripple);
    gsap.fromTo(ripple, {
      scale: 0,
      opacity: 1
    }, {
      scale: 1,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
    onClick?.();
  }, [onClick]);
  return <Link ref={linkRef} to={to} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`relative overflow-hidden flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-foreground'} ${mobile ? 'w-full' : ''}`} style={{
    transformOrigin: 'center'
  }}>
      <Icon className="h-4 w-4" />
      <span className="font-sans">{label}</span>
    </Link>;
};
const MagicIconButton: React.FC<{
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
}> = ({
  onClick,
  title,
  children
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const handleMouseEnter = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, {
      scale: 1.1,
      rotation: 10,
      duration: 0.2,
      ease: 'power2.out'
    });
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current) return;
    gsap.to(buttonRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.2,
      ease: 'power2.out'
    });
  }, []);
  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const maxDistance = Math.max(rect.width, rect.height);
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: ${maxDistance * 2}px;
      height: ${maxDistance * 2}px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(${GLOW_COLOR}, 0.4) 0%, rgba(${GLOW_COLOR}, 0.2) 30%, transparent 70%);
      left: ${x - maxDistance}px;
      top: ${y - maxDistance}px;
      pointer-events: none;
      z-index: 1000;
    `;
    buttonRef.current.appendChild(ripple);
    gsap.fromTo(ripple, {
      scale: 0,
      opacity: 1
    }, {
      scale: 1,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out',
      onComplete: () => ripple.remove()
    });
    onClick();
  }, [onClick]);
  return <Button ref={buttonRef} variant="ghost" size="icon" onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} title={title} className="relative overflow-hidden">
      {children}
    </Button>;
};
const Header: React.FC = () => {
  const {
    t
  } = useLanguage();
  const {
    logo,
    isDarkMode,
    toggleDarkMode
  } = useSettings();
  const {
    signOut
  } = useAuth();
  const location = useLocation();
  const navItems = [{
    path: '/dashboard',
    label: t('dashboard'),
    icon: LayoutDashboard
  }, {
    path: '/new-invoice',
    label: t('newInvoice'),
    icon: FilePlus
  }, {
    path: '/insights',
    label: t('insights'),
    icon: BarChart3
  }, {
    path: '/contact',
    label: t('contact'),
    icon: Mail
  }, {
    path: '/settings',
    label: t('settings'),
    icon: Settings
  }];
  const NavLinks = ({
    mobile = false,
    onClose
  }: {
    mobile?: boolean;
    onClose?: () => void;
  }) => <>
      {navItems.map(({
      path,
      label,
      icon
    }) => <MagicNavLink key={path} to={path} isActive={location.pathname === path} icon={icon} label={label} mobile={mobile} onClick={onClose} />)}
    </>;
  return <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
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
              <div className="flex flex-col gap-4 mt-8">
                <NavLinks mobile onClose={() => {}} />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            {logo ? <img src={logo} alt="Logo" className="h-10 w-auto object-scale-down border border-transparent" /> : <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg">📄</span>
              </div>}
            <h1 className="text-lg font-bold text-foreground hidden sm:block">
              {t('appTitle')}
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLinks />
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
    </header>;
};
export default Header;