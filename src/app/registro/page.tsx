"use client"

import type React from "react"

import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Logo from "@/components/Logo"

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    })

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle registration logic here
        console.log("Registration data:", formData)
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#1a1a1a] p-4">
            <div className="flex w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-[#131213] shadow-lg md:flex-row">
                {/* Left side - Image with Logo */}
                <div className="hidden w-full md:block md:w-1/2">
                    <div className="relative h-full min-h-[400px] w-full">
                        {/* image de fondo */}
                        <Image src="/images/register-bg.png" alt="Registration Background" fill className="object-cover" priority />

                        {/* Logo positioned on top of the background */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Logo />
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full p-8 md:w-1/2">
                    {/* Logo for mobile view only */}
                    <div className="mb-6 flex justify-center md:hidden">
                        <Logo />
                    </div>

                    <h1 className="mb-6 text-center text-2xl font-bold text-white">Registrarse</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="block text-sm font-medium text-white">
                                Primer Nombre
                            </label>
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                placeholder="Ingrese su primer nombre"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border border-gray-600 bg-white px-3 py-2 text-black placeholder-gray-400 focus:border-[#43159f] focus:outline-none focus:ring-1 focus:ring-[#43159f]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="lastName" className="block text-sm font-medium text-white">
                                Segundo Nombre
                            </label>
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                placeholder="Ingrese su segundo nombre"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border border-gray-600 bg-white px-3 py-2 text-black placeholder-gray-400 focus:border-[#43159f] focus:outline-none focus:ring-1 focus:ring-[#43159f]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-white">
                                Correo Electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Ingrese su correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border border-gray-600 bg-white px-3 py-2 text-black placeholder-gray-400 focus:border-[#43159f] focus:outline-none focus:ring-1 focus:ring-[#43159f]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-medium text-white">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Ingrese su contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-md border border-gray-600 bg-white px-3 py-2 pr-10 text-black placeholder-gray-400 focus:border-[#43159f] focus:outline-none focus:ring-1 focus:ring-[#43159f]"
                                />
                                <button
                                    type="button"
                                    onClick={togglePasswordVisibility}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full rounded-md bg-[#43159f] px-4 py-2 text-center font-medium text-white hover:bg-[#35127d] focus:outline-none focus:ring-2 focus:ring-[#43159f] focus:ring-offset-2"
                            >
                                Crear Cuenta
                            </button>
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-400">
                            ¿Ya tienes una cuenta?{" "}
                            <Link href="/" className="text-[#43159f] hover:underline">
                                Iniciar Sesión
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    )
}