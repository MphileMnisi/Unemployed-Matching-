import React, { useState, useEffect, useRef } from 'react';
import { 
  Briefcase, 
  UploadCloud, 
  CheckCircle, 
  TrendingUp, 
  BookOpen, 
  MapPin, 
  Coins, 
  ArrowRight, 
  BrainCircuit, 
  Loader2, 
  FileText, 
  Search, 
  AlertCircle, 
  X, 
  File,
  ExternalLink,
  Share2,
  ChevronRight,
  MessageCircle
} from './components/Icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOCK_JOBS, INITIAL_RESUME_TEXT } from './constants';
import { parseResume, matchJobs } from './services/geminiService';
import { Job, CandidateProfile, MatchResult } from './types';
import mammoth from 'mammoth';

// --- Components ---

interface HeaderProps {
  onNavigate: (view: 'home' | 'analyze' | 'results', tab?: 'overview' | 'upskill') => void;
  currentView: string;
}

const Header = ({ onNavigate, currentView }: HeaderProps) => (
  <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <div 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 cursor-pointer"
      >
        <div className="bg-gradient-to-tr from-brand-600 to-sa-green p-2 rounded-lg shadow-lg shadow-brand-500/20">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-900 to-brand-600">
          Kusasa
        </span>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
        <button 
          onClick={() => onNavigate('home')}
          className={`hover:text-brand-600 transition-colors ${currentView === 'home' ? 'text-brand-600' : ''}`}
        >
          Find Jobs
        </button>
        <button 
          onClick={() => onNavigate('results', 'upskill')}
          className="hover:text-brand-600 transition-colors"
        >
          Upskill
        </button>
        <button 
          onClick={() => onNavigate('results', 'overview')}
          className="hover:text-brand-600 transition-colors"
        >
          Analytics
        </button>
      </nav>
      <button 
        onClick={() => alert("Employer Portal: This feature would allow companies to post jobs and search for candidates.")}
        className="bg-brand-900/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-brand-800 transition-all shadow-lg hover:shadow-brand-900/20"
      >
        For Employers
      </button>
    </div>
  </header>
);

const Hero = ({ onStart }: { onStart: () => void }) => (
  <div className="relative overflow-hidden py-24 sm:py-32">
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 backdrop-blur-md border border-blue-200 text-brand-900 text-xs font-semibold mb-6 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          AI-Powered Employment Engine
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
          Connecting South Africa's Talent to <span className="text-brand-600">Opportunity</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-lg">
          Don't let skills gaps hold you back. Our AI analyzes your potential, matches you with the right jobs across SA, and builds a custom learning path to get you hired.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button 
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 bg-brand-600/90 backdrop-blur text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/25 ring-1 ring-white/20"
          >
            <UploadCloud className="w-5 h-5" />
            Analyze My CV
          </button>
          <button 
            onClick={onStart}
            className="inline-flex items-center justify-center gap-2 bg-white/60 backdrop-blur-md text-gray-700 border border-white/50 px-6 py-3.5 rounded-xl font-semibold hover:bg-white/80 transition-colors shadow-sm"
          >
            <Search className="w-5 h-5" />
            Browse Jobs
          </button>
        </div>

        {/* WhatsApp Integration CTA */}
        <div className="bg-white/40 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white/50 max-w-md transform hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <MessageCircle className="w-20 h-20 text-green-500" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="bg-green-50/80 backdrop-blur p-3 rounded-full shrink-0 shadow-sm">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">Get Job Alerts on WhatsApp</h3>
              <p className="text-gray-600 text-xs md:text-sm mt-1 mb-3">
                Upload your CV and receive matched opportunities directly on your phone.
              </p>
              <button 
                onClick={() => window.open('https://wa.me/27123456789?text=Hi%20Kusasa%2C%20I%20want%20to%20find%20a%20job', '_blank')}
                className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-[#20bd5a] transition-colors shadow-md"
              >
                Connect Now <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
    {/* Decorative background elements */}
    <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 blur-3xl opacity-40 pointer-events-none">
      <div className="w-96 h-96 rounded-full bg-sa-green/30 mix-blend-multiply"></div>
    </div>
    <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 blur-3xl opacity-40 pointer-events-none">
      <div className="w-96 h-96 rounded-full bg-sa-gold/30 mix-blend-multiply"></div>
    </div>
  </div>
);

const Analyzer = ({ onAnalysisComplete }: { onAnalysisComplete: (profile: CandidateProfile, matches: MatchResult[]) => void }) => {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState<'idle' | 'parsing' | 'matching'>('idle');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  
  // State to store file details
  const [selectedFile, setSelectedFile] = useState<{ 
    name: string; 
    data?: string; 
    mimeType: string; 
    extractedText?: string; 
  } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    // Reset previous selection
    setSelectedFile(null);
    setStage('idle');

    // Handle PDF (Native Gemini Support)
    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove base64 prefix
        const base64Data = result.split(',')[1];
        setSelectedFile({
          name: file.name,
          data: base64Data,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    } 
    // Handle DOCX (Convert to Text via Mammoth)
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          setSelectedFile({
            name: file.name,
            mimeType: file.type,
            extractedText: result.value
          });
        } catch (error) {
          console.error("Error reading Word file:", error);
          alert("Failed to read the Word document. Please ensure it is a valid .docx file.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
    // Handle Text Files
    else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
       const reader = new FileReader();
       reader.onload = (event) => {
         const text = event.target?.result as string;
         setSelectedFile({
           name: file.name,
           mimeType: 'text/plain',
           extractedText: text
         });
       };
       reader.readAsText(file);
    }
    else {
      alert("Unsupported file type. Please upload PDF, Word (.docx), or TXT.");
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if ((inputMode === 'text' && !resumeText.trim()) || (inputMode === 'file' && !selectedFile)) return;
    setIsAnalyzing(true);
    setStage('parsing');

    try {
      let input;
      if (inputMode === 'file' && selectedFile) {
        if (selectedFile.extractedText) {
           input = { text: `FileName: ${selectedFile.name}\n\n${selectedFile.extractedText}` };
        } else if (selectedFile.data) {
           input = { file: { data: selectedFile.data, mimeType: selectedFile.mimeType } };
        } else {
           throw new Error("Invalid file state");
        }
      } else {
        input = { text: resumeText };
      }
        
      const profile = await parseResume(input);
      setStage('matching');
      const matches = await matchJobs(profile, MOCK_JOBS);
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
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden ring-1 ring-black/5">
        <div className="p-8 border-b border-gray-100/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your CV</h2>
          <p className="text-gray-600">We'll extract your skills and match you with live opportunities in South Africa.</p>
        </div>
        
        <div className="p-8 bg-white/30">
          
          {inputMode === 'file' ? (
            <div className="mb-6 animate-fadeIn">
              {!selectedFile ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer group relative border-2 border-dashed border-gray-400/50 rounded-2xl p-10 transition-all hover:border-brand-500 hover:bg-white/50 flex flex-col items-center justify-center text-center bg-white/40"
                >
                  <div className="bg-blue-50/80 p-4 rounded-full mb-4 group-hover:bg-white group-hover:scale-110 transition-transform shadow-sm ring-1 ring-blue-100">
                    <UploadCloud className="w-10 h-10 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Click to upload or drag and drop</h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Supported formats: <span className="font-medium text-gray-700">PDF, Word (.docx), TXT</span></p>
                    <p>Maximum file size: <span className="font-medium text-gray-700">5MB</span></p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept=".pdf,.docx,.txt"
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur border border-brand-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-brand-100/80 p-3 rounded-xl">
                      <File className="w-6 h-6 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Ready for analysis
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={clearFile}
                    className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button 
                  onClick={() => setInputMode('text')}
                  className="text-sm text-brand-600 font-medium hover:text-brand-800 hover:underline transition-colors"
                >
                  Prefer to paste text manually?
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 animate-fadeIn">
               <div className="flex justify-between items-center mb-2">
                 <label className="text-sm font-semibold text-gray-700">Paste CV Content</label>
                 <button 
                    onClick={() => setInputMode('file')}
                    className="text-xs text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    Switch to File Upload
                  </button>
               </div>
               <textarea 
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-64 p-4 rounded-xl border border-gray-200/50 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono text-sm text-gray-700 resize-none shadow-inner bg-white/50 backdrop-blur"
                  placeholder="Paste your resume summary and skills here..."
                />
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (inputMode === 'file' ? !selectedFile : !resumeText.trim())}
              className={`
                inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all
                ${isAnalyzing || (inputMode === 'file' ? !selectedFile : !resumeText.trim())
                  ? 'bg-gray-400/50 cursor-not-allowed shadow-none border border-gray-200' 
                  : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-500/25 ring-1 ring-white/20'}
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

const MatchScore = ({ score }: { score: number }) => {
  const isHigh = score >= 80;
  const isMedium = score >= 50 && score < 80;
  
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-gray-200/50"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className={`${isHigh ? 'text-green-500' : isMedium ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
          strokeDasharray={`${score}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-sm font-bold text-gray-700">{score}%</span>
      </div>
    </div>
  );
};

const ResultsDashboard = ({ 
  profile, 
  matches, 
  onReset,
  activeTab,
  onTabChange
}: { 
  profile: CandidateProfile, 
  matches: MatchResult[], 
  onReset: () => void,
  activeTab: 'overview' | 'upskill',
  onTabChange: (tab: 'overview' | 'upskill') => void
}) => {
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(matches[0] || null);

  const selectedJob = MOCK_JOBS.find(j => j.id === selectedMatch?.jobId);
  const sortedMatches = [...matches].sort((a, b) => b.matchScore - a.matchScore);

  // Data for chart: Aggregate skills by level
  const skillLevelCounts = profile.extractedSkills.reduce((acc, skill) => {
    acc[skill.level] = (acc[skill.level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(skillLevelCounts).map(([name, value]) => ({ name, value }));
  const COLORS: Record<string, string> = { 
    'Expert': '#059669', // Green
    'Advanced': '#0ea5e9', // Blue
    'Intermediate': '#eab308', // Yellow
    'Beginner': '#94a3b8' // Gray
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="bg-brand-900/90 backdrop-blur-md text-white shadow-lg sticky top-16 z-30 border-t border-brand-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-brand-800 p-2 rounded-full hidden md:block">
              <Briefcase className="w-5 h-5 text-brand-200" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Top Match: {profile.suggestedRoles[0]}</h2>
              <p className="text-brand-200 text-xs">{profile.extractedSkills.length} skills identified • {profile.yearsExperience} years exp</p>
            </div>
          </div>
          <button onClick={onReset} className="text-sm bg-brand-800/50 hover:bg-brand-700 border border-brand-700 px-4 py-2 rounded-lg transition-colors">
            Analyze New CV
          </button>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-180px)]">
          
          {/* Left Column: Job List (Scrollable) */}
          <div className="lg:col-span-4 flex flex-col h-full bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden ring-1 ring-black/5">
            <div className="p-4 border-b border-gray-100/50 bg-white/30">
               <h3 className="font-bold text-gray-900 flex items-center gap-2">
                 <Search className="w-4 h-4 text-brand-600" />
                 Matched Opportunities
               </h3>
               <p className="text-xs text-gray-500 mt-1">Ranked by AI compatibility score</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
              {sortedMatches.map((match, index) => {
                const job = MOCK_JOBS.find(j => j.id === match.jobId);
                if (!job) return null;
                const isSelected = selectedMatch?.jobId === match.jobId;
                
                return (
                  <div 
                    key={match.jobId}
                    onClick={() => { setSelectedMatch(match); onTabChange('overview'); }}
                    className={`
                      relative cursor-pointer p-4 rounded-xl border transition-all duration-200 group flex items-center gap-4
                      ${isSelected 
                        ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-100' 
                        : 'bg-white/40 border-transparent hover:bg-white/80 hover:border-gray-200 hover:shadow-sm'}
                    `}
                  >
                    {/* Rank Badge */}
                    <div className={`
                      flex flex-col items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0
                      ${index === 0 ? 'bg-sa-gold text-white' : index === 1 ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-500'}
                    `}>
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-brand-700' : 'text-gray-900'}`}>
                        {job.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{job.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100/80 px-1.5 py-0.5 rounded text-gray-600 flex items-center gap-1 border border-gray-100">
                           <MapPin className="w-3 h-3"/> {job.location.split(',')[0]}
                        </span>
                        <div className="flex gap-1">
                          {job.applicationLinks.map(link => (
                            <span key={link.source} className="text-[8px] bg-gray-100/80 text-gray-500 px-1 rounded border border-gray-200">
                              {link.source.charAt(0)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-lg font-bold ${match.matchScore >= 80 ? 'text-green-600' : match.matchScore >= 50 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {match.matchScore}%
                      </div>
                      <div className="text-[10px] text-gray-400">Match</div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-xl"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed View (Scrollable) */}
          <div className="lg:col-span-8 h-full overflow-y-auto custom-scrollbar rounded-2xl shadow-xl border border-white/50 bg-white/70 backdrop-blur-2xl ring-1 ring-black/5">
            {selectedMatch && selectedJob ? (
              <div className="relative">
                {/* Job Hero */}
                <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2.5 py-0.5 rounded-full bg-blue-50/80 text-brand-700 text-xs font-bold border border-blue-100">
                         {selectedJob.type}
                       </span>
                       <span className="px-2.5 py-0.5 rounded-full bg-gray-50/80 text-gray-600 text-xs font-medium border border-gray-100 flex items-center gap-1">
                         <Coins className="w-3 h-3" /> {selectedJob.salaryRange}
                       </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{selectedJob.title}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                      <Briefcase className="w-4 h-4" /> {selectedJob.company}
                      <span className="text-gray-300">•</span>
                      <MapPin className="w-4 h-4" /> {selectedJob.location}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                     <div className="flex items-center gap-4 mb-2">
                       <div className="text-right hidden md:block">
                         <div className="text-xs text-gray-500 uppercase font-semibold">Match Score</div>
                         <div className="text-sm font-medium text-gray-400">Based on profile</div>
                       </div>
                       <MatchScore score={selectedMatch.matchScore} />
                     </div>
                     
                     <div className="flex gap-2">
                        {selectedJob.applicationLinks.map(link => (
                          <a 
                             key={link.source}
                             href={link.url} 
                             target="_blank" 
                             rel="noreferrer"
                             className={`
                               flex items-center gap-2 text-white px-3 py-2 rounded-lg font-bold text-xs transition-all shadow-md hover:-translate-y-0.5 border border-white/20
                               ${link.source === 'LinkedIn' ? 'bg-[#0077b5] hover:bg-[#005e93]' : 
                                 link.source === 'Pnet' ? 'bg-[#e03c31] hover:bg-[#c42b20]' : 
                                 'bg-[#2557a7] hover:bg-[#1d4382]'}
                             `}
                           >
                             {link.source} <ExternalLink className="w-3 h-3" />
                           </a>
                        ))}
                     </div>
                  </div>
                </div>
                
                {/* Mobile Apply Buttons (only visible on small screens) */}
                <div className="md:hidden p-4 border-b border-gray-100/50 grid grid-cols-3 gap-2">
                   {selectedJob.applicationLinks.map(link => (
                      <a 
                        key={link.source}
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className={`flex items-center justify-center gap-1 text-white py-2 rounded-lg font-bold text-xs shadow-sm
                          ${link.source === 'LinkedIn' ? 'bg-[#0077b5]' : 
                            link.source === 'Pnet' ? 'bg-[#e03c31]' : 
                            'bg-[#2557a7]'}
                        `}
                      >
                        {link.source} <ExternalLink className="w-3 h-3" />
                      </a>
                   ))}
                </div>

                {/* Tabs */}
                <div className="bg-white/30 px-6 pt-4 border-b border-gray-200/50 flex gap-6 overflow-x-auto">
                  <button 
                    onClick={() => onTabChange('overview')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                      ${activeTab === 'overview' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                    `}
                  >
                    <BrainCircuit className="w-4 h-4" /> Match Analysis
                  </button>
                  <button 
                    onClick={() => onTabChange('upskill')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                      ${activeTab === 'upskill' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                    `}
                  >
                    <TrendingUp className="w-4 h-4" /> Skill Gap & Courses
                  </button>
                </div>

                <div className="p-6 md:p-8 min-h-[500px]">
                  {activeTab === 'overview' ? (
                    <div className="space-y-8 animate-fadeIn">
                      {/* AI Reasoning */}
                      <div className="bg-gradient-to-br from-white to-brand-50/50 p-6 rounded-2xl border border-white/60 shadow-sm backdrop-blur">
                        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="bg-brand-100/50 p-1.5 rounded-md"><BrainCircuit className="w-4 h-4 text-brand-600"/></span>
                          Why you're a match
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedMatch.reasoning}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Job Description */}
                         <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b border-gray-200/50 pb-2">Job Description</h3>
                            <p className="text-gray-600 text-sm leading-7">
                              {selectedJob.description}
                            </p>
                            
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 mt-8 border-b border-gray-200/50 pb-2">Skill Requirements</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                              {selectedJob.requiredSkills.map(skill => {
                                const hasSkill = !selectedMatch.missingSkills.includes(skill);
                                return (
                                  <span key={skill} className={`
                                    px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 backdrop-blur-sm
                                    ${hasSkill 
                                      ? 'bg-green-50/50 text-green-700 border-green-200/50' 
                                      : 'bg-gray-50/50 text-gray-500 border-gray-200/50 opacity-60'}
                                  `}>
                                    {hasSkill ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-400"></div>}
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>
                         </div>

                         {/* Profile Strength Pie Chart */}
                         <div>
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b border-gray-200/50 pb-2">Your Profile Strength</h4>
                            <div className="h-64 w-full bg-white/50 backdrop-blur rounded-xl border border-white/50 p-4 relative shadow-sm">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                  >
                                    {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#94a3b8'} stroke="none" />
                                    ))}
                                  </Pie>
                                  <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.9)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}
                                  />
                                  <Legend 
                                    verticalAlign="bottom" 
                                    height={36} 
                                    iconType="circle"
                                    iconSize={8}
                                    formatter={(value) => <span className="text-xs font-medium text-gray-600 ml-1">{value}</span>}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                              {/* Center Text */}
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none mb-8">
                                <div className="text-center">
                                  <span className="block text-2xl font-bold text-brand-900">{profile.extractedSkills.length}</span>
                                  <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Skills</span>
                                </div>
                              </div>
                            </div>
                         </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-fadeIn">
                       {/* Missing Skills Alert */}
                       <div>
                         <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Skill Gaps Detected
                         </h3>
                         {selectedMatch.missingSkills.length > 0 ? (
                           <div className="flex flex-wrap gap-3">
                             {selectedMatch.missingSkills.map(skill => (
                               <span key={skill} className="px-4 py-2 bg-amber-50/50 backdrop-blur-sm text-amber-800 border border-amber-200/50 rounded-lg text-sm font-semibold shadow-sm">
                                 {skill}
                               </span>
                             ))}
                           </div>
                         ) : (
                           <div className="bg-green-50/50 backdrop-blur border border-green-100/50 rounded-xl p-6 text-center">
                             <div className="w-12 h-12 bg-green-100/80 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                               <CheckCircle className="w-6 h-6" />
                             </div>
                             <p className="text-green-800 font-medium">Excellent! You have all the core skills listed.</p>
                             <p className="text-green-600 text-sm mt-1">Consider advanced courses to stand out even more.</p>
                           </div>
                         )}
                       </div>

                       {/* Course Recommendations */}
                       <div>
                         <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <BookOpen className="w-5 h-5 text-sa-green" />
                           Recommended Learning Path
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {selectedMatch.recommendedCourses?.map((course, idx) => (
                             <div key={idx} className="group flex flex-col justify-between border border-gray-200/60 rounded-xl p-5 hover:border-sa-green/50 hover:shadow-lg transition-all bg-white/60 backdrop-blur-sm">
                               <div>
                                 <div className="flex justify-between items-start mb-2">
                                   <div className="text-xs font-bold text-white bg-sa-green px-2 py-1 rounded shadow-sm">{course.provider}</div>
                                   <span className="text-xs font-semibold text-gray-500 bg-gray-100/80 px-2 py-1 rounded border border-gray-100">{course.cost}</span>
                                 </div>
                                 <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-sa-green transition-colors line-clamp-2">{course.title}</h4>
                                 <p className="text-sm text-gray-500 line-clamp-3 mb-4">{course.description}</p>
                               </div>
                               
                               <div className="pt-4 border-t border-gray-100/50 mt-auto flex items-center justify-between">
                                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sa-gold"></div> {course.duration}
                                  </span>
                                  <a href={course.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800">
                                    Enroll <ChevronRight className="w-4 h-4" />
                                  </a>
                               </div>
                             </div>
                           ))}
                           {(!selectedMatch.recommendedCourses || selectedMatch.recommendedCourses.length === 0) && selectedMatch.missingSkills.length > 0 && (
                             <div className="col-span-2 text-center py-12 bg-gray-50/50 backdrop-blur rounded-xl border border-dashed border-gray-300">
                               <p className="text-gray-500">We couldn't find specific courses for these skills yet.</p>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 bg-white/30 backdrop-blur">
                <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600">No Job Selected</h3>
                <p className="text-sm">Select a job from the list to view match details and apply.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'home' | 'analyze' | 'results'>('home');
  const [analysisData, setAnalysisData] = useState<{profile: CandidateProfile, matches: MatchResult[]} | null>(null);
  const [resultsTab, setResultsTab] = useState<'overview' | 'upskill'>('overview');

  const handleStart = () => setView('analyze');

  const handleAnalysisComplete = (profile: CandidateProfile, matches: MatchResult[]) => {
    setAnalysisData({ profile, matches });
    setView('results');
    setResultsTab('overview');
  };

  const handleReset = () => {
    setAnalysisData(null);
    setView('analyze');
  };

  const handleNavigate = (targetView: 'home' | 'analyze' | 'results', tab?: 'overview' | 'upskill') => {
    if (targetView === 'home') {
      setView('home');
    } else if (targetView === 'analyze') {
      setView('analyze');
    } else if (targetView === 'results') {
      if (analysisData) {
        setView('results');
        if (tab) setResultsTab(tab);
      } else {
        alert("Please analyze your CV first to see your results and upskilling recommendations.");
        setView('analyze');
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Header onNavigate={handleNavigate} currentView={view} />
      <main>
        {view === 'home' && <Hero onStart={handleStart} />}
        {view === 'analyze' && <Analyzer onAnalysisComplete={handleAnalysisComplete} />}
        {view === 'results' && analysisData && (
          <ResultsDashboard 
            profile={analysisData.profile} 
            matches={analysisData.matches} 
            onReset={handleReset}
            activeTab={resultsTab}
            onTabChange={setResultsTab}
          />
        )}
      </main>
    </div>
  );
}