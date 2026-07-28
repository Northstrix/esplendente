"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface CustomCheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  direction?: "ltr" | "rtl";
  accentColor?: string;
  checkmarkColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number | string;
  borderWidth?: number | string;
  size?: number;
  labelColor?: string;
  labelFontSize?: number | string;
  labelFontWeight?: number | string;
  labelSpacing?: number;
  disabled?: boolean;
  style?: React.CSSProperties;
  className?: string;
  checkmarkDuration?: number;
  mirrorCheckmark?: boolean;
  checkedCoversOutline?: boolean;
  outlineTransition?: string;
  outlineHoverColor?: string;
  outlineHoverColorDisabled?: string;
  outlineColorDisabled?: string;
  borderStyle?: string;
  disabledBackgroundColor?: string;
  disabledBorderColor?: string;
  disabledCheckmarkColor?: string;
  swapCheckboxOrder?: boolean;
  // Group
  options?: {
    value: string;
    label: React.ReactNode;
    checkboxProps?: Partial<CustomCheckboxProps>;
  }[];
  values?: string[];
  onGroupChange?: (values: string[]) => void;
  maxSelected?: number;
  groupGap?: number;
  groupDirection?: "row" | "column";
}

const DEFAULTS = {
  accentColor: "#00a0d8",
  checkmarkColor: "#fff",
  backgroundColor: "#2e2e2e",
  borderColor: "#363636",
  borderRadius: 8,
  borderWidth: 2,
  size: 24,
  labelColor: "#fff",
  labelFontSize: 16,
  labelFontWeight: 400,
  labelSpacing: 12,
  checkmarkDuration: 0.32,
  outlineTransition: "border-color 0.3s ease-in-out",
  outlineHoverColor: "#494949",
  outlineHoverColorDisabled: "#494949",
  outlineColorDisabled: undefined,
  borderStyle: "solid",
  disabledBackgroundColor: undefined,
  disabledBorderColor: undefined,
  disabledCheckmarkColor: undefined,
  groupGap: 18,
  groupDirection: "row" as "row" | "column",
};

const SingleCheckbox: React.FC<CustomCheckboxProps & { hovered?: boolean }> = ({
  checked = false,
  label,
  direction = "ltr",
  accentColor = DEFAULTS.accentColor,
  checkmarkColor = DEFAULTS.checkmarkColor,
  backgroundColor = DEFAULTS.backgroundColor,
  borderColor = DEFAULTS.borderColor,
  borderRadius = DEFAULTS.borderRadius,
  borderWidth = DEFAULTS.borderWidth,
  size = DEFAULTS.size,
  labelColor = DEFAULTS.labelColor,
  labelFontSize = DEFAULTS.labelFontSize,
  labelFontWeight = DEFAULTS.labelFontWeight,
  labelSpacing = DEFAULTS.labelSpacing,
  disabled = false,
  checkmarkDuration = DEFAULTS.checkmarkDuration,
  mirrorCheckmark = false,
  checkedCoversOutline = true,
  outlineTransition = DEFAULTS.outlineTransition,
  outlineHoverColor = DEFAULTS.outlineHoverColor,
  outlineHoverColorDisabled = DEFAULTS.outlineHoverColorDisabled,
  outlineColorDisabled = DEFAULTS.outlineColorDisabled,
  borderStyle = DEFAULTS.borderStyle,
  disabledBackgroundColor,
  disabledBorderColor,
  disabledCheckmarkColor,
  hovered = false,
  swapCheckboxOrder = true,
}) => {
  const resolvedDisabledBackgroundColor = disabledBackgroundColor ?? backgroundColor;
  const resolvedDisabledBorderColor = disabledBorderColor ?? borderColor;
  const resolvedDisabledCheckmarkColor = disabledCheckmarkColor ?? checkmarkColor;
  const resolvedOutlineColorDisabled = outlineColorDisabled ?? resolvedDisabledBorderColor;

  let borderCol: string;
  if (disabled) {
    borderCol = hovered
      ? (outlineHoverColorDisabled ?? outlineHoverColor)
      : resolvedOutlineColorDisabled;
  } else {
    borderCol = checkedCoversOutline
      ? checked
        ? accentColor
        : hovered
        ? outlineHoverColor
        : borderColor
      : hovered
      ? outlineHoverColor
      : borderColor;
  }

  const border = borderWidth === 0 ? "none" : `${borderWidth}px ${borderStyle} ${borderCol}`;

  const boxBg = disabled
    ? resolvedDisabledBackgroundColor
    : checked
    ? checkedCoversOutline
      ? accentColor
      : `linear-gradient(${accentColor} 0 0) padding-box, ${backgroundColor} border-box`
    : backgroundColor;

  const checkboxEl = (
    <span
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: boxBg,
        border,
        borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        transition: `background 0.18s, ${outlineTransition}`,
        position: "relative",
        boxSizing: "border-box",
        flexShrink: 0,
        outline: "none",
        pointerEvents: "none",
      }}
    >
      <motion.svg
        width={size * 0.75}
        height={size * 0.75}
        viewBox="0 0 24 24"
        stroke={disabled ? resolvedDisabledCheckmarkColor : checkmarkColor}
        strokeWidth={3}
        fill="none"
        style={{
          display: "block",
          transform: mirrorCheckmark ? "scaleX(-1)" : "none",
        }}
      >
        <motion.path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={checked ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={{ duration: checkmarkDuration, ease: [0.4, 0, 0.2, 1] }}
        />
      </motion.svg>
      {hovered && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
            background: "rgba(24,24,27,0.18)",
            zIndex: 2,
          }}
        />
      )}
    </span>
  );

  const labelEl = label && (
    <span
      style={{
        color: labelColor,
        fontSize: labelFontSize,
        fontWeight: labelFontWeight,
        lineHeight: 1.5,
        whiteSpace: "pre-line",
        direction,
        textAlign: direction === "rtl" ? "right" : "left",
      }}
    >
      {label}
    </span>
  );

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: labelSpacing,
        pointerEvents: "none",
      }}
    >
      {swapCheckboxOrder ? (
        <>
          {labelEl}
          {checkboxEl}
        </>
      ) : (
        <>
          {checkboxEl}
          {labelEl}
        </>
      )}
    </span>
  );
};

const CustomCheckbox: React.FC<CustomCheckboxProps> = (props) => {
  // GROUP MODE
  if (props.options && props.values && props.onGroupChange) {
    const {
      options,
      values,
      onGroupChange,
      direction = "ltr",
      maxSelected,
      groupGap = DEFAULTS.groupGap,
      groupDirection = DEFAULTS.groupDirection,
      swapCheckboxOrder,
    } = props;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const isVertical = groupDirection === "column";
    const isRTL = direction === "rtl";
    const groupAlignItems = isVertical && isRTL ? "flex-end" : "flex-start";

    return (
      <div
        style={{
          display: "flex",
          flexDirection: groupDirection,
          gap: groupGap,
          alignItems: groupAlignItems,
        }}
      >
        {options.map((opt, idx) => {
          const isChecked = values.includes(opt.value);
          const isDisabled =
            !!opt.checkboxProps?.disabled ||
            (!isChecked && typeof maxSelected === "number" && values.length >= maxSelected);

          return (
            <label
              key={opt.value}
              dir={direction}
              style={{
                display: "inline-flex",
                alignItems: "center",
                cursor: isDisabled ? "not-allowed" : "pointer",
                userSelect: "text",
                opacity: isDisabled ? 0.5 : 1,
                position: "relative",
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={(e) => {
                if (!isDisabled) {
                  e.preventDefault();
                  if (isChecked) {
                    onGroupChange(values.filter((v) => v !== opt.value));
                  } else {
                    onGroupChange([...values, opt.value]);
                  }
                }
              }}
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={isDisabled ? -1 : 0}
            >
              <SingleCheckbox
                {...props} // Inherit global props
                {...opt.checkboxProps} // Override with option specific props
                checked={isChecked}
                disabled={isDisabled}
                label={opt.label}
                hovered={hoveredIndex === idx}
                swapCheckboxOrder={opt.checkboxProps?.swapCheckboxOrder ?? swapCheckboxOrder}
              />
            </label>
          );
        })}
      </div>
    );
  }

  // SINGLE MODE
  const [hovered, setHovered] = useState(false);
  const { direction = "ltr", disabled, checked, onChange, swapCheckboxOrder, className, style } = props;

  return (
    <label
      dir={direction}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        userSelect: "text",
        opacity: disabled ? 0.5 : 1,
        position: "relative",
        ...style,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        if (!disabled && onChange) {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      tabIndex={disabled ? -1 : 0}
      role="checkbox"
      aria-checked={checked}
    >
      <SingleCheckbox {...props} hovered={hovered} swapCheckboxOrder={swapCheckboxOrder} />
    </label>
  );
};

export default CustomCheckbox;