import React from "react";

interface SmallCardProps {
  children?: React.ReactNode;
  footer?: React.ReactNode;
  minHeight?: number | string;
  className?: string;
}

const SmallCard = ({
  children,
  footer,
  minHeight = 140,
  className = "",
}: SmallCardProps) => {
  return (
    <div
      className={`card ${className}`}
      style={{
        borderRadius: "1rem",
        backgroundColor: "#11162B",
        minHeight,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <div className="card-body" style={{ flex: 1, padding: 16 }}>
        {children}
      </div>

      {footer && (
        <div
          className="card-footer"
          style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default SmallCard;
