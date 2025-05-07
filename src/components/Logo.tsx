import Image from "next/image"

export default function Logo() {
    return (
        <div className="flex items-center justify-center gap-2">
            <div className="relative h- w-10">
                <Image src="/imagen/imagen3.png" alt="SkillSwap Logo Icon" width={50} height={50} className="object-contain" priority />
            </div>
            <div className="relative h-8 w-32">
                <Image src="/imagen/imagen4.png" alt="SkillSwap" fill className="object-contain" priority />
            </div>
        </div>
    )
}