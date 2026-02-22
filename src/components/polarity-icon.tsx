"use client";

import { cn } from "@/lib/utils";

// Warframe polarity SVG icons — paths sourced from wiki.warframe.com official SVGs
// viewBox 0 0 50 50 for most; Umbra/Any use 0 0 52 52

const polarityColors: Record<string, string> = {
  madurai: "#FF6B35",
  vazarin: "#2ECC71",
  naramon: "#00B4D8",
  zenurik: "#9B59B6",
  unairu: "#95A5A6",
  penjaga: "#1ABC9C",
  umbra: "#E74C3C",
  universal: "#FFFFFF",
};

const polarityNames: Record<string, string> = {
  madurai: "Madurai",
  vazarin: "Vazarin",
  naramon: "Naramon",
  zenurik: "Zenurik",
  unairu: "Unairu",
  penjaga: "Penjaga",
  umbra: "Umbra",
  universal: "Universal",
};

function PolaritySVG({ polarity, size }: { polarity: string; size: number }) {
  const color = polarityColors[polarity] || "#6B7280";

  switch (polarity) {
    case "madurai":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
          <path d="m 10.59322,45.127118 0.635593,-29.449152 c 0,0 -2.3305077,-2.542373 -5.5084737,-4.025424 C 13.559322,8.2627119 19.915254,4.8728813 19.915254,4.8728813 l 0.211865,18.6440677 c 8.68644,-6.991526 16.313559,-13.9830507 16.313559,-13.9830507 5.932204,-1.2711865 9.322034,5.2966097 9.322034,5.2966097 0,0 -26.483051,7.415255 -35.169492,30.29661 z" fill={color} />
        </svg>
      );
    case "vazarin":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
          <path d="M 37.640856,5.1003873 C 36.765017,5.2841879 37.028695,6.7637876 35.901504,6.308675 26.719831,6.602264 17.523026,6.6025768 8.3526715,7.15241 7.5312902,7.0176536 6.7787941,7.9655835 7.6243876,8.5229078 11.40461,11.59298 15.425424,14.356797 18.925202,17.760941 c 7.318042,6.861254 13.4384,15.241864 16.215076,24.977241 0.705891,1.031852 1.741461,-0.291445 2.158368,-0.93601 C 41.62747,35.649636 43.195017,27.881506 42.40768,20.465226 41.853131,15.267761 40.540519,10.085642 38.225966,5.3904595 38.100324,5.1997821 37.878597,5.0560634 37.640856,5.1003873 Z m 0.525938,11.8751657 c 0.841342,4.226753 -0.293565,8.723053 -2.760444,12.237653 -3.277079,-3.736753 -6.494106,-7.526665 -9.656797,-11.35585 4.074873,-0.432813 8.315945,-0.644555 12.417241,-0.881803 z" fill={color} />
          <path d="M 7.0101176,7.2193778 C 6.5475877,7.255502 6.3929253,7.8639901 6.7369076,8.1492846 7.0042471,8.5658337 7.745735,8.3471082 7.6887024,7.8401981 7.6791581,7.5065169 7.3290564,7.2277311 7.0101176,7.2193778 Z" fill={color} />
        </svg>
      );
    case "naramon":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
          <path d="m 10.242086,35.426443 c 0,0 -2.7932962,-7.44879 -6.8901312,-15.642458 l 20.6703922,-0.558659 15.828677,-0.18622 0.744879,-5.027933 3.165736,7.63501 3.351955,6.89013 -22.346368,0.186219 -12.849162,-0.186219 z" fill={color} />
        </svg>
      );
    case "zenurik":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
          <g transform="translate(2.9033123,12.232624)">
            <path d="M -0.29103557,0.1444304 C 1.5711614,5.451692 6.9715343,9.8278559 6.9715343,9.8278559 12.092577,3.8688249 30.621441,6.7552299 30.621441,6.7552299 c 0,0 -6.517691,-8.7523273 -30.91247657,-6.6107995 z" fill={color} />
            <path d="m 11.440807,14.297129 c 1.955307,4.841713 7.91434,9.869646 7.91434,9.869646 8.752327,-6.517691 24.487895,-2.048417 24.487895,-2.048417 0,0 -9.217877,-10.800743 -32.402235,-7.821229 z" fill={color} />
          </g>
        </svg>
      );
    case "unairu":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
          <path d="m 45.24285,24.981603 c -23.070858,-2.696593 -31.010828,0.299621 -31.010828,0.299621 -3.895079,1.947541 -1.94754,13.632779 -1.94754,13.632779 0.125247,4.420632 -3.3480364,1.041886 -3.5954584,0.299622 C 0.14981062,22.43482 12.883725,12.54731 12.883725,12.54731 18.276914,7.3039335 31.759881,7.0043121 31.759881,7.0043121 c 1.198486,2.3969718 -1.498107,4.9437549 -1.498107,4.9437549 -9.438078,4.044891 -5.393187,6.741484 -5.393187,6.741484 16.179561,3.295838 20.374263,6.292052 20.374263,6.292052 z" fill={color} />
        </svg>
      );
    case "penjaga":
      return (
        <svg width={size} height={size} viewBox="0 0 50 50" fill="none">
          <path d="m 30.528858,39.849889 c 0,0 -7.44879,2.793296 -15.642457,6.890131 L 14.327742,26.069628 14.141522,10.240951 9.1135894,9.4960727 l 7.6350086,-3.165736 6.89013,-3.351955 0.186219,22.3463673 -0.186219,12.849162 z" fill={color} />
          <path d="m 30.167597,31.564245 0,-0.558659 0.18622,-10.893855 11.080074,-4.748603 0.27933,11.824953 z" fill={color} />
        </svg>
      );
    case "umbra":
      return (
        <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
          <path d="M47.9,1.2c-5.2,1.9-9.3,6.9-9.3,6.9l0,0c2.1,2.2,3.4,5,3.4,8c0,5.9-4.9,10.9-11.5,12.5c0,0,0,0,0,0l0,0 C27.6,26.1,27.9,18,27.9,18c0-1.5-0.7-3.1-1.9-3.1s-1.9,1.6-1.9,3.1c0,0,0.3,8.2-2.6,10.7C14.9,27,10,22.1,10,16.1 c0-3,1.3-5.8,3.4-8c0,0-4.5-5.2-9.4-7C8.6,5.5,7.4,10,6.9,12s-1.7,5-1.3,8.2c0,0,0,0,0-0.1c0,0,0,0,0,0.1c0,7.2,5.7,13.4,13.7,15.6 c0,0.7,0,1.5,0,2.4c0,2.1,0.9,3.7,2.2,4.7v3.3c0,2.5,2,4.6,4.4,4.6s4.4-2.1,4.4-4.6v-3.3c1.4-1,2.2-2.6,2.2-4.7c0-0.9,0-1.7,0-2.4 c8-2.2,13.7-8.4,13.7-15.6c0.4-3.2-0.8-6.3-1.3-8.2S43.4,5.5,47.9,1.2z M28.4,45.2c0,1.6-1.1,3-2.4,3s-2.4-1.3-2.4-3v-5.9 c0-1.6,1.1-3,2.4-3s2.4,1.3,2.4,3V45.2z" fill={color} />
        </svg>
      );
    case "universal":
    case "any":
      return (
        <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
          <path d="M33.9,14.8c5.4,6.2,2.6,29.5-24.8,36C35.8,55,49.6,36.6,47.4,22.2C45.7,18.4,37.9,14.8,33.9,14.8z" fill={color} />
          <path d="M18.2,37.3c-5.4-6.2-2.6-29.5,24.8-36C16.3-2.9,2.5,15.5,4.7,29.9C6.4,33.7,14.2,37.3,18.2,37.3z" fill={color} />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" fill="#6B7280" />
        </svg>
      );
  }
}

interface PolarityIconProps {
  polarity: string;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

export function PolarityIcon({ polarity, size = 16, className, showLabel = false }: PolarityIconProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} title={polarityNames[polarity] || polarity}>
      <PolaritySVG polarity={polarity} size={size} />
      {showLabel && (
        <span className="text-[10px] capitalize" style={{ color: polarityColors[polarity] || "#6B7280" }}>
          {polarityNames[polarity] || polarity}
        </span>
      )}
    </span>
  );
}

export { polarityColors, polarityNames };
