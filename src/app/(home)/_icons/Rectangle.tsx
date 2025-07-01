import { RectangleIconContent } from "@/components/types";
import * as React from "react";

export default function RectangleIcon({
  className,
  width,
  height,
  ...rest
}: RectangleIconContent) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      fill="none"
    >
      <g filter="url(#a)">
        <path
          fill="#6E34F3"
          d="M89.708 25.267 25.268 0 0 64.44l64.44 25.268z"
        ></path>
      </g>
      <defs>
        <filter
          id="a"
          width="89.707"
          height="93.708"
          x="0"
          y="0"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="4"></feOffset>
          <feGaussianBlur stdDeviation="2"></feGaussianBlur>
          <feComposite
            in2="hardAlpha"
            k2="-1"
            k3="1"
            operator="arithmetic"
          ></feComposite>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"></feColorMatrix>
          <feBlend in2="shape" result="effect1_innerShadow_83_22"></feBlend>
        </filter>
      </defs>
    </svg>
  );
}
