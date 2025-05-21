"use client";

import { useParams } from "next/navigation";

const PerfilPage = () => {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="flex flex-col gap-4 p-4 bg-background min-h-screen">
      <h1 className="text-xl font-bold">{id}</h1>
    </div>
  );
};

export default PerfilPage;
