"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Logo from "@/components/Logo"

export default function RecoverPasswordPage() {
    const [email, setEmail] = useState("")
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle password recovery logic here
        console.log("Password recovery request for:", email)
        setIsSubmitted(true)
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-4">
            <div className="w-full max-w-md rounded-xl bg-[#131213] p-8 shadow-lg">
                <div className="mb-8 flex justify-center">
                    <Logo />
                </div>

                {!isSubmitted ? (
                    <>
                        <h1 className="mb-6 text-center text-2xl font-bold text-white">Recuperar Contraseña</h1>
                        <p className="mb-6 text-center text-sm text-gray-400">
                            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-white">
                                    Correo Electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="Ingresa tu correo electrónico"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-gray-600 bg-white px-3 py-2 text-black placeholder-gray-400 focus:border-[#43159f] focus:outline-none focus:ring-1 focus:ring-[#43159f]"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-[#43159f] px-4 py-2 text-center font-medium text-white hover:bg-[#35127d] focus:outline-none focus:ring-2 focus:ring-[#43159f] focus:ring-offset-2"
                                >
                                    Enviar Enlace
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="space-y-6 text-center">
                        <h1 className="text-2xl font-bold text-white">Correo Enviado</h1>
                        <p className="text-gray-400">
                            Si existe una cuenta con el correo {email}, recibirás un enlace para restablecer tu contraseña.
                        </p>
                        <div className="pt-2">
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="w-full rounded-md bg-[#43159f] px-4 py-2 text-center font-medium text-white hover:bg-[#35127d] focus:outline-none focus:ring-2 focus:ring-[#43159f] focus:ring-offset-2"
                            >
                                Volver a Intentar
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-6 text-center text-sm text-gray-400">
                    <Link href="/" className="text-[#43159f] hover:underline">
                        Volver al Inicio de Sesión
                    </Link>
                </div>
            </div>
        </main>
    )
}