import React from 'react';
import {
  Waves,
  Newspaper,
  Wine,
  Wrench,
  Trash2,
  Pizza
} from 'lucide-react';

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
  const getTrashTypeConfig = (type: string): TrashTypeConfig => {
    const configs: Record<string, TrashTypeConfig> = {
      'food': {
        icon: <Pizza size={size === 'sm' ? 16 : 20} />,
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-200',
        description: 'Food waste and leftovers, including scraps, peels, and uneaten food',
        disposalGuide: {
          instructions: 'Separate food waste from non-compostable packaging like plastic or paper to avoid contamination. Keep it distinct from recyclables or general waste to support composting or food waste collection systems. If possible, compost food scraps such as vegetable peels, fruit cores, and coffee grounds in a backyard compost bin or through a local program. Place food waste in a designated bin, using compostable bags if required by your local waste management service.',
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
        description: 'Glass bottles, jars, and containers, such as wine bottles, mason jars, and food containers',
        disposalGuide: {
          instructions: 'Rinse glass items thoroughly to remove food residue or liquids, ensuring they are recyclable. Remove metal or plastic caps and lids, as they are often recycled separately or discarded. If required by your local program, sort glass by color (clear, green, brown) to streamline processing. Place cleaned glass in a designated glass recycling bin or follow curbside pickup guidelines.',
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
        description: 'Metal items including cans, aluminum foil, and scrap metal like tin cans, aerosol cans, and foil trays',
        disposalGuide: {
          instructions: 'Clean and rinse metal cans and containers to remove food residue or liquids, preventing contamination. Peel off paper or plastic labels when possible, as they may need separate recycling or disposal. Crush aluminum or tin cans to save space and ease collection. Place prepared metal items in a designated metal recycling bin or curbside recycling pickup.',
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
        description: 'Paper products including cardboard, newspapers, magazines, and office documents',
        disposalGuide: {
          instructions: 'Keep paper and cardboard clean and dry, free from food residue, grease, or moisture, as contaminated paper cannot be recycled. Remove plastic film, tape, or bindings from paper products, as these are not recyclable with paper. Flatten cardboard boxes to save space and simplify handling. Deposit clean, dry paper and cardboard in a designated paper recycling bin or curbside pickup.',
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
        description: 'Recyclable plastic materials including bottles, containers, and packaging like PET bottles and HDPE containers',
        disposalGuide: {
          instructions: 'Rinse plastic bottles and containers to remove food, liquid, or other residues to ensure recyclability. Check local guidelines to determine if caps and labels should be removed or left attached. Crush plastic items to reduce volume, making collection and processing more efficient. Place prepared plastics in a designated plastic recycling bin or follow local curbside recycling guidelines.',
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
      description: 'Unknown waste type',
      disposalGuide: {
        instructions: 'Check local guidelines, separate if possible, consider recycling options, or consult local authorities for proper disposal.',
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
        <span className="font-medium">{trashType}</span>
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