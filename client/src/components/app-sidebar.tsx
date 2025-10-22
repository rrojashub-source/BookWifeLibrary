import { BookOpen, LayoutDashboard, BookText } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import virgenMariaImage from "@assets/estampa-gospa-maría reina de la paz_1761093317820.jpg";

const menuItems = [
  {
    title: "Biblioteca",
    url: "/",
    icon: BookOpen,
    testId: "link-library",
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    testId: "link-dashboard",
  },
  {
    title: "Diccionario",
    url: "/dictionary",
    icon: BookText,
    testId: "link-dictionary",
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-sidebar-foreground">Biblioteca Moi</h1>
            <p className="text-xs text-muted-foreground">Colección Personal</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-md bg-primary/10 border border-primary/20">
          <p className="text-xs italic text-muted-foreground leading-relaxed">
            Esto fue creado para mi lectora favorita.<br />
            Te amo con todo mi corazón mi flaca preciosa.
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center" data-testid="container-virgen-maria">
          <div className="w-32 h-auto rounded-lg overflow-hidden border-2 border-primary/30 shadow-md">
            <img 
              src={virgenMariaImage} 
              alt="María Reina de la Paz - Medjugorje" 
              className="w-full h-auto"
              data-testid="image-virgen-maria"
            />
          </div>
          <p className="mt-2 text-xs font-serif text-center text-muted-foreground" data-testid="text-virgen-maria">
            María Reina de la Paz
          </p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={item.testId}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
