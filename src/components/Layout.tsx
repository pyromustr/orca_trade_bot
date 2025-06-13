import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Cog,
  CreditCard,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sun,
  Users,
  X,
  HelpCircle,
  LineChart,
  Wallet,
  Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

const Layout: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    const storedIsAdmin = sessionStorage.getItem('isAdmin') === 'true';
    
    if (storedUsername) {
      setUsername(storedUsername);
    }
    
    setIsAdmin(storedIsAdmin);
  }, []);

  const handleLogout = () => {
    // Oturum bilgilerini temizle
    sessionStorage.removeItem('telegramId');
    sessionStorage.removeItem('loginHash');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('isAdmin');
    
    // Anasayfaya yönlendir
    navigate('/login');
  };

  const userMenuItems = [
    { name: 'Ana Sayfa', icon: <Home size={16} />, path: '/' },
    { name: 'API Anahtarlarım', icon: <KeyRound size={16} />, path: '/api-keys' },
    { name: 'İşlemlerim', icon: <BarChart3 size={16} />, path: '/trades' },
    { name: 'Sinyaller', icon: <LineChart size={16} />, path: '/signals' },
    { name: 'Abonelik', icon: <CreditCard size={16} />, path: '/subscription' },
    { name: 'Kanallar', icon: <MessageSquare size={16} />, path: '/channels' },
    { name: 'Ortaklık', icon: <Users size={16} />, path: '/partnership' },
    { name: 'Backtest', icon: <Wallet size={16} />, path: '/backtest' },
    { name: 'S.S.S.', icon: <HelpCircle size={16} />, path: '/faq' },
  ];

  const adminMenuItems = [
    { name: 'Üyeler', icon: <Users size={16} />, path: '/admin/members' },
    { name: 'Üye Bildirimleri', icon: <Bell size={16} />, path: '/admin/member-notifications' },
    { name: 'Kanal Bildirimleri', icon: <Radio size={16} />, path: '/admin/channel-notifications' },
    { name: 'Bot Kanalları', icon: <MessageSquare size={16} />, path: '/admin/bot-channels' },
    { name: 'Abonelikler', icon: <CreditCard size={16} />, path: '/admin/subscriptions' },
    { name: 'Sinyaller', icon: <BarChart3 size={16} />, path: '/admin/signals' },
    { name: 'API Ayarları', icon: <Settings size={16} />, path: '/admin/api-settings' },
    { name: 'Bot Ayarları', icon: <Cog size={16} />, path: '/admin/bot-settings' },
    { name: 'Abonelik Paketleri', icon: <LayoutDashboard size={16} />, path: '/admin/subscription-packages' },
    { name: 'S.S.S. Yönetimi', icon: <HelpCircle size={16} />, path: '/admin/faq' },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[240px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/logo.png" alt="Logo" />
                  <AvatarFallback>OT</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">OrcaTradeBot</h3>
                  <p className="text-xs text-muted-foreground">Trading Assistant</p>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground py-2">Kullanıcı Menüsü</p>
                <nav className="flex flex-col gap-1">
                  {userMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className="justify-start gap-2 h-8"
                      size="sm"
                      onClick={() => {
                        navigate(item.path);
                        setOpen(false);
                      }}
                    >
                      {item.icon}
                      <span className="text-xs">{item.name}</span>
                    </Button>
                  ))}
                </nav>
                
                {isAdmin && (
                  <>
                    <Separator className="my-2" />
                    <p className="text-xs font-medium text-muted-foreground py-2">Admin Menüsü</p>
                    <nav className="flex flex-col gap-1">
                      {adminMenuItems.map((item) => (
                        <Button
                          key={item.path}
                          variant={location.pathname === item.path ? "secondary" : "ghost"}
                          className="justify-start gap-2 h-8"
                          size="sm"
                          onClick={() => {
                            navigate(item.path);
                            setOpen(false);
                          }}
                        >
                          {item.icon}
                          <span className="text-xs">{item.name}</span>
                        </Button>
                      ))}
                    </nav>
                  </>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-2 border-t">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{username}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleLogout}>
                  <LogOut size={14} />
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-2">
                <span className="text-xs">Tema</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                  {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col border-r w-[240px] h-screen sticky top-0">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/logo.png" alt="Logo" />
              <AvatarFallback>OT</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-sm">OrcaTradeBot</h3>
              <p className="text-xs text-muted-foreground">Trading Assistant</p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-2">
            <p className="text-xs font-medium text-muted-foreground py-2">Kullanıcı Menüsü</p>
            <nav className="flex flex-col gap-1">
              {userMenuItems.map((item) => (
                <Button
                  key={item.path}
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className="justify-start gap-2 h-8"
                  size="sm"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span className="text-xs">{item.name}</span>
                </Button>
              ))}
            </nav>
            
            {isAdmin && (
              <>
                <Separator className="my-2" />
                <p className="text-xs font-medium text-muted-foreground py-2">Admin Menüsü</p>
                <nav className="flex flex-col gap-1">
                  {adminMenuItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={location.pathname === item.path ? "secondary" : "ghost"}
                      className="justify-start gap-2 h-8"
                      size="sm"
                      onClick={() => navigate(item.path)}
                    >
                      {item.icon}
                      <span className="text-xs">{item.name}</span>
                    </Button>
                  ))}
                </nav>
              </>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-2 border-t">
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{username}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleLogout}>
                    <LogOut size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Çıkış Yap</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center justify-between p-2">
            <span className="text-xs">Tema</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  >
                    {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{theme === "light" ? "Karanlık Mod" : "Aydınlık Mod"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between p-2 md:p-4 bg-background/80 backdrop-blur-sm border-b">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu size={18} />
          </Button>
          
          <div className="flex items-center gap-2 ml-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  >
                    {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{theme === "light" ? "Karanlık Mod" : "Aydınlık Mod"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        
        <div className="container mx-auto px-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
