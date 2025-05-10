import React from 'react';
import {
  Waves,
  Newspaper,
  Wine,
  Wrench,
  Trash2,
  Pizza
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TrashTypeIndicatorProps {
  trashType: string;
  size?: 'sm' | 'md' | 'lg';
}

interface DisposalGuide {
  instructions: string;
  references: string[];
}

interface TrashTypeConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  disposalGuide: DisposalGuide;
}

const TrashTypeIndicator: React.FC<TrashTypeIndicatorProps> = ({
  trashType,
  size = 'lg'
}) => {
  const { t } = useTranslation();
  const getTrashTypeConfig = (type: string): TrashTypeConfig => {
    const configs: Record<string, TrashTypeConfig> = {
      'food': {
        icon: <Pizza size={size === 'sm' ? 16 : 20} />,
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-200',
        description: t('trashes.food.description'),
        disposalGuide: {
          instructions: t('trashes.food.disposalGuide.instructions'),
          references: [
            'https://www.epa.gov/recycle/composting-home',
            'https://changevn.org/huong-dan-u-phan/'
          ]
        }
      },
      'glass': {
        icon: <Wine size={size === 'sm' ? 16 : 20} />,
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        borderColor: 'border-purple-200',
        description: t('trashes.glass.description'),
        disposalGuide: {
          instructions: t('trashes.glass.disposalGuide.instructions'),
          references: [
            'http://monre.gov.vn/VN/Pages/Quan-ly-chat-thai-ran.aspx',
            'https://www.glassrecyclingcoalition.org/how-to-recycle-glass'
          ]
        }
      },
      'metal': {
        icon: <Wrench size={size === 'sm' ? 16 : 20} />,
        color: 'text-gray-700',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        description: t('trashes.metal.description'),
        disposalGuide: {
          instructions: t('trashes.metal.disposalGuide.instructions'),
          references: [
            'https://www.recyclenow.com/recycling-knowledge/how-to-recycle/metal',
            'https://www.aluminum.org/recycling'
          ]
        }
      },
      'paper': {
        icon: <Newspaper size={size === 'sm' ? 16 : 20} />,
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        description: t('trashes.paper.description'),
        disposalGuide: {
          instructions: t('trashes.paper.disposalGuide.instructions'),
          references: [
            'https://www.recyclenow.com/recycling-knowledge/how-to-recycle/paper',
            'https://www.paperrecycles.org/about/recycling-facts'
          ]
        }
      },
      'plastic': {
        icon: <Waves size={size === 'sm' ? 16 : 20} />,
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-200',
        description: t('trashes.plastic.description'),
        disposalGuide: {
          instructions: t('trashes.plastic.disposalGuide.instructions'),
          references: [
            'https://www.recyclenow.com/recycling-knowledge/how-to-recycle/plastic',
            'https://www.plasticrecycling.org/recycling-basics'
          ]
        }
      }
    };

    return configs[type] || {
      icon: <Trash2 size={size === 'sm' ? 16 : 20} />,
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      description: t('trashes.other.description'),
      disposalGuide: {
        instructions: t('trashes.other.disposalGuide.instructions'),
        references: []
      }
    };
  };

  const config = getTrashTypeConfig(trashType);

  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4'
  };

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center border rounded-full ${config.bgColor} ${config.color} ${config.borderColor} ${sizeClasses[size]}`}>
        <span className="mr-1.5">{config.icon}</span>
        <span className="font-medium">{t(`trashes.${trashType}.name`)}</span>
      </div>
      {size === 'lg' && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">{config.description}</p>
          <div className="text-sm text-gray-600 space-y-1">
            <p>{config.disposalGuide.instructions}</p>
            {config.disposalGuide.references.length > 0 && (
              <div>
                <p className="font-medium">References:</p>
                <ul className="list-disc list-inside">
                  {config.disposalGuide.references.map((ref, index) => (
                    <li key={index}>
                      <a href={ref} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {ref}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrashTypeIndicator;