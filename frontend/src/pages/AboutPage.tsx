import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Github, Facebook, Mail } from 'lucide-react';

// import local images
import sonAvt from '../assets/HoangSon.jpg';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    image: string;
    bio: string;
    social: {
        github?: string;
        facebook?: string;
        email?: string;
    };
}

const teamMembers: TeamMember[] = [
    {
        id: 1,
        name: "Hoàng Sơn",
        role: "Frontend + Backend Developer",
        image: sonAvt,
        bio: "Mã sinh viên: 23020423",
        social: {
            github: "https://github.com/Hoangson1506",
            facebook: "https://www.facebook.com/hoang.son.519672/?locale=vi_VN",
            email: "mailto:hs.hoangson15062005@gmail.com"
        }
    },
    {
        id: 2,
        name: "Phạm Minh Tú",
        role: "Backend + Database Developer",
        image: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        bio: "Mã sinh viên: ...",
        social: {
            github: "https://github.com/minhtuuse",
            facebook: "https://www.facebook.com/pham.minh.tu.50316?locale=vi_VN",
            email: "mailto:#"
        }
    },
    {
        id: 3,
        name: "Nguyễn Công Trình",
        role: "Model Developer",
        image: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        bio: "Mã sinh viên: ...",
        social: {
            github: "https://github.com/nctrinh",
            facebook: "https://www.facebook.com/nctrinh.2705?locale=vi_VN",
            email: "mailto:#"
        }
    },
    {
        id: 4,
        name: "Nguyễn Công Vinh",
        role: "Admin Page Developer",
        image: "https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        bio: "Mã sinh viên: ...",
        social: {
            github: "#",
            facebook: "https://www.facebook.com/vinh.cong.175596?locale=vi_VN",
            email: "mailto:#"
        }
    }
];

const AboutPage: React.FC = () => {
    const { t } = useTranslation();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="space-y-16"
            >
                {/* Hero Section */}
                <motion.section variants={itemVariants} className="text-center space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                        {t('about.title', 'Meet Our Team')}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {t('about.description', 'We are passionate about using technology to create a cleaner, more sustainable future. Our diverse team brings together expertise in AI, environmental science, and software development.')}
                    </p>
                </motion.section>

                {/* Team Grid */}
                <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {teamMembers.map((member) => (
                        <motion.div
                            key={member.id}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md"
                        >
                            <div className="aspect-square overflow-hidden bg-gray-100">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                                    <p className="text-green-600 font-medium">{member.role}</p>
                                </div>
                                <p className="text-gray-600 text-sm">{member.bio}</p>
                                <div className="flex justify-center space-x-4">
                                    {member.social.github && (
                                        <a
                                            href={member.social.github}
                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Github size={20} />
                                        </a>
                                    )}
                                    {member.social.facebook && (
                                        <a
                                            href={member.social.facebook}
                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Facebook size={20} />
                                        </a>
                                    )}
                                    {member.social.email && (
                                        <a
                                            href={member.social.email}
                                            className="text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            <Mail size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Mission Section */}
                <motion.section
                    variants={itemVariants}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-8 md:p-12"
                >
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl font-bold">
                            {t('about.mission.title', 'Our Mission')}
                        </h2>
                        <p className="text-lg opacity-90">
                            {t('about.mission.description', 'To revolutionize waste management through AI technology, making proper waste disposal accessible and intuitive for everyone. We believe that small actions, when multiplied by millions, can transform the world.')}
                        </p>
                    </div>
                </motion.section>
            </motion.div>
        </div>
    );
};

export default AboutPage;