"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@root/lib/supabase";
import { FileText, Bookmark, CheckCircle } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import schemesData from "@root/data/schemes.json";

const formatIncomeBand = (band?: string) => {
  if (!band) return "-";
  const map: Record<string, string> = {
    under_1l: "Below ₹1 lakh",
    "1l_2l": "₹1–2 lakh",
    "2l_2_5l": "₹2–2.5 lakh",
    "2_5l_5l": "₹2.5–5 lakh",
    "5l_8l": "₹5–8 lakh",
    above_8l: "Above ₹8 lakh"
  };
  return map[band] || band;
};

const getMatchedSchemeNames = (ids?: string[]) => {
  if (!ids || ids.length === 0) return [];
  return ids.map(id => {
    const scheme = schemesData.find(s => s.id === id);
    return scheme ? scheme.name : id;
  });
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // States for dynamic data
  const [documents, setDocuments] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);

  // Expanded states
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        
        // Fetch user specific data from Supabase
        try {
          const [docsRes, schemesRes, matchesRes] = await Promise.all([
            supabase.from('saved_documents').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
            supabase.from('saved_schemes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
            supabase.from('eligibility_matches').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
          ]);
          
          if (docsRes.data) setDocuments(docsRes.data);
          if (schemesRes.data) setSchemes(schemesRes.data);
          if (matchesRes.data) setMatches(matchesRes.data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkUserAndFetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f8] pt-24">
        <div className="flex justify-center">
          <div className="w-10 h-10 border-[3px] border-[#2b5a3f]/20 border-t-[#2b5a3f] animate-spin rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-12 pb-24 px-5">
      <div className="max-w-[760px] mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[32px] sm:text-[38px] font-bold text-gray-900 leading-tight mb-2">
            Welcome, {capitalizedName}
          </h1>
          <p className="text-[16px] text-gray-500">
            Here's everything you've saved with Saral
          </p>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-5 mb-16">
          
          {/* Recent Documents */}
          <div className="bg-white rounded-[20px] p-7 shadow-[0_1px_3px_rgba(31,42,36,0.05)] border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-[#2b5a3f]" size={20} />
              <h2 className="text-[18px] font-semibold text-gray-900">Recent documents</h2>
            </div>
            {documents.length > 0 ? (
              <div className="space-y-3 pl-8">
                {documents.map((doc, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden transition-all shadow-sm">
                    <button 
                      onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
                      className="w-full text-left text-[15px] font-medium text-gray-800 p-3 hover:bg-gray-50 flex justify-between items-center bg-white"
                    >
                      <span className="truncate">{doc.summary ? doc.summary.substring(0, 50) + "..." : "Saved Document"}</span>
                      <span className="text-gray-400 text-[12px]">{expandedDoc === doc.id ? "▲" : "▼"}</span>
                    </button>
                    {expandedDoc === doc.id && (
                      <div className="p-5 bg-gray-50 border-t border-gray-100 text-[14px] text-gray-600 space-y-4">
                        <div>
                          <h4 className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-1">Summary</h4>
                          <p className="leading-relaxed">{doc.summary}</p>
                        </div>
                        <div>
                          <h4 className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-1">Eligibility</h4>
                          <p className="leading-relaxed">{doc.eligibility}</p>
                        </div>
                        <div>
                          <h4 className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-1">Documents Needed</h4>
                          <ul className="list-disc pl-4 mt-1 space-y-1">
                            {doc.documents_needed?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                          </ul>
                        </div>
                        {doc.next_steps && doc.next_steps.length > 0 && (
                          <div>
                            <h4 className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-1">Next Steps</h4>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                              {doc.next_steps.map((step: any, i: number) => (
                                <li key={i}><strong>{step.title}</strong>: {step.detail}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-gray-400 pl-8">
                Your simplified documents will appear here
              </p>
            )}
          </div>

          {/* Saved Schemes */}
          <div className="bg-white rounded-[20px] p-7 shadow-[0_1px_3px_rgba(31,42,36,0.05)] border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <Bookmark className="text-[#2b5a3f]" size={20} />
              <h2 className="text-[18px] font-semibold text-gray-900">Saved schemes</h2>
            </div>
            {schemes.length > 0 ? (
              <div className="space-y-2 pl-8">
                {schemes.map((scheme, idx) => (
                  <div key={idx} className="text-[15px] font-medium text-gray-800 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                    {scheme.scheme_name || "Untitled Scheme"}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-gray-400 pl-8">
                Schemes you save will appear here
              </p>
            )}
          </div>

          {/* Eligibility Matches */}
          <div className="bg-white rounded-[20px] p-7 shadow-[0_1px_3px_rgba(31,42,36,0.05)] border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-[#2b5a3f]" size={20} />
              <h2 className="text-[18px] font-semibold text-gray-900">Eligibility matches</h2>
            </div>
            {matches.length > 0 ? (
              <div className="space-y-3 pl-8">
                {matches.map((match, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm transition-all">
                    <button 
                      onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                      className="w-full text-left text-[15px] font-medium text-gray-800 p-3 hover:bg-gray-50 flex justify-between items-center bg-white"
                    >
                      <span>Match profile created on {new Date(match.created_at).toLocaleDateString()}</span>
                      <span className="text-gray-400 text-[12px]">{expandedMatch === match.id ? "▲" : "▼"}</span>
                    </button>
                    {expandedMatch === match.id && (
                      <div className="p-5 bg-gray-50 border-t border-gray-100 text-[14px] text-gray-600 space-y-4">
                        <div>
                          <h4 className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-2">Profile Details</h4>
                          <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-gray-100">
                            <div><span className="text-gray-400 text-[12px] uppercase block">Age</span> <span className="font-medium text-gray-800">{match.profile?.age || '-'}</span></div>
                            <div><span className="text-gray-400 text-[12px] uppercase block">State</span> <span className="font-medium text-gray-800">{match.profile?.state || 'All States'}</span></div>
                            <div><span className="text-gray-400 text-[12px] uppercase block">Occupation</span> <span className="font-medium text-gray-800 capitalize">{match.profile?.occupation || '-'}</span></div>
                            <div><span className="text-gray-400 text-[12px] uppercase block">Income</span> <span className="font-medium text-gray-800">{formatIncomeBand(match.profile?.incomeBand)}</span></div>
                            {match.profile?.gender && (
                              <div><span className="text-gray-400 text-[12px] uppercase block">Gender</span> <span className="font-medium text-gray-800 capitalize">{match.profile.gender}</span></div>
                            )}
                            {match.profile?.category && (
                              <div><span className="text-gray-400 text-[12px] uppercase block">Category</span> <span className="font-medium text-gray-800 uppercase">{match.profile.category}</span></div>
                            )}
                            {match.profile?.educationLevel && (
                              <div><span className="text-gray-400 text-[12px] uppercase block">Education</span> <span className="font-medium text-gray-800 capitalize">{match.profile.educationLevel}</span></div>
                            )}
                            {match.profile?.course && (
                              <div><span className="text-gray-400 text-[12px] uppercase block">Course</span> <span className="font-medium text-gray-800 capitalize">{match.profile.course}</span></div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[12px] font-bold tracking-[1.5px] uppercase text-[#568a64] mb-1">Matched Schemes</h4>
                          <ul className="list-disc pl-4 mt-1 space-y-1 text-gray-700 font-medium">
                            {getMatchedSchemeNames(match.matched_scheme_ids).map((name, i) => (
                              <li key={i}>{name}</li>
                            ))}
                            {(!match.matched_scheme_ids || match.matched_scheme_ids.length === 0) && (
                              <li>No schemes matched</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-gray-400 pl-8">
                Your eligibility matches will appear here
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
