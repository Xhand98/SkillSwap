import { SkillSwapContent } from "@/components/types";
import { cn } from "@/lib/utils";

export default function SkillSwap({
  className,
  size,
  ...rest
}: SkillSwapContent) {
  return (
    <svg
      role="img"
      aria-label="Logo"
      width={size}
      height={size}
      className={cn("aspect-square", className)}
      {...rest}
      viewBox="0 0 77 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_i_110_291)">
        <g filter="url(#filter1_i_110_291)">
          <path
            d="M7.85654 0.229004L76.6181 42.7968L0.594238 74.229L7.85654 0.229004Z"
            fill="#6E34F3"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_i_110_291"
          x="0.594238"
          y="0.229004"
          width="76.0239"
          height="78"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_110_291"
          />
        </filter>
        <filter
          id="filter1_i_110_291"
          x="0.594238"
          y="0.229004"
          width="76.0239"
          height="78"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="shape"
            result="effect1_innerShadow_110_291"
          />
        </filter>
      </defs>
    </svg>
  );
}
