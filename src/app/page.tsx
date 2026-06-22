"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Home, Landmark, AlertCircle } from "lucide-react";
import exampleDocs from "@root/data/exampleDocs.json";
import type { ExampleDocument } from "@root/types/index";

const examples: ExampleDocument[] = exampleDocs;

export default function HomePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState("paste");
  const router = useRouter();

  const handleSimplify = async () => {
    if (!text.trim()) {
      setErrorMsg("Please paste some document text first.");
      return;
    }
    setErrorMsg("");
    setLoading(true);
    sessionStorage.setItem("saral_document_text", text.trim());
    router.push("/result");
  };

  const handleExample = (doc: ExampleDocument) => {
    setText(doc.text);
    setErrorMsg("");
    const textarea = document.getElementById("document-input");
    if (textarea) {
      textarea.scrollIntoView({ behavior: "smooth", block: "center" });
      textarea.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8]">
      {/* ---------------- DARK HERO SECTION ---------------- */}
      <section className="bg-[#1e2721] pt-10 pb-12 px-6 relative flex flex-col items-center">
        <div className="w-full max-w-[960px] mx-auto text-center flex flex-col items-center">
          
          <div className="text-[#568a64] text-[12px] font-bold tracking-[2.5px] uppercase mb-6">
            THE NOTICE, LINE BY LINE
          </div>
          
          <div className="text-[17px] sm:text-[19px] leading-[1.8] text-gray-300 text-left mb-8 font-serif w-full max-w-[860px] mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
            Pursuant to clause 4(b) of Notification No. SJ/2024/0091, applicants seeking 
            provisional disbursement shall furnish <span className="bg-[#24422b] text-[#86c596] font-sans font-medium px-2 py-0.5 rounded">documentary evidence of domicile</span>, <span className="bg-[#24422b] text-[#86c596] font-sans font-medium px-2 py-0.5 rounded">income 
            certification not exceeding twelve months' validity</span>, and an attested affidavit <span className="bg-[#4a391c] text-[#d6aa65] font-sans font-medium px-2 py-0.5 rounded">within 
            thirty days of issuance</span>, failing which the application shall stand <span className="bg-[#4d2525] text-[#d67b7b] font-sans font-medium px-2 py-0.5 rounded">summarily 
            rejected without further recourse</span>.
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-[#253229] px-4 py-2 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#54a065]"></div>
              <span className="text-[13px] text-gray-400">documents needed</span>
            </div>
            <div className="flex items-center gap-2 bg-[#253229] px-4 py-2 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c48e42]"></div>
              <span className="text-[13px] text-gray-400">your deadline</span>
            </div>
            <div className="flex items-center gap-2 bg-[#253229] px-4 py-2 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#c45252]"></div>
              <span className="text-[13px] text-gray-400">what happens if you miss it</span>
            </div>
          </div>

          <div className="w-full max-w-[860px] mx-auto h-px bg-white/10 my-8"></div>

          <h2 className="text-[28px] sm:text-[34px] font-bold text-white leading-[1.3] mb-3 max-w-[760px] mx-auto">
            Bring proof of address and an income certificate within 30 days, or the application is rejected.
          </h2>
          <p className="text-[15px] sm:text-[17px] text-gray-400 m-0">
            That's the whole notice. Saral reads every document like this.
          </p>

        </div>
      </section>

      {/* ---------------- LIGHT INPUT SECTION ---------------- */}
      <section className="bg-[#f7f9f8] pt-10 pb-16 px-6">
        <div className="w-full max-w-[960px] mx-auto flex flex-col">
          
          <div className="text-[15px] sm:text-[17px] text-gray-500 text-center mb-4">
            Paste your own document below, or upload a photo or PDF
          </div>

          <div className="bg-white rounded-[24px] p-2.5 shadow-[0_1px_3px_rgba(31,42,36,0.05),0_1px_2px_rgba(31,42,36,0.04)] mb-2 relative">
            <div className="flex items-center bg-[#f7f9f8] rounded-[20px] p-1.5 mb-3 border border-gray-50">
              <button 
                type="button"
                className={`flex-1 py-3 text-[15px] font-semibold transition-all rounded-[16px] ${
                  activeTab === "paste" 
                    ? "bg-[#2b5a3f] text-white shadow-sm" 
                    : "bg-transparent text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setActiveTab("paste")}
              >
                Paste text
              </button>
              <button 
                type="button"
                className={`flex-1 py-3 text-[15px] font-semibold transition-all rounded-[16px] ${
                  activeTab === "upload" 
                    ? "bg-[#2b5a3f] text-white shadow-sm" 
                    : "bg-transparent text-gray-400 hover:text-gray-600"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                Upload file
              </button>
            </div>

            <textarea
              id="document-input"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Paste the text from any government notice, letter, or form..."
              className="w-full h-[150px] p-5 text-[15px] sm:text-[16px] leading-relaxed text-gray-800 bg-transparent resize-none outline-none placeholder:text-gray-400"
            ></textarea>
          </div>

          {/* Validation Error Message */}
          <div className="h-6 flex justify-center mb-2">
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-[#d64c4c] text-[13px] font-medium animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={handleSimplify}
              disabled={loading}
              className="inline-flex items-center justify-center gap-3 px-12 py-4 bg-[#2b5a3f] text-white text-[16px] font-semibold rounded-full shadow-sm hover:bg-[#224732] transition-colors disabled:opacity-90 disabled:cursor-wait"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Simplifying...
                </>
              ) : (
                <>
                  <span className="opacity-80 text-[14px]">☐</span> Simplify this
                </>
              )}
            </button>
            <div className="text-[13px] text-gray-400 mt-2">
              No sign-up · nothing is stored
            </div>
          </div>

          {/* Examples Grid */}
          <div className="mt-10">
            <div className="text-[15px] font-medium text-gray-500 text-center mb-4">
              Or try an example
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {examples.map((doc, idx) => {
                const isSelected = text === doc.text;
                
                let IconComponent = GraduationCap;
                if (idx === 1) IconComponent = Home;
                if (idx === 2) IconComponent = Landmark;

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleExample(doc)}
                    className={`p-5 rounded-[16px] text-left transition-all shadow-[0_1px_3px_rgba(31,42,36,0.05),0_1px_2px_rgba(31,42,36,0.04)] ${
                      isSelected 
                        ? "bg-[#2D6B45] text-white" 
                        : "bg-white text-gray-800 hover:shadow-md"
                    }`}
                  >
                    <div className="mb-4">
                      <IconComponent 
                        size={22} 
                        color={isSelected ? "#C0DD97" : "#8ea896"} 
                        strokeWidth={2}
                      />
                    </div>
                    <div className={`font-semibold text-[16px] mb-1.5 ${isSelected ? "text-white" : "text-gray-800"}`}>
                      {doc.title}
                    </div>
                    <div className={`text-[14px] leading-relaxed ${isSelected ? "text-white/70" : "text-gray-400"}`}>
                      {doc.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
