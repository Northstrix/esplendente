"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  animate,
} from "framer-motion";

// ==========================================
// ==== Math Helpers (Noise & Geometry) =====
// ==========================================
const random = (x: number) => (Math.sin(x * 12.9898) * 43758.5453) % 1;
const noise2D = (x: number, y: number) => {
  const i = Math.floor(x);
  const j = Math.floor(y);
  const fx = x - i;
  const fy = y - j;
  const a = random(i + j * 57);
  const b = random(i + 1 + j * 57);
  const c = random(i + (j + 1) * 57);
  const d = random(i + 1 + (j + 1) * 57);
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
};
const octavedNoise = (
  x: number,
  time: number,
  seed: number,
  cfg: {
    octaves: number;
    lacunarity: number;
    gain: number;
    amplitude: number;
    frequency: number;
  }
) => {
  let y = 0;
  let amplitude = cfg.amplitude;
  let frequency = cfg.frequency;
  for (let i = 0; i < cfg.octaves; i++) {
    let octaveAmplitude = amplitude;
    if (i === 0) octaveAmplitude *= 1.0;
    y +=
      octaveAmplitude *
      noise2D(frequency * x + seed * 100, time * frequency * 0.3);
    frequency *= cfg.lacunarity;
    amplitude *= cfg.gain;
  }
  return y;
};

// ==========================================
// ==== Component Interface =================
// ==========================================
export interface HolographicCardProps {
  id?: string;
  width?: number;
  height?: number;
  imageSrc: string;
  hoverImageSrc?: string;
  hoverImageEase?: string;
  mirrorBottomText?: boolean;
  textOverlayPadding?: string;
  borderRadius?: number;
  electricBorderRadius?: number;
  backgroundColor?: string;
  imageOpacity?: number;
  maxImageWidthPct?: number;
  patternColor?: string;
  patternOpacity?: number;
  patternSize?: number;
  patternDotSize?: number;
  enableElectric?: boolean;
  electricColor?: string;
  hoverElectricColor?: string;
  electricColorEase?: string;
  electricWidth?: number;
  electricBlur?: number;
  electricSpeed?: number;
  electricFrequency?: number;
  electricAmplitude?: number;
  electricNoiseIntensity?: number;
  electricOffset?: number;
  enableHologram?: boolean;
  hologramOpacity?: number;
  holographicGradient?: string;
  enableTilt?: boolean;
  enableDrag?: boolean;
  dragConstraints?: React.RefObject<Element>;
  className?: string;
  style?: React.CSSProperties;
  isRTL?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// ==========================================
// ==== Component Implementation ============
// ==========================================
const HolographicCard: React.FC<HolographicCardProps> = ({
  id = "namer-ui-holographic-card",
  width = 320,
  height = 480,
  imageSrc,
  hoverImageSrc,
  hoverImageEase = "0.3s",
  borderRadius = 24,
  electricBorderRadius,
  backgroundColor = "#000",
  imageOpacity = 0.9,
  maxImageWidthPct = 1,
  patternColor = "#000",
  patternOpacity = 0.15,
  patternSize = 3,
  patternDotSize = 1,
  enableElectric = true,
  electricColor = "#FBE75F",
  hoverElectricColor,
  electricColorEase = "0.3s",
  electricWidth = 4,
  electricBlur = 15,
  electricSpeed = 5.2,
  electricFrequency = 12.5,
  electricAmplitude = 0.016,
  electricNoiseIntensity = 60,
  electricOffset = 0,
  enableHologram = true,
  hologramOpacity = 0.4,
  holographicGradient = "linear-gradient(135deg, transparent 35%, rgba(250,254,255,0.2) 45%, rgba(255,183,4,0.15) 55%, transparent 65%)",
  enableTilt = true,
  enableDrag = false,
  dragConstraints,
  className = "",
  style,
  isRTL,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const finalElectricRadius = electricBorderRadius ?? borderRadius;

  // === Tilt Motion ===
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 200, damping: 25 });
  const mouseY = useSpring(y, { stiffness: 200, damping: 25 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], enableTilt ? [12, -12] : [0, 0]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], enableTilt ? [-12, 12] : [0, 0]);
  const bgX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const bgY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);
  const shineX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  // === Electric color transition ===
  const electricColorValue = useMotionValue(electricColor);
  useEffect(() => {
    const durationSec = parseFloat(electricColorEase) || 0.3;
    const targetColor = isHovered && hoverElectricColor ? hoverElectricColor : electricColor;
    animate(electricColorValue, targetColor, { duration: durationSec });
  }, [isHovered, hoverElectricColor, electricColor, electricColorEase, electricColorValue]);

  // === Mouse handlers ===
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !enableTilt) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleDragStart = () => {
    if (typeof document !== "undefined") document.body.style.cursor = "grabbing";
  };

  const handleDragEnd = () => {
    if (typeof document !== "undefined") document.body.style.cursor = "default";
  };

  // === Electric Border Animation (UNCHANGED) ===
  useEffect(() => {
    if (!enableElectric) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId = 0;
    let time = 0;
    let lastFrame = 0;
    const noiseCfg = {
      octaves: 8,
      lacunarity: 1.2,
      gain: 0.5,
      amplitude: electricAmplitude,
      frequency: electricFrequency,
    };
    const displacementRange = electricNoiseIntensity;
    canvas.width = width + displacementRange * 3;
    canvas.height = height + displacementRange * 3;

    const draw = (currentTime: number) => {
      const dt = (currentTime - lastFrame) / 1000;
      lastFrame = currentTime;
      time += dt * electricSpeed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const currentColor = electricColorValue.get();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = electricWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowBlur = electricBlur;
      ctx.shadowColor = currentColor;
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const w = width + electricOffset * 2;
      const h = height + electricOffset * 2;
      const left = cx - w / 2;
      const top = cy - h / 2;
      const r = Math.max(0, finalElectricRadius);
      const straightW = w - 2 * r;
      const straightH = h - 2 * r;
      const cornerArc = (Math.PI * r) / 2;
      const perimeter = 2 * straightW + 2 * straightH + 4 * cornerArc;
      const steps = Math.floor(perimeter / 2);
      const getPoint = (t: number) => {
        const total = perimeter;
        const d = t * total;
        let acc = 0;
        if (d <= acc + straightW) return { x: left + r + d, y: top };
        acc += straightW;
        if (d <= acc + cornerArc) {
          const p = (d - acc) / cornerArc;
          const angle = -Math.PI / 2 + p * (Math.PI / 2);
          return {
            x: left + w - r + r * Math.cos(angle),
            y: top + r + r * Math.sin(angle),
          };
        }
        acc += cornerArc;
        if (d <= acc + straightH) return { x: left + w, y: top + r + (d - acc) };
        acc += straightH;
        if (d <= acc + cornerArc) {
          const p = (d - acc) / cornerArc;
          const angle = 0 + p * (Math.PI / 2);
          return {
            x: left + w - r + r * Math.cos(angle),
            y: top + h - r + r * Math.sin(angle),
          };
        }
        acc += cornerArc;
        if (d <= acc + straightW)
          return { x: left + w - r - (d - acc), y: top + h };
        acc += straightW;
        if (d <= acc + cornerArc) {
          const p = (d - acc) / cornerArc;
          const angle = Math.PI / 2 + p * (Math.PI / 2);
          return {
            x: left + r + r * Math.cos(angle),
            y: top + h - r + r * Math.sin(angle),
          };
        }
        acc += cornerArc;
        if (d <= acc + straightH)
          return { x: left, y: top + h - r - (d - acc) };
        acc += straightH;
        const p = (d - acc) / cornerArc;
        const angle = Math.PI + p * (Math.PI / 2);
        return {
          x: left + r + r * Math.cos(angle),
          y: top + r + r * Math.sin(angle),
        };
      };
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const p = getPoint(t);
        const nX = octavedNoise(t * 10, time, 0, noiseCfg);
        const nY = octavedNoise(t * 10, time, 1, noiseCfg);
        const dx = p.x + nX * electricNoiseIntensity;
        const dy = p.y + nY * electricNoiseIntensity;
        if (i === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      }
      ctx.closePath();
      ctx.stroke();
      animationId = requestAnimationFrame(draw);
    };
    animationId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationId);
  }, [
    width,
    height,
    enableElectric,
    electricWidth,
    electricBlur,
    electricSpeed,
    electricFrequency,
    electricAmplitude,
    electricNoiseIntensity,
    electricOffset,
    finalElectricRadius,
    electricColorValue,
  ]);

  // === Scoped IDs ===
  const wrapperClass = `holo-card-wrapper-${id}`;
  const cardBodyClass = `holo-card-body-${id}`;
  const patternClass = `holo-pattern-${id}`;

  // === Ace of Spades Layer (inverted colors + hover fill) ===
  const AceSpadesLayer = ({
    mirrored = false,
    sizeA = 80,
    sizeSpade = 40,
    isHovered = false,
    spadeYOffset = -28,
    fillColorTop = "hsl(var(--foreground))",
    fillColorBottom = "hsl(var(--foreground))",
    strokeWidthA = 1.25,
    strokeWidthSpade = 20,
    isRTL,
  }: {
    mirrored?: boolean;
    sizeA?: number;
    sizeSpade?: number;
    isHovered?: boolean;
    spadeYOffset?: number;
    fillColorTop?: string;
    fillColorBottom?: string;
    strokeWidthA?: number;
    strokeWidthSpade?: number;
    isRTL?: boolean;
  }) => {
    const padding = "0";

    // 1️⃣ Base color (for stroke/A text)
    const baseColor = mirrored ? "hsl(var(--foreground))" : "hsl(var(--foreground))";

    // 2️⃣ Custom fill colors per layer
    const fillColor = isHovered 
      ? (mirrored ? fillColorBottom : fillColorTop) 
      : "none";
    const strokeColor = isHovered ? "transparent" : baseColor;
    
    // 🆕 PERFECT alignment: base position + 2px closer when filled
    const dynamicYOffset = isHovered 
      ? spadeYOffset + 1
      : spadeYOffset;
    const scaleTransform = isHovered ? "scale(1.08)" : "scale(1)";

    // --- Inline components ---
    const EceChar = () => (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={sizeA}
        fill={baseColor}
        fontFamily="Arial"
        fontWeight="400"
        stroke={baseColor}
        strokeWidth={strokeWidthA}
      >
        E
      </text>
    );

    const SpadeSymbol = () => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={sizeSpade}
        height={sizeSpade}
        viewBox="0 0 256 256"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidthSpade}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: `${scaleTransform} translateY(${dynamicYOffset}px)`,
          transformOrigin: "center",
          transition: `
            fill 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            stroke 0.4s cubic-bezier(0.4, 0, 0.2, 1),
            transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)
          `,
        }}
      >
        <path d="M128,24S32,72,32,136a48,48,0,0,0,79.55,36.18L96,224h64l-15.55-51.82A48,48,0,0,0,224,136C224,72,128,24,128,24Z" />
      </svg>
    );

    // --- Layout container ---
    return (
      <div
        style={{
          position: "absolute",
          top: mirrored ? undefined : padding,
          left: isRTL ? (mirrored ? padding : undefined) : (mirrored ? undefined : padding),
          bottom: mirrored ? padding : undefined,
          right: isRTL ? (mirrored ? undefined : padding) : (mirrored ? padding : undefined),
          zIndex: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: mirrored ? "rotate(180deg)" : "none",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          className={`transform ${isRTL ? "translate-x-[8px]" : "-translate-x-[9px]"} -translate-y-[5px]`}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={sizeA}
            height={sizeA}
            viewBox="0 0 256 256"
            fill="none"
          >
            <EceChar />
          </svg>
          <SpadeSymbol />
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .${wrapperClass} {
          position: relative;
          width: ${width}px;
          height: ${height}px;
          perspective: 1200px;
          font-family: inherit;
          user-select: none;
          cursor: ${enableDrag ? "grab" : "default"};
        }
        .${cardBodyClass} {
          position: absolute;
          inset: 0;
          overflow: hidden;
          background-color: ${backgroundColor};
          border-radius: ${borderRadius}px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.8);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .${patternClass} {
          position: absolute;
          inset: 0;
          z-index: 10;
          pointer-events: none;
          opacity: ${patternOpacity};
          background-image: radial-gradient(circle, ${patternColor} ${patternDotSize}px, transparent ${patternDotSize}px);
          background-size: ${patternSize}px ${patternSize}px;
        }
      `}</style>

      <motion.div
        drag={enableDrag}
        dragConstraints={dragConstraints}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        className={`${wrapperClass} ${className}`}
        style={{ ...style, cursor: enableDrag ? "grab" : "pointer" }}
      >
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={() => setIsHovered(true)}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
          }}
          className="relative"
        >
          {/* Electric Border Canvas */}
          {enableElectric && (
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              style={{
                width: width + electricNoiseIntensity * 3,
                height: height + electricNoiseIntensity * 3,
                transform: "translate(-50%, -50%) translateZ(1px)",
              }}
            >
              <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
          )}

          {/* CARD BODY */}
          <div className={cardBodyClass}>
            <div className={patternClass} />

            {/* Background Image 1 (Base) */}
            <div
              className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
              style={{ opacity: imageOpacity }}
            >
              <img
                src={imageSrc}
                alt=""
                draggable={false}
                className="object-cover h-full"
                style={{
                  height: "100%",

                }}
              />
            </div>

            {/* Background Image 2 (Hover Reveal) */}
            {hoverImageSrc && (
              <div
                className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center"
                style={{
                  opacity: isHovered ? imageOpacity : 0,
                  transition: `opacity ${hoverImageEase} ease`,
                }}
              >
                <img
                  src={hoverImageSrc}
                  alt=""
                  draggable={false}
                  className="object-cover w-full h-full"
                  style={{
                    width: `${maxImageWidthPct * 100}%`,
                    height: "auto",
                    maxHeight: "100%",
                  }}
                />
              </div>
            )}

            {/* ACE OF SPADES OVERLAYS */}
            <AceSpadesLayer 
              mirrored={false} 
              isHovered={!isHovered}
              strokeWidthA={1.625}
              strokeWidthSpade={21}
              isRTL={isRTL}
            />

            <AceSpadesLayer 
              mirrored={true}
              isHovered={!isHovered}
              strokeWidthA={1.0625}
              strokeWidthSpade={19}
              isRTL={isRTL}
            />


            {/* Hologram Overlay */}
            {enableHologram && (
              <motion.div
                className="absolute inset-0 z-20 pointer-events-none mix-blend-color-dodge"
                style={{
                  background: holographicGradient,
                  backgroundSize: "200% 200%",
                  backgroundPositionX: bgX,
                  backgroundPositionY: bgY,
                  opacity: hologramOpacity,
                }}
              />
            )}
          </div>

          {/* GLARE */}
          <motion.div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{
              borderRadius,
              background: useMotionTemplate`radial-gradient(circle at ${shineX} ${shineY}, rgba(255,255,255,0.2) 0%, transparent 60%)`,
              mixBlendMode: "overlay",
            }}
          />
        </motion.div>
      </motion.div>
    </>
  );
};

export default HolographicCard;