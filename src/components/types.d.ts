export interface SkillSwapContent extends React.HTMLAttributes {
  children?: React.ReactNode;
  className?: string;
  size?: number;
  as?: React.ReactNode | React.FC;
}

export interface SkillSwapFullContent extends React.HTMLAttributes {
  children?: React.ReactNode;
  className?: string;
  width?: string;
  height?: string;
  as?: React.ReactNode | React.FC;
}

export interface RectangleIconContent extends React.HTMLAttributes {
  className?: string;
  width?: string | number;
  height?: string | number;
}
