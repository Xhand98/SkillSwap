import { Container } from "@/components/container";
import { Text } from "@/components/text";

export default function AccountPage() {
  return (
    <Container>
      <div className="py-8 space-y-6">
        <Text as="h1" size="heading-4">Mi Cuenta</Text>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow-sm space-y-4">
            <Text as="h2" size="heading-6">Información Personal</Text>
            {/* Add account information here */}
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm space-y-4">
            <Text as="h2" size="heading-6">Mis Habilidades</Text>
            {/* Add skills section here */}
          </div>
        </div>
      </div>
    </Container>
  );
}
