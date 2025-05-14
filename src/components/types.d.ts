export interface SkillSwapContent extends React.HTMLAttributes {
  children?: React.ReactNode;
  className?: string;
  size?: number | string;
  as?: React.ReactNode | React.FC;
}

export interface SkillSwapFullContent extends React.HTMLAttributes {
  children?: React.ReactNode;
  className?: string;
  width?: string | number;
  height?: string | number;
  as?: React.ReactNode | React.FC;
  size?: number;
}

export interface RectangleIconContent extends React.HTMLAttributes {
  className?: string;
  width?: string | number;
  height?: string | number;
}
