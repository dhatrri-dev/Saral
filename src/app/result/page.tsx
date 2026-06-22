"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import type { SimplifyResult } from "@root/types/index";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<SimplifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const text = sessionStorage.getItem("saral_document_text");
    if (!text) {
      setLoading(false);
      setError("No document found. Please go back and paste a document first.");
      return;
    }

    const fetchResult = async () => {
      try {
        const response = await fetch("/api/simplify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Something went wrong. Please try again.");
          return;
        }

        setResult(data as SimplifyResult);
      } catch {
        setError("Could not connect to the server. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setResult(null);

    const text = sessionStorage.getItem("saral_document_text");
    if (!text) {
      setError("No document found. Please go back and paste a document first.");
      setLoading(false);
      return;
    }

    fetch("/api/simplify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Something went wrong. Please try again.");
        } else {
          setResult(data as SimplifyResult);
        }
      })
      .catch(() => {
        setError("Could not connect to the server. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f8] pt-24">
        <div className="max-w-[720px] mx-auto px-5 flex flex-col items-center justify-center">
           <div className="w-10 h-10 border-[3px] border-[#2b5a3f]/20 border-t-[#2b5a3f] animate-spin rounded-full mb-6" />
           <div className="text-[15px] font-medium text-gray-500">Simplifying your document...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f9f8] pt-24">
        <div className="max-w-[720px] mx-auto px-5 text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-[20px] font-bold mb-4 text-gray-900">Something went wrong</h2>
          <p className="text-[15px] text-gray-500 mb-8 max-w-[400px] mx-auto leading-relaxed">{error}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleRetry} className="px-8 py-3 bg-[#2b5a3f] text-[15px] text-white font-medium rounded-full hover:bg-[#224732] transition-colors shadow-sm">
              Try Again
            </button>
            <button onClick={() => router.push("/")} className="px-8 py-3 bg-white border border-gray-200 text-[15px] text-gray-700 font-medium rounded-full hover:bg-gray-50 transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-12 pb-24">
      <div className="max-w-[720px] mx-auto px-5">
        
        {/* About Section */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-4">
            WHAT THIS DOCUMENT IS ABOUT
          </div>
          <p className="text-[18px] sm:text-[20px] leading-[1.7] text-gray-800 mb-10">
            {result.summary}
          </p>
        </div>

        {/* Eligibility Card */}
        <div className="bg-[#2b5a3f] rounded-[24px] p-8 sm:p-10 mb-14 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[13px] text-white/80 font-medium">
              ✓
            </div>
            <div className="text-[13px] font-bold tracking-[1.5px] uppercase text-[#86c596]">
              YOU'RE LIKELY ELIGIBLE
            </div>
          </div>
          <p className="text-[18px] sm:text-[20px] leading-[1.7] text-white m-0">
            {result.eligibility}
          </p>
        </div>

        {/* Next Steps Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <div className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-4">
            WHAT TO DO NEXT
          </div>
          
          <div className="bg-white rounded-[24px] shadow-[0_1px_3px_rgba(31,42,36,0.05),0_1px_2px_rgba(31,42,36,0.04)] border border-gray-100 overflow-hidden mb-8">
            {result.documentsNeeded.map((doc, idx) => (
               <div key={`doc-${idx}`} className="flex items-start gap-5 p-6 sm:px-8 border-b border-gray-100">
                 <div className="w-[36px] h-[36px] rounded-full bg-[#e8f2ec] text-[#2b5a3f] text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                   {idx + 1}
                 </div>
                 <div className="flex-1 pt-1">
                   <div className="text-[16px] font-semibold text-gray-900 mb-1.5">Get your {doc.toLowerCase()}</div>
                   <div className="text-[14px] text-gray-500 leading-relaxed">Make sure this document is ready and up to date.</div>
                 </div>
               </div>
            ))}

            {result.nextSteps.map((step, idx) => {
              const num = result.documentsNeeded.length + idx + 1;
              const isWarning = step.title.toLowerCase().includes('deadline') || 
                                step.title.toLowerCase().includes('within') || 
                                step.title.toLowerCase().includes('submit by');
              
              return (
                <div key={`step-${idx}`} className={`flex items-start gap-5 p-6 sm:px-8 border-b border-gray-100 last:border-0 transition-colors ${isWarning ? 'bg-[#fff8ee]' : ''}`}>
                  <div className={`w-[36px] h-[36px] rounded-full text-[15px] font-bold flex items-center justify-center shrink-0 mt-0.5 ${isWarning ? 'bg-[#faebd5] text-[#b47116]' : 'bg-[#e8f2ec] text-[#2b5a3f]'}`}>
                    {isWarning ? <Clock size={16} strokeWidth={2.5} /> : num}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={`text-[16px] font-semibold mb-1.5 ${isWarning ? 'text-[#85510c]' : 'text-gray-900'}`}>{step.title}</div>
                    <div className={`text-[14px] leading-relaxed ${isWarning ? 'text-[#a36715]' : 'text-gray-500'}`}>{step.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-4.5 bg-white border border-gray-200 rounded-[20px] text-[15px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <span className="text-lg">A</span> Translate
            </button>
            <button className="flex items-center justify-center gap-2 py-4.5 bg-white border border-gray-200 rounded-[20px] text-[15px] font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <span className="text-lg">🔊</span> Read aloud
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
