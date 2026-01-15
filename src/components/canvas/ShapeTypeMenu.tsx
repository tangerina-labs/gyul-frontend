import { useEffect, useRef, useCallback } from "react";
import type { ShapeType } from "../../types/shapes";
import { Interactive } from "../ui/Interactive";

interface ShapeTypeMenuProps {
  position?: { x: number; y: number }; // Optional: for fixed positioning (Novo Fluxo)
  onSelect: (type: ShapeType) => void;
  onClose: () => void;
  parentShapeId?: string; // Optional: indicates creating child shape (dropdown mode)
}

interface MenuOption {
  type: ShapeType;
  label: string;
  description: string;
  color: string;
  disabled?: boolean;
}

const menuOptions: MenuOption[] = [
  {
    type: "tweet",
    label: "Tweet",
    description: "Explorar um tweet",
    color: "var(--color-tweet)",
    disabled: false,
  },
  {
    type: "question",
    label: "Pergunta",
    description: "Perguntar a IA",
    color: "var(--color-question)",
    disabled: false,
  },
  {
    type: "note",
    label: "Nota",
    description: "Anotacao livre",
    color: "var(--color-note)",
    disabled: false,
  },
];

/**
 * Dropdown menu for selecting shape type when creating new shapes.
 * Two modes:
 * - With position: Fixed positioning for "Novo Fluxo" (click on canvas)
 * - Without position (parentShapeId): Anchored dropdown for child creation
 */
export function ShapeTypeMenu({
  position,
  onSelect,
  onClose,
  parentShapeId,
}: ShapeTypeMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Close menu on Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const handleSelect = useCallback(
    (option: MenuOption) => {
      if (option.disabled) return;
      onSelect(option.type);
      onClose();
    },
    [onSelect, onClose]
  );
  
  // Always use fixed positioning with explicit coordinates
  const positioningClass = "fixed";
  const zIndexClass = "z-[9999]"; // Global z-index (outside shape hierarchy)

  const positioningStyle = position ? { left: position.x, top: position.y } : {};

  return (
    <Interactive>
      <div
        ref={menuRef}
        data-testid="shape-type-menu"
        className={`
          ${zIndexClass} min-w-[200px]
          rounded-lg bg-white p-2
          shadow-lg ring-1 ring-gray-200
          animate-fade-in
          ${positioningClass}
        `}
        style={positioningStyle}
      >
        {menuOptions.map((option) => (
          <button
            key={option.type}
            data-testid={`menu-option-${option.type}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect(option);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            disabled={option.disabled}
            className={`
              flex w-full items-center gap-3 rounded-md px-3 py-2
              text-left transition-colors duration-150
              ${
                option.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-50 active:bg-gray-100"
              }
            `}
          >
            {/* Color indicator */}
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: option.color }}
            />

            {/* Label and description */}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {option.label}
                {option.disabled && (
                  <span className="ml-2 text-xs text-gray-400">(em breve)</span>
                )}
              </div>
              <div className="text-xs text-gray-500">{option.description}</div>
            </div>

            {/* Icon */}
            <ShapeIcon type={option.type} className="h-4 w-4 text-gray-400" />
          </button>
        ))}
      </div>
    </Interactive>
  );
}

/**
 * Icon component for each shape type
 */
function ShapeIcon({
  type,
  className,
}: {
  type: ShapeType;
  className?: string;
}) {
  switch (type) {
    case "tweet":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "question":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "note":
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      );
    default:
      return null;
  }
}
