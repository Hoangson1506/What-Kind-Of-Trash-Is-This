import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThumbsUp, ThumbsDown, Edit3 } from 'lucide-react';

interface FeedbackFormProps {
    imageId: string;
    originalImage: string;
    onFeedbackSubmit: (feedback: FeedbackData) => void;
    onStartLabeling: () => void;
}

export interface FeedbackData {
    imageId: string;
    originalImage: string;
    isCorrect: boolean;
    comment?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ imageId, originalImage, onFeedbackSubmit, onStartLabeling }) => {
    const { t } = useTranslation();
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = () => {
        if (isCorrect === null) return;

        onFeedbackSubmit({
            imageId,
            originalImage,
            isCorrect,
            comment: comment.trim() || undefined
        });

        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <div className="text-center text-green-600 py-2">
                {t('results.feedback.thanks')}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => setIsCorrect(true)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isCorrect === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <ThumbsUp size={20} className="mr-2" />
                    {t('results.feedback.correct')}
                </button>
                <button
                    onClick={() => setIsCorrect(false)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isCorrect === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <ThumbsDown size={20} className="mr-2" />
                    {t('results.feedback.incorrect')}
                </button>
            </div>

            {isCorrect === false && (
                <div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={t('results.feedback.comment')}
                        className="w-full p-2 border rounded-lg resize-none h-24 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                </div>
            )}

            <div className="flex justify-between items-center">
                <button
                    onClick={onStartLabeling}
                    className="flex items-center px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                    <Edit3 size={20} className="mr-2" />
                    {t('results.feedback.improveLabeling')}
                </button>

                <button
                    onClick={handleSubmit}
                    disabled={isCorrect === null}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {t('results.feedback.submit')}
                </button>
            </div>
        </div>
    );
};

export default FeedbackForm;