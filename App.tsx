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
  ChevronRight
} from './components/Icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MOCK_JOBS, INITIAL_RESUME_TEXT } from './constants';
import { parseResume, matchJobs } from './services/geminiService';
import { Job, CandidateProfile, MatchResult } from './types';
import mammoth from 'mammoth';

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
  
  // State to store file details including optional extracted text for non-PDF files
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
        // Remove base64 prefix: "data:application/pdf;base64,"
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
          // Extract text from DOCX
          const result = await mammoth.extractRawText({ arrayBuffer });
          setSelectedFile({
            name: file.name,
            mimeType: file.type,
            extractedText: result.value // The raw text
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
    if (!resumeText.trim() && !selectedFile) return;
    setIsAnalyzing(true);
    setStage('parsing');

    try {
      // 1. Prepare Input
      // If we have extracted text (from DOCX or TXT), send it as text.
      // If we have a PDF, send the base64 data.
      let input;
      if (selectedFile) {
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
                <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-white group-hover:scale-110 transition-transform shadow-sm">
                  <UploadCloud className="w-8 h-8 text-brand-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">Click to upload or drag and drop</h3>
                <div className="text-xs text-gray-500 space-y-1">
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

const MatchScore = ({ score }: { score: number }) => {
  const isHigh = score >= 80;
  const isMedium = score >= 50 && score < 80;
  
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          className="text-gray-200"
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Header */}
      <div className="bg-brand-900 text-white shadow-lg sticky top-16 z-30">
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
          <div className="lg:col-span-4 flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
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
                    onClick={() => { setSelectedMatch(match); setActiveTab('overview'); }}
                    className={`
                      relative cursor-pointer p-4 rounded-xl border transition-all duration-200 group flex items-center gap-4
                      ${isSelected 
                        ? 'bg-brand-50 border-brand-500 shadow-sm' 
                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}
                    `}
                  >
                    {/* Rank Badge */}
                    <div className={`
                      flex flex-col items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0
                      ${index === 0 ? 'bg-sa-gold text-white' : index === 1 ? 'bg-gray-300 text-white' : 'bg-gray-100 text-gray-500'}
                    `}>
                      #{index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-brand-700' : 'text-gray-900'}`}>
                        {job.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">{job.company}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 flex items-center gap-1">
                           <MapPin className="w-3 h-3"/> {job.location.split(',')[0]}
                        </span>
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
          <div className="lg:col-span-8 h-full overflow-y-auto custom-scrollbar rounded-2xl shadow-xl border border-gray-100 bg-white">
            {selectedMatch && selectedJob ? (
              <div className="relative">
                {/* Job Hero */}
                <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-700 text-xs font-bold border border-blue-100">
                         {selectedJob.type}
                       </span>
                       <span className="px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100 flex items-center gap-1">
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
                  
                  <div className="flex items-center gap-4">
                     <MatchScore score={selectedMatch.matchScore} />
                     <a 
                       href={selectedJob.applicationUrl} 
                       target="_blank" 
                       rel="noreferrer"
                       className="hidden md:flex flex-col items-center justify-center bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-brand-500/25 group"
                     >
                       <span className="flex items-center gap-2">
                         Apply Now <ExternalLink className="w-4 h-4" />
                       </span>
                       <span className="text-[10px] opacity-80 font-normal">Opens in new tab</span>
                     </a>
                  </div>
                </div>
                
                {/* Mobile Apply Button (only visible on small screens) */}
                <div className="md:hidden p-4 border-b border-gray-100">
                   <a 
                     href={selectedJob.applicationUrl} 
                     target="_blank" 
                     rel="noreferrer"
                     className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-bold shadow-md"
                   >
                     Apply Now <ExternalLink className="w-4 h-4" />
                   </a>
                </div>

                {/* Tabs */}
                <div className="bg-gray-50/50 px-6 pt-4 border-b border-gray-200 flex gap-6 overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap
                      ${activeTab === 'overview' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}
                    `}
                  >
                    <BrainCircuit className="w-4 h-4" /> Match Analysis
                  </button>
                  <button 
                    onClick={() => setActiveTab('upskill')}
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
                      <div className="bg-gradient-to-br from-brand-50 to-white p-6 rounded-2xl border border-brand-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <span className="bg-brand-100 p-1.5 rounded-md"><BrainCircuit className="w-4 h-4 text-brand-600"/></span>
                          Why you're a match
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {selectedMatch.reasoning}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {/* Job Description */}
                         <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b pb-2">Job Description</h3>
                            <p className="text-gray-600 text-sm leading-7">
                              {selectedJob.description}
                            </p>
                         </div>

                         {/* Skills Visualization */}
                         <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b pb-2">Skill Requirements</h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                              {selectedJob.requiredSkills.map(skill => {
                                const hasSkill = !selectedMatch.missingSkills.includes(skill);
                                return (
                                  <span key={skill} className={`
                                    px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5
                                    ${hasSkill 
                                      ? 'bg-green-50 text-green-700 border-green-200' 
                                      : 'bg-gray-50 text-gray-500 border-gray-200 opacity-60'}
                                  `}>
                                    {hasSkill ? <CheckCircle className="w-3 h-3" /> : <div className="w-3 h-3 rounded-full border border-gray-400"></div>}
                                    {skill}
                                  </span>
                                );
                              })}
                            </div>

                            <h4 className="text-xs font-bold text-gray-500 mb-3">Your Profile Strength</h4>
                            <div className="h-40 w-full bg-white rounded-lg border border-gray-100 p-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={skillsData} layout="vertical" margin={{ left: 0 }}>
                                  <XAxis type="number" hide domain={[0, 100]} />
                                  <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 10, fill: '#64748b'}} interval={0} />
                                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                  <Bar dataKey="value" barSize={12} radius={[0, 4, 4, 0]}>
                                    {skillsData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill="#0ea5e9" />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
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
                               <span key={skill} className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm font-semibold shadow-sm">
                                 {skill}
                               </span>
                             ))}
                           </div>
                         ) : (
                           <div className="bg-green-50 border border-green-100 rounded-xl p-6 text-center">
                             <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
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
                             <div key={idx} className="group flex flex-col justify-between border border-gray-200 rounded-xl p-5 hover:border-sa-green/50 hover:shadow-lg transition-all bg-white">
                               <div>
                                 <div className="flex justify-between items-start mb-2">
                                   <div className="text-xs font-bold text-white bg-sa-green px-2 py-1 rounded">{course.provider}</div>
                                   <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">{course.cost}</span>
                                 </div>
                                 <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-sa-green transition-colors line-clamp-2">{course.title}</h4>
                                 <p className="text-sm text-gray-500 line-clamp-3 mb-4">{course.description}</p>
                               </div>
                               
                               <div className="pt-4 border-t border-gray-100 mt-auto flex items-center justify-between">
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
                             <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
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
              <div className="h-full flex flex-col items-center justify-center text-gray-400 p-12 bg-gray-50/50">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
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