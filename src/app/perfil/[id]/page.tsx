"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type UserProfile = {
  user_id: number;
  email: string;
  user_type: string;
  first_name: string;
  last_name: string;
  profile_picture?: string | null;
  phone_number?: string | null;
};

const PerfilPage = () => {
  const params = useParams();
  const id = params?.id;

  return (
    <div className="flex flex-col gap-4 py-16 bg-background min-h-[100%]">
      <h1>{id}</h1>
    </div>
  );
};

export default PerfilPage;
