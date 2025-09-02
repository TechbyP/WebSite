import { motion } from 'framer-motion';
import { useTheme } from '../../utils/context/theme-context';

interface InfoCardProps {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

const InfoCard = ({ title, icon, children }: InfoCardProps) => {
    const { theme } = useTheme();
    
    const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textClass = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
    const shadowClass = theme === 'dark' ? 'shadow-lg' : 'shadow-sm';

    const combinedVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        },
        hover: {
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            variants={combinedVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className={`${cardBgClass} p-6 rounded-xl ${shadowClass}`}
        >
            <div className="flex items-center mb-4">
                <motion.div
                    whileHover={{ rotate: 10 }}
                    className="p-3 rounded-full bg-blue-900 text-blue-400"
                >
                    {icon}
                </motion.div>
                <h3 className={`ml-3 text-xl font-bold ${textClass}`}>{title}</h3>
            </div>
            {children}
        </motion.div>
    );
};

export default InfoCard;