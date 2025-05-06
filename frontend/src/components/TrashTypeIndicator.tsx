import React from 'react';
import { 
  Waves, 
  Newspaper, 
  Wine, 
  Wrench, 
  Leaf, 
  Smartphone 
} from 'lucide-react';

interface TrashTypeIndicatorProps {
  trashType: string;
  size?: 'sm' | 'md' | 'lg';
}

interface TrashTypeConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const TrashTypeIndicator: React.FC<TrashTypeIndicatorProps> = ({ 
  trashType,
  size = 'md'
}) => {
  const getTrashTypeConfig = (type: string): TrashTypeConfig => {
    const configs: Record<string, TrashTypeConfig> = {
      'Plastic': {
        icon: <Waves size={size === 'sm' ? 16 : 20} />,
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200'
      },
      'Paper': {
        icon: <Newspaper size={size === 'sm' ? 16 : 20} />,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200'
      },
      'Glass': {
        icon: <Wine size={size === 'sm' ? 16 : 20} />,
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200'
      },
      'Metal': {
        icon: <Wrench size={size === 'sm' ? 16 : 20} />,
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200'
      },
      'Organic': {
        icon: <Leaf size={size === 'sm' ? 16 : 20} />,
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200'
      },
      'E-waste': {
        icon: <Smartphone size={size === 'sm' ? 16 : 20} />,
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200'
      }
    };

    return configs[type] || {
      icon: <Waves size={size === 'sm' ? 16 : 20} />,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200'
    };
  };

  const config = getTrashTypeConfig(trashType);
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4'
  };

  return (
    <div className={`inline-flex items-center border rounded-full ${config.bgColor} ${config.color} ${config.borderColor} ${sizeClasses[size]}`}>
      <span className="mr-1.5">{config.icon}</span>
      <span className="font-medium">{trashType}</span>
    </div>
  );
};

export default TrashTypeIndicator;