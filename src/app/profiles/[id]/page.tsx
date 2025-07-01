import { Metadata } from "next";
import ProfileDetails from "./_components/ProfileDetails";
import UserPosts from "./_components/UserPosts";

interface PageProps {
  params: Promise<{
    id: string; // Este es el nombre del parámetro basado en la carpeta [id]
  }>;
  searchParams?: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function UserProfile({ params }: PageProps) {
  const { id: userId } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <ProfileDetails userId={userId} />
      </div>

      <div className="space-y-8">
        <div className="bg-gray-900 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Publicaciones recientes
          </h2>
          <UserPosts userId={userId} />
        </div>
      </div>
    </div>
  );
}

// Metadata dinámico para la página de perfil
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: userId } = await params;

  // Aquí podrías hacer una solicitud al backend para obtener el nombre real del usuario
  // Para simplificar, usamos el ID por ahora
  return {
    title: `Perfil de usuario ${userId} | SkillSwap`,
    description: `Página de perfil del usuario con ID ${userId} en SkillSwap`,
  };
}

// Esta función es opcional y solo se utiliza si quieres pre-renderizar algunas páginas
// de perfil para usuarios específicos
export async function generateStaticParams() {
  // Si conoces algunos usuarios clave de antemano, puedes pre-renderizar sus páginas
  return [
    { id: "1" }, // Pre-renderiza el perfil del usuario con ID 1
    { id: "2" }, // Pre-renderiza el perfil del usuario con ID 2
  ];
}
