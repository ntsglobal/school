import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import User from '../models/User.js';
import Language from '../models/Language.js';
import CulturalContent from '../models/CulturalContent.js';
import Post from '../models/Post.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();
        console.log('MongoDB Connected for Seeding...');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Language.deleteMany({});
        await CulturalContent.deleteMany({});
        await Post.deleteMany({});
        console.log('Data cleared.');

        // Create a sample user
        const sampleUser = await User.create({
            firebaseUid: 'sample-firebase-uid-12345',
            email: 'seeduser@example.com',
            firstName: 'Seed',
            lastName: 'User',
            role: 'student',
            grade: 8,
            board: 'CBSE',
        });
        console.log('Sample user created.');

        const userId = sampleUser._id;

        // Sample Data
        const sampleLanguages = [
            { 
                name: 'Japanese', 
                code: 'ja', 
                nativeName: '日本語', 
                flag: '🇯🇵', 
                icon: 'icon-japanese', 
                cefrLevels: [{code: 'A1', name: 'Beginner'}],
                difficulty: 'Hard', 
                family: 'Japonic', 
                writingSystem: 'Hiragana, Katakana, Kanji' 
            },
            { 
                name: 'Spanish', 
                code: 'es', 
                nativeName: 'Español', 
                flag: '🇪🇸', 
                icon: 'icon-spanish', 
                cefrLevels: [{code: 'A1', name: 'Beginner'}],
                difficulty: 'Easy', 
                family: 'Romance', 
                writingSystem: 'Latin' 
            },
        ];

        const languages = await Language.insertMany(sampleLanguages);
        console.log('Languages seeded.');

        const languageMap = {};
        languages.forEach(lang => {
            languageMap[lang.name] = lang._id;
        });

        const sampleCulturalContent = [
            {
                title: 'The Art of Haiku',
                description: 'Learn about the traditional Japanese poetry form of haiku and its cultural significance.',
                language: languageMap['Japanese'],
                category: 'arts',
                subcategory: 'Poetry',
                region: 'Japan',
                content: { text: 'A haiku is a short form of Japanese poetry in three phrases...' },
                difficulty: 'intermediate',
                cefrLevel: 'B1',
                estimatedReadTime: 5,
            },
            {
                title: 'Flamenco Dancing',
                description: 'Discover the passionate art of flamenco dancing from Spain and its cultural roots.',
                language: languageMap['Spanish'],
                category: 'arts',
                subcategory: 'Dance',
                region: 'Spain',
                content: { text: 'Flamenco is a Spanish art form made up of three parts: guitar playing, song, and dance.' },
                difficulty: 'beginner',
                cefrLevel: 'A2',
                estimatedReadTime: 8,
            },
        ];

        await CulturalContent.insertMany(sampleCulturalContent);
        console.log('Cultural content seeded.');

        const sampleCommunityPosts = [
            {
                type: 'forum',
                title: 'Tips for learning Kanji?',
                content: "I'm finding Kanji really difficult. Any advice on how to memorize them effectively?",
                author: userId,
                language: languageMap['Japanese'],
                category: 'Study Tips',
            },
            {
                type: 'buddy_request',
                nativeLanguage: languageMap['Japanese'],
                learningLanguage: languageMap['Spanish'],
                bio: "Hola! I'm a native Japanese speaker looking for a language buddy to practice Spanish with. I'm at a B1 level.",
                author: userId,
                content: "Looking for a language buddy.",
            },
        ];

        await Post.insertMany(sampleCommunityPosts);
        console.log('Community posts seeded.');

        console.log('Data seeded successfully!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
    }
};

seedDatabase();
