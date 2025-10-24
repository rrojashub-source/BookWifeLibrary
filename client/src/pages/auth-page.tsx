// Reference: javascript_auth_all_persistance blueprint
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, BarChart3, Star } from "lucide-react";
import virgenMariaImage from "@assets/estampa-gospa-maría reina de la paz_1761093317820.jpg";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const onLogin = (data: InsertUser) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">
      <PWAInstallPrompt />
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                <BookOpen className="h-10 w-10" />
              </div>
            </div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Biblioteca Moi</h1>
            <p className="text-muted-foreground mt-2">Tu colección personal de lecturas espirituales</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder a tu biblioteca</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Tu nombre de usuario" 
                            {...field} 
                            data-testid="input-login-username"
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Tu contraseña" 
                            {...field}
                            data-testid="input-login-password"
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Branding & Features */}
      <div className="hidden lg:flex lg:flex-1 bg-primary/5 p-12 items-center justify-center">
        <div className="max-w-md space-y-8">
          <div className="text-center space-y-4">
            <img 
              src={virgenMariaImage} 
              alt="Virgen María Reina de la Paz" 
              className="w-48 h-auto mx-auto rounded-lg shadow-lg"
            />
            <div className="text-center italic text-muted-foreground px-6 py-4 border-l-4 border-primary bg-background/50 rounded">
              <p className="text-sm">
                Esto fue creado para mi lectora favorita.
              </p>
              <p className="text-sm mt-2">
                Te amo con todo mi corazón mi flaca preciosa.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Organiza tu Colección</h3>
                <p className="text-sm text-muted-foreground">
                  Gestiona todos tus libros católicos y espirituales en un solo lugar
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Seguimiento de Progreso</h3>
                <p className="text-sm text-muted-foreground">
                  Visualiza tu progreso de lectura mensual y anual con gráficos detallados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Calificaciones y Reseñas</h3>
                <p className="text-sm text-muted-foreground">
                  Califica tus libros favoritos y guarda tus reflexiones personales
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Diccionario Personal</h3>
                <p className="text-sm text-muted-foreground">
                  Guarda palabras significativas y sus definiciones de tus lecturas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
