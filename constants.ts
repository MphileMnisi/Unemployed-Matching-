import { Job } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Junior React Developer',
    company: 'TechCape Solutions',
    location: 'Cape Town, Western Cape',
    type: 'Hybrid',
    salaryRange: 'R25,000 - R35,000',
    description: 'We are looking for a junior developer with strong JavaScript and React fundamentals to join our fintech team. Experience with Tailwind is a plus.',
    requiredSkills: ['React', 'JavaScript', 'HTML/CSS', 'Git'],
    applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Junior%20React%20Developer%20Cape%20Town'
  },
  {
    id: '2',
    title: 'Data Analyst',
    company: 'Jozi FinCorp',
    location: 'Sandton, Gauteng',
    type: 'On-site',
    salaryRange: 'R40,000 - R55,000',
    description: 'Analyze financial trends using Python and SQL. Visualization experience with Tableau or PowerBI is required.',
    requiredSkills: ['Python', 'SQL', 'Data Visualization', 'Statistics'],
    applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Data%20Analyst%20Sandton'
  },
  {
    id: '3',
    title: 'Digital Marketing Specialist',
    company: 'Durban Creative',
    location: 'Durban, KZN',
    type: 'Remote',
    salaryRange: 'R20,000 - R30,000',
    description: 'Manage SEO and social media campaigns for retail clients. Content creation skills desired.',
    requiredSkills: ['SEO', 'Social Media Marketing', 'Copywriting', 'Analytics'],
    applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Digital%20Marketing%20Durban'
  },
  {
    id: '4',
    title: 'Cloud Engineer',
    company: 'AfriCloud',
    location: 'Centurion, Gauteng',
    type: 'Hybrid',
    salaryRange: 'R60,000 - R80,000',
    description: 'Maintain AWS infrastructure and CI/CD pipelines. Knowledge of Docker and Kubernetes essential.',
    requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux'],
    applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Cloud%20Engineer%20Gauteng'
  },
  {
    id: '5',
    title: 'Customer Success Manager',
    company: 'ShopLocal SA',
    location: 'Remote (SA)',
    type: 'Remote',
    salaryRange: 'R18,000 - R25,000',
    description: 'Support local merchants in onboarding to our e-commerce platform. Strong communication skills needed.',
    requiredSkills: ['Communication', 'CRM', 'Problem Solving', 'English', 'IsiZulu'],
    applicationUrl: 'https://www.linkedin.com/jobs/search/?keywords=Customer%20Success%20Manager%20South%20Africa'
  }
];

export const INITIAL_RESUME_TEXT = `Detailed, results-oriented professional with experience in...
(Paste your CV content here to get started)`;