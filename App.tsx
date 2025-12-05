import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  UploadCloud, 
  CheckCircle, 
  TrendingUp, 
  BookOpen, 
  MapPin, 
  DollarSign, 
  ArrowRight,
  BrainCircuit,
  Loader2,
  FileText,
  Search,
  AlertCircle,
  X,
  File
} from './components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_JOBS, INITIAL_RESUME_TEXT } from './constants';
import { parseResume, matchJobs } from './services/geminiService';
import { Job, CandidateProfile, MatchResult } from './types';

// --- Components ---

const Header = () => (
  <header className="sticky top-0 z-50 w-full backdrop-blur-lg bg-white/80 border-b border-gray-100">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="bg-gradient-to-tr from-brand-600 to-sa-green p-2 rounded-lg">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-900 to-brand-600">
          Kusasa
        </span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <a href="#" className="hover:text-brand-600 transition-colors">Find Jobs</a>
        <a href="#" className="hover:text-brand-600 transition-colors">Upskill</a>
        <a href="#" className="hover:text-brand-600 transition-colors">Analytics</a>
      </nav>
      <button className="bg-brand-900 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-800 transition-colors">
        For Employers
      </button>
    </div>
  </header>
);

const Hero = ({ onStart }: { onStart: () => void }) => (
  <div className="relative overflow-hidden bg-brand-50 py-24 sm:py-32">
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-brand-700 text-xs font-semibold mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          AI-Powered Employment Engine
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6">
          Connecting South Africa's Talent to <span className="text-brand-600">Opportunity</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Don't let skills gaps hold you back. Our AI analyzes your potential, matches you with the right jobs across SA, and builds a custom learning path to get you hired.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/25"
          >
            <UploadCloud className="w-5 h-5" />
            Analyze My CV
          </button>
          <button className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            <Search className="w-5 h-5" />
            Browse Jobs
          </button>
        </div>
      </div>
    </div>
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-30">
      <div className="w-96 h-96 rounded-full bg-sa-green"></div>
    </div>
    <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-30">
      <div className="w-96 h-96 rounded-full bg-sa-gold"></div>
    </div>
  </div>
);

const Analyzer = ({ onAnalysisComplete }: { onAnalysisComplete: (profile: CandidateProfile, matches: MatchResult[]) => void }) => {
  const [resumeText, setResumeText] = useState(INITIAL_RESUME_TEXT);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState<'idle' | 'parsing' | 'matching'>('idle');
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove base64 prefix for API: "data:application/pdf;base64,"
      const base64Data = result.split(',')[1];
      setSelectedFile({
        name: file.name,
        data: base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !selectedFile) return;
    setIsAnalyzing(true);
    setStage('parsing');

    try {
      // 1. Parse Resume (File or Text)
      const input = selectedFile 
        ? { file: { data: selectedFile.data, mimeType: selectedFile.mimeType } }
        : { text: resumeText };
        
      const profile = await parseResume(input);
      setStage('matching');

      // 2. Match Jobs
      const matches = await matchJobs(profile, MOCK_JOBS);
      
      // 3. Complete
      onAnalysisComplete(profile, matches);
    } catch (error) {
      console.error(error);
      alert("Something went wrong analyzing the resume. Please ensure the file is valid and try again.");
      setStage('idle');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload or Paste Your CV</h2>
          <p className="text-gray-500">We'll extract your skills and match you with live opportunities in South Africa.</p>
        </div>
        
        <div className="p-8 bg-gray-50/50">
          
          {/* File Upload Area */}
          <div className="mb-6">
            {!selectedFile ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer group relative border-2 border-dashed border-gray-300 rounded-xl p-8 transition-all hover:border-brand-500 hover:bg-brand-50 flex flex-col items-center justify-center text-center"
              >
                <div className="bg-blue-50 p-3 rounded-full mb-3 group-hover:bg-white group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Click to upload or drag and drop</h3>
                <p className="text-xs text-gray-500">PDF, DOCX, TXT up to 5MB</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="bg-white border border-brand-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-100 p-2 rounded-lg">
                    <File className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-green-600 font-medium">Ready for analysis</p>
                  </div>
                </div>
                <button 
                  onClick={clearFile}
                  className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <span className="relative bg-gray-50 px-2 text-xs uppercase text-gray-400 font-medium">Or paste text</span>
          </div>

          {/* Text Area (Disabled if file selected) */}
          <div className={`relative transition-opacity ${selectedFile ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <textarea 
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm text-gray-700 resize-none shadow-sm"
              placeholder="Paste your resume content here if you don't have a file..."
              disabled={!!selectedFile}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!selectedFile && !resumeText.trim())}
              className={`
                inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                ${isAnalyzing || (!selectedFile && !resumeText.trim()) 
                  ? 'bg-gray-400 cursor-not-allowed shadow-none' 
                  : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/25'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {stage === 'parsing' ? 'Extracting Profile...' : 'Matching Jobs...'}
                </>
              ) : (
                <>
                  <BrainCircuit className="w-5 h-5" />
                  Analyze & Match
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResultsDashboard = ({ profile, matches, onReset }: { profile: CandidateProfile, matches: MatchResult[], onReset: () => void }) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(matches[0] || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'upskill'>('overview');

  const selectedJob = MOCK_JOBS.find(j => j.id === selectedMatch?.jobId);
  const sortedMatches = [...matches].sort((a, b) => b.matchScore - a.matchScore);

  // Data for chart
  const skillsData = profile.extractedSkills.map(s => ({
    name: s.name,
    value: s.level === 'Expert' ? 100 : s.level === 'Advanced' ? 75 : s.level === 'Intermediate' ? 50 : 25
  })).slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-brand-900 text-white pb-32 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Hello, Candidate</h2>
              <p className="text-brand-100 max-w-xl text-sm leading-relaxed opacity-90">{profile.summary}</p>
            </div>
            <button onClick={onReset} className="text-sm bg-brand-800 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors">
              Analyze New CV
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-brand-100 text-xs uppercase tracking-wider font-semibold mb-1">Top Role Match</div>
              <div className="text-2xl font-bold">{profile.suggestedRoles[0]}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-brand-100 text-xs uppercase tracking-wider font-semibold mb-1">Experience Detected</div>
              <div className="text-2xl font-bold">{profile.yearsExperience} Years</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <div className="text-brand-100 text-xs uppercase tracking-wider font-semibold mb-1">Skills Identified</div>
              <div className="text-2xl font-bold">{profile.extractedSkills.length} Skills</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Match List */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-white font-semibold mb-4 px-2">Matched Opportunities</h3>
            {sortedMatches.map((match) => {
              const job = MOCK_JOBS.find(j => j.id === match.jobId);
              if (!job) return null;
              const isSelected = selectedMatch?.jobId === match.jobId;
              
              return (
                <div 
                  key={match.jobId}
                  onClick={() => setSelectedMatch(match)}
                  className={`
                    cursor-pointer p-4 rounded-xl border transition-all duration-200
                    ${isSelected 
                      ? 'bg-white border-brand-500 ring-2 ring-brand-500/20 shadow-lg' 
                      : 'bg-white border-gray-100 hover:border-brand-200 hover:shadow-md opacity-95'}
                  `}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{job.title}</h4>
                    <span className={`
                      text-xs font-bold px-2 py-1 rounded-full
                      ${match.matchScore > 80 ? 'bg-green-100 text-green-700' : 
                        match.matchScore > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                    `}>
                      {match.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{job.company}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {job.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3"/> {job.salaryRange}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed View */}
          <div className="lg:col-span-2">
            {selectedMatch && selectedJob ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h2>
                    <p className="text-gray-600">{selectedJob.company} • {selectedJob.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveTab('overview')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => setActiveTab('upskill')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'upskill' ? 'bg-brand-100 text-brand-700' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      Skill Gap & Training
                    </button>
                  </div>
                </div>

                <div className="p-8 min-h-[500px]">
                  {activeTab === 'overview' ? (
                    <div className="space-y-6 animate-fadeIn">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <BrainCircuit className="w-5 h-5 text-brand-500" />
                          AI Analysis
                        </h3>
                        <p className="text-gray-600 bg-brand-50 p-4 rounded-xl text-sm leading-relaxed border border-brand-100">
                          {selectedMatch.reasoning}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Skill Profile</h3>
                          <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={skillsData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                  {skillsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#0ea5e9" />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div>
                           <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Requirements</h3>
                           <div className="flex flex-wrap gap-2">
                              {selectedJob.requiredSkills.map(skill => (
                                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                  {skill}
                                </span>
                              ))}
                           </div>
                           <div className="mt-6">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                              <p className="text-sm text-gray-600">{selectedJob.description}</p>
                           </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                         <button className="w-full bg-brand-600 text-white font-semibold py-4 rounded-xl hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20">
                           Apply Now via Kusasa
                         </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-fadeIn">
                       <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Missing Critical Skills
                         </h3>
                         {selectedMatch.missingSkills.length > 0 ? (
                           <div className="flex flex-wrap gap-2">
                             {selectedMatch.missingSkills.map(skill => (
                               <span key={skill} className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium">
                                 {skill}
                               </span>
                             ))}
                           </div>
                         ) : (
                           <p className="text-green-600 flex items-center gap-2">
                             <CheckCircle className="w-5 h-5" />
                             You have all the required core skills!
                           </p>
                         )}
                       </div>

                       <div>
                         <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                           <TrendingUp className="w-5 h-5 text-sa-green" />
                           Recommended Upskilling Path
                         </h3>
                         <div className="grid gap-4">
                           {selectedMatch.recommendedCourses?.map((course, idx) => (
                             <div key={idx} className="group border border-gray-200 rounded-xl p-5 hover:border-sa-green/50 hover:shadow-lg transition-all bg-white">
                               <div className="flex justify-between items-start">
                                 <div>
                                   <div className="text-xs font-bold text-sa-green uppercase tracking-wide mb-1">{course.provider}</div>
                                   <h4 className="font-bold text-gray-900 text-lg group-hover:text-sa-green transition-colors">{course.title}</h4>
                                   <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                                 </div>
                                 <div className="text-right shrink-0">
                                   <div className="font-semibold text-gray-900">{course.cost}</div>
                                   <div className="text-xs text-gray-500">{course.duration}</div>
                                 </div>
                               </div>
                               <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                  <span className="text-xs text-gray-400">Online Certification</span>
                                  <a href={course.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
                                    Start Learning <ArrowRight className="w-4 h-4" />
                                  </a>
                               </div>
                             </div>
                           ))}
                           {(!selectedMatch.recommendedCourses || selectedMatch.recommendedCourses.length === 0) && (
                             <p className="text-gray-500 italic">No specific courses found based on current analysis.</p>
                           )}
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-white rounded-2xl border border-gray-100 p-12">
                Select a job from the left to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Application Component ---

export default function App() {
  const [view, setView] = useState<'home' | 'analyze' | 'results'>('home');
  const [analysisData, setAnalysisData] = useState<{profile: CandidateProfile, matches: MatchResult[]} | null>(null);

  const handleStart = () => setView('analyze');

  const handleAnalysisComplete = (profile: CandidateProfile, matches: MatchResult[]) => {
    setAnalysisData({ profile, matches });
    setView('results');
  };

  const handleReset = () => {
    setAnalysisData(null);
    setView('analyze');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Header />
      <main>
        {view === 'home' && <Hero onStart={handleStart} />}
        {view === 'analyze' && <Analyzer onAnalysisComplete={handleAnalysisComplete} />}
        {view === 'results' && analysisData && (
          <ResultsDashboard 
            profile={analysisData.profile} 
            matches={analysisData.matches} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}