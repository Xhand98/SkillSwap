import React, { ReactNode, useState, useEffect } from 'react';


type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type GridColumns = 1 | 2 | 3 | 4 | 5 | 6;

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

interface HeaderProps {
  title: string;
  subtitle?: string;
}

interface GridLayoutProps {
  children: ReactNode;
  cols?: GridColumns;
  gap?: number;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}


const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) setBreakpoint('2xl');
      else if (width >= 1280) setBreakpoint('xl');
      else if (width >= 1024) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else setBreakpoint('sm');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};


const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
};

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="py-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-gray-600">{subtitle}</p>}
    </header>
  );
};

const GridLayout: React.FC<GridLayoutProps> = ({ children, cols = 3, gap = 4 }) => {
  const gridCols = `grid-cols-${cols}`;
  const gapClass = `gap-${gap}`;
  
  return (
    <div className={`grid ${gridCols} ${gapClass}`}>
      {children}
    </div>
  );
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-colors ${variantClasses[variant]} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};

const Card: React.FC<CardProps> = ({ children, header, footer, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {header && (
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          {header}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
      {footer && (
        <div className="px-4 py-4 border-t border-gray-200 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  );
};


const ResponsiveDisplay: React.FC = () => {
  const breakpoint = useBreakpoint();

  return (
    <div className="mb-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">
        Current Breakpoint: <span className="text-blue-600">{breakpoint}</span>
      </h3>
      <p className="text-sm">
        {`This content is visible on ${breakpoint} screens`}
      </p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Container>
      <Header 
        title="TypeScript JSX Implementation" 
        subtitle="Complete layout system with typed components" 
      />
      
      <ResponsiveDisplay />
      
      <GridLayout cols={3} gap={6}>
        <Card header={<h3 className="text-lg font-medium">Primary Action</h3>}>
          <p className="text-gray-600 mb-4">
            This card demonstrates the primary button variant
          </p>
          <Button variant="primary">
            Click Me
          </Button>
        </Card>
        
        <Card header={<h3 className="text-lg font-medium">Secondary Action</h3>}>
          <p className="text-gray-600 mb-4">
            This card demonstrates the secondary button variant
          </p>
          <Button variant="secondary">
            Click Me
          </Button>
        </Card>
        
        <Card 
          header={<h3 className="text-lg font-medium">Danger Zone</h3>}
          footer={<p className="text-xs text-gray-500">Irreversible action</p>}
        >
          <p className="text-gray-600 mb-4">
            This card demonstrates the danger button variant
          </p>
          <Button variant="danger" isLoading>
            Delete
          </Button>
        </Card>
      </GridLayout>
    </Container>
  );
};

export default App;