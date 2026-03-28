import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Volume2, VolumeX, Bot, Mic, MicOff, X } from "lucide-react";

const API_BASE = import.meta.env.VITE_CHATBOT_URL || "http://localhost:8000";

// Site theme colors
const COLORS = {
  PRIMARY_BLUE: "#4F46E5",
  DEEP_INDIGO: "#3730A3",
  LIGHT_BLUE: "#E0E7FF",
  WHITE: "#FFFFFF",
  GRAY_LIGHT: "#F3F4F6",
  GRAY_MEDIUM: "#9CA3AF",
  GRAY_DARK: "#6B7280",
  BLACK: "#111827",
};

const FloatingInstituteChatbot = ({ instituteData }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [chatbotContext, setChatbotContext] = useState("");

  // Typewriter effect
  const typingTimeoutRef = useRef(null);

  // TTS
  const [speakingIndex, setSpeakingIndex] = useState(null);

  // STT (voice input)
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Ref for auto-scroll
  const messagesEndRef = useRef(null);

  // Ref for click outside detection
  const chatContainerRef = useRef(null);

  const toggleChat = () => setIsChatOpen((prev) => !prev);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loadingChat, isChatOpen]);

  // Click outside to close chatbot
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isChatOpen && chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        // Check if click is not on the toggle button
        const toggleButton = document.querySelector('[data-chatbot-toggle]');
        if (toggleButton && !toggleButton.contains(event.target)) {
          setIsChatOpen(false);
        }
      }
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isChatOpen]);

  // Initialize chatbot with institute data
  useEffect(() => {
    console.log("FloatingInstituteChatbot: Received instituteData:", instituteData);
    if (instituteData) {
      // Create a comprehensive context for the chatbot
      const context = createInstituteContext(instituteData);
      console.log("FloatingInstituteChatbot: Generated context:", context);
      setChatbotContext(context);

      // Add welcome message
      setMessages([
        {
          id: 1,
          role: "assistant",
          text: `Hello! 👋 I'm SARTHI, your educational assistant. I can help you analyze data for ${instituteData.instituteName || instituteData.name || "this institute"}.`,
        },
      ]);
    } else {
      console.log("FloatingInstituteChatbot: No instituteData received");
    }
  }, [instituteData]);

  const createInstituteContext = (data) => {
    // Match the backend formatting logic exactly
    let context = "Institute Analysis Context:\n\n";

    // Debug: log the entire data structure
    console.log("FloatingInstituteChatbot: Raw instituteData for context creation:", data);

    // Helper function to format rupees to crores
    const formatCr = (value) => {
      if (value === undefined || value === null) return "N/A";
      return (value / 10000000).toFixed(2); // 1 Cr = 1,00,00,000
    };

    // Basic institute info
    const instituteName = data.instituteName || data.name || "Unknown Institute";
    const instituteType = data.instituteType || data.type || "Unknown";
    const location = data.location || "Unknown";
    const instituteId = data.instituteId || "Unknown";
    const status = data.status || "Active";
    const completenessScore = data.completenessScore || 0;
    const isVerified = data.isVerified ? "Yes" : "No";

    context += `INSTITUTE: ${instituteName}\n`;
    context += `INSTITUTE ID: ${instituteId}\n`;
    context += `TYPE: ${instituteType}\n`;
    context += `LOCATION: ${location}\n`;
    context += `STATUS: ${status}\n`;
    context += `COMPLETENESS SCORE: ${completenessScore}%\n`;
    context += `VERIFIED: ${isVerified}\n\n`;

    // Check if we have insights data (analytics from the page)
    if (data.insightsData) {
      console.log("FloatingInstituteChatbot: Found insights data:", data.insightsData);
      context += `ANALYTICS DATA AVAILABLE:\n\n`;

      // Capital vs Operational data
      if (data.insightsData.capVsOpByYear && data.insightsData.capVsOpByYear.length > 0) {
        context += `CAPITAL VS OPERATIONAL EXPENDITURE BY YEAR:\n`;
        data.insightsData.capVsOpByYear.forEach(yearData => {
          context += `Year ${yearData.year}:\n`;
          if (yearData.capital !== undefined) {
            context += `  Capital Expenditure: ₹${formatCr(yearData.capital)} Cr\n`;
          }
          if (yearData.operational !== undefined) {
            context += `  Operational Expenditure: ₹${formatCr(yearData.operational)} Cr\n`;
          }
          if (yearData.capital && yearData.operational) {
            const total = yearData.capital + yearData.operational;
            context += `  Total Expenditure: ₹${formatCr(total)} Cr\n`;
          }
        });
        context += `\n`;
      }

      // Capital breakdown by year
      if (data.insightsData.capitalByYear && data.insightsData.capitalByYear.length > 0) {
        context += `CAPITAL EXPENDITURE BREAKDOWN BY CATEGORY:\n`;
        data.insightsData.capitalByYear.forEach(yearData => {
          context += `Year ${yearData.year}:\n`;
          if (yearData.library !== undefined) context += `  Library: ₹${formatCr(yearData.library)} Cr\n`;
          if (yearData.labs !== undefined) context += `  Labs: ₹${formatCr(yearData.labs)} Cr\n`;
          if (yearData.workshops !== undefined) context += `  Workshops: ₹${formatCr(yearData.workshops)} Cr\n`;
          if (yearData.otherAssets !== undefined) context += `  Other Assets: ₹${formatCr(yearData.otherAssets)} Cr\n`;
        });
        context += `\n`;
      }

      // Operational breakdown by year
      if (data.insightsData.operationalByYear && data.insightsData.operationalByYear.length > 0) {
        context += `OPERATIONAL EXPENDITURE BREAKDOWN:\n`;
        data.insightsData.operationalByYear.forEach(yearData => {
          context += `Year ${yearData.year}:\n`;
          if (yearData.salaries !== undefined) context += `  Salaries: ₹${formatCr(yearData.salaries)} Cr\n`;
          if (yearData.maintenance !== undefined) context += `  Maintenance: ₹${formatCr(yearData.maintenance)} Cr\n`;
        });
        context += `\n`;
      }

      // 2023 breakdown (if available)
      if (data.insightsData.capital2023Breakdown && data.insightsData.capital2023Breakdown.length > 0) {
        context += `2023-24 CAPITAL EXPENDITURE COMPOSITION:\n`;
        data.insightsData.capital2023Breakdown.forEach(item => {
          context += `  ${item.name}: ₹${formatCr(item.value)} Cr\n`;
        });
        context += `\n`;
      }

      // Add trend analysis and predictions
      if (data.insightsData.capVsOpByYear && data.insightsData.capVsOpByYear.length >= 2) {
        context += `TREND ANALYSIS & PREDICTIONS:\n`;

        const years = data.insightsData.capVsOpByYear;
        const latestYear = years[years.length - 1];
        const previousYear = years[years.length - 2];

        // Calculate growth rates
        if (latestYear.capital && previousYear.capital) {
          const capitalGrowth = ((latestYear.capital - previousYear.capital) / previousYear.capital * 100).toFixed(1);
          context += `Capital Expenditure Trend: ${capitalGrowth > 0 ? 'Increasing' : 'Decreasing'} by ${Math.abs(capitalGrowth)}% year-over-year\n`;

          // Simple prediction for next year
          const predictedCapital = latestYear.capital * (1 + parseFloat(capitalGrowth) / 100);
          context += `Predicted Capital Expenditure (next year): ₹${formatCr(predictedCapital)} Cr\n`;
        }

        if (latestYear.operational && previousYear.operational) {
          const opGrowth = ((latestYear.operational - previousYear.operational) / previousYear.operational * 100).toFixed(1);
          context += `Operational Expenditure Trend: ${opGrowth > 0 ? 'Increasing' : 'Decreasing'} by ${Math.abs(opGrowth)}% year-over-year\n`;

          // Simple prediction for next year
          const predictedOp = latestYear.operational * (1 + parseFloat(opGrowth) / 100);
          context += `Predicted Operational Expenditure (next year): ₹${formatCr(predictedOp)} Cr\n`;
        }

        const totalCurrent = (latestYear.capital || 0) + (latestYear.operational || 0);
        const totalPrevious = (previousYear.capital || 0) + (previousYear.operational || 0);
        if (totalCurrent && totalPrevious) {
          const totalGrowth = ((totalCurrent - totalPrevious) / totalPrevious * 100).toFixed(1);
          context += `Total Expenditure Trend: ${totalGrowth > 0 ? 'Increasing' : 'Decreasing'} by ${Math.abs(totalGrowth)}% year-over-year\n`;

          const predictedTotal = totalCurrent * (1 + parseFloat(totalGrowth) / 100);
          context += `Predicted Total Expenditure (next year): ₹${formatCr(predictedTotal)} Cr\n`;
        }

        context += `\n`;
      }
    }

    // Fallback: Handle nested data structure from backend (if available)
    const latestData = data.latestData || data;
    if (latestData && typeof latestData === 'object' && !data.insightsData) {
      const academicYear = latestData.academicYear || latestData.year || "N/A";
      context += `LATEST DATA (Academic Year: ${academicYear}):\n`;

      // Handle nested data structure from backend
      const rawData = latestData.rawExtractedData || latestData;

      // Student data
      if (rawData.studentStrength) {
        context += `\nSTUDENT INFORMATION:\n`;
        if (rawData.studentStrength.totalStudents !== undefined) {
          context += `Total Students: ${rawData.studentStrength.totalStudents}\n`;
        }
        if (rawData.studentStrength.maleStudents !== undefined) {
          context += `Male Students: ${rawData.studentStrength.maleStudents}\n`;
        }
        if (rawData.studentStrength.femaleStudents !== undefined) {
          context += `Female Students: ${rawData.studentStrength.femaleStudents}\n`;
        }
      }

      // Faculty data
      if (rawData.facultyDetails) {
        context += `\nFACULTY INFORMATION:\n`;
        if (rawData.facultyDetails.totalFaculty !== undefined) {
          context += `Total Faculty: ${rawData.facultyDetails.totalFaculty}\n`;
        }
        if (rawData.facultyDetails.professors !== undefined) {
          context += `Professors: ${rawData.facultyDetails.professors}\n`;
        }
        if (rawData.facultyDetails.associateProfessors !== undefined) {
          context += `Associate Professors: ${rawData.facultyDetails.associateProfessors}\n`;
        }
        if (rawData.facultyDetails.assistantProfessors !== undefined) {
          context += `Assistant Professors: ${rawData.facultyDetails.assistantProfessors}\n`;
        }
      }

      // Financial data
      if (rawData.financialResources) {
        context += `\nFINANCIAL INFORMATION:\n`;
        if (rawData.financialResources.capitalExpenditure !== undefined) {
          context += `Capital Expenditure: ₹${rawData.financialResources.capitalExpenditure}\n`;
        }
        if (rawData.financialResources.operationalExpenditure !== undefined) {
          context += `Operational Expenditure: ₹${rawData.financialResources.operationalExpenditure}\n`;
        }
        const total = (rawData.financialResources.capitalExpenditure || 0) +
          (rawData.financialResources.operationalExpenditure || 0);
        if (total > 0) {
          context += `Total Expenditure: ₹${total}\n`;
        }
      }

      // Placement data
      if (rawData.placementHigherStudy) {
        context += `\nPLACEMENT & HIGHER STUDIES:\n`;
        if (rawData.placementHigherStudy.studentsPlaced !== undefined) {
          context += `Students Placed: ${rawData.placementHigherStudy.studentsPlaced}\n`;
        }
        if (rawData.placementHigherStudy.medianSalary !== undefined) {
          context += `Median Salary: ₹${rawData.placementHigherStudy.medianSalary}\n`;
        }
        if (rawData.placementHigherStudy.higherStudies !== undefined) {
          context += `Students in Higher Studies: ${rawData.placementHigherStudy.higherStudies}\n`;
        }
      }

      // Research data
      if (rawData.sponsoredResearch) {
        context += `\nRESEARCH INFORMATION:\n`;
        if (rawData.sponsoredResearch.totalProjects !== undefined) {
          context += `Total Research Projects: ${rawData.sponsoredResearch.totalProjects}\n`;
        }
        if (rawData.sponsoredResearch.totalAmount !== undefined) {
          context += `Total Research Funding: ₹${rawData.sponsoredResearch.totalAmount}\n`;
        }
      }

      // PhD data
      if (rawData.phdStudents) {
        context += `\nPHD STUDENTS:\n`;
        if (rawData.phdStudents.totalPhDStudents !== undefined) {
          context += `Total PhD Students: ${rawData.phdStudents.totalPhDStudents}\n`;
        }
      }

      // Sanctioned intake
      if (rawData.sanctionedIntake) {
        context += `\nSANCTIONED INTAKE:\n`;
        if (rawData.sanctionedIntake.totalIntake !== undefined) {
          context += `Total Sanctioned Intake: ${rawData.sanctionedIntake.totalIntake}\n`;
        }
      }

      // Fallback for flat structure (if data is not nested)
      if (!rawData.studentStrength && !rawData.facultyDetails && !rawData.financialResources) {
        context += `\nADDITIONAL DATA:\n`;

        // Check for flat fields
        if (latestData.placementPercentage !== undefined) {
          context += `Placement Percentage: ${latestData.placementPercentage}%\n`;
        }
        if (latestData.financialCapacity !== undefined) {
          context += `Financial Capacity: ₹${latestData.financialCapacity}\n`;
        }
        if (latestData.teacherStudentRatio !== undefined) {
          context += `Teacher-Student Ratio: ${latestData.teacherStudentRatio}\n`;
        }
        if (latestData.facultyStrength !== undefined) {
          context += `Faculty Strength: ${latestData.facultyStrength}\n`;
        }
      }
    }

    // If no data at all
    if (!data.insightsData && !latestData) {
      context += `No detailed data available for this institute.\n`;
    }

    console.log("FloatingInstituteChatbot: Created context with length:", context.length);
    console.log("FloatingInstituteChatbot: Context preview:", context.substring(0, 500) + "...");
    return context;
  };

  // Typewriter effect for assistant response
  const typeAssistantMessage = (fullText) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Add empty assistant message first
    setMessages((prev) => [...prev, { role: "assistant", text: "" }]);

    let index = 0;

    const step = () => {
      index += 2; // chars per step (speed)
      const currentText = fullText.slice(0, index);

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            text: currentText,
          };
        }
        return newMessages;
      });

      if (index < fullText.length) {
        typingTimeoutRef.current = setTimeout(step, 15);
      }
    };

    step();
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question) return;

    // stop old typing + speech when new query starts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIndex(null);

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");

    try {
      setLoadingChat(true);

      // Log what we're sending
      console.log("FloatingInstituteChatbot: Sending request to chatbot backend:", {
        question,
        contextLength: chatbotContext?.length,
        contextPreview: chatbotContext?.substring(0, 200) + "..."
      });

      // Send question and context separately as expected by the backend
      const res = await axios.post(`${API_BASE}/api/v1/chat`, {
        question: question,
        context: chatbotContext
      });

      console.log("FloatingInstituteChatbot: Received response:", res.data);

      const answerText = res.data.answer || "No answer received from server.";

      setLoadingChat(false);

      // Animate assistant reply
      typeAssistantMessage(answerText);
    } catch (err) {
      console.error("FloatingInstituteChatbot: Error sending request:", err);
      setLoadingChat(false);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ Error contacting chatbot server. Please make sure the chatbot backend is running on port 8000." },
      ]);
    }
  };

  const onEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loadingChat) handleSend();
    }
  };

  // ---------- TEXT TO SPEECH (TTS) ----------
  const handleSpeak = (index, text) => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    // If this message already speaking → stop it
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setSpeakingIndex((prev) => (prev === index ? null : prev));
    };
    utterance.onerror = () => {
      setSpeakingIndex(null);
    };

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // ---------- VOICE INPUT (STT) ----------
  const initRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    return recognition;
  };

  const startListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    let recognition = recognitionRef.current;
    if (!recognition) {
      recognition = initRecognition();
      if (!recognition) return;
      recognitionRef.current = recognition;

      recognition.onresult = (event) => {
        const result = event.results[event.resultIndex];
        if (!result || !result[0]) return;

        const transcript = result[0].transcript.trim();
        if (!transcript) return;

        setInput((prev) =>
          prev.trim().length > 0
            ? `${prev.trim()} ${transcript}`
            : transcript
        );
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Speech recognition start error:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      }
    };
  }, []);

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        data-chatbot-toggle
        className="fixed bottom-6 right-6 bg-primary-blue hover:bg-deep-indigo text-white font-medium px-4 py-3 rounded-full flex items-center gap-2 shadow-lg transition z-40"
        style={{ backgroundColor: COLORS.PRIMARY_BLUE }}
      >
        <Bot className="w-5 h-5" />
        {isChatOpen ? "Close Chat" : "Chat with AI"}
      </button>

      {/* Chat Sidebar */}
      <div
        ref={chatContainerRef}
        className={`fixed top-0 right-0 w-[22vw] min-w-[320px] max-w-md h-screen bg-white border-l border-gray-200 flex flex-col transition-transform duration-300 z-50 shadow-lg ${isChatOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="bg-light-blue rounded-full p-2" style={{ backgroundColor: COLORS.LIGHT_BLUE }}>
              <Bot className="w-5 h-5 text-primary-blue" style={{ color: COLORS.PRIMARY_BLUE }} />
            </div>
            <div>
              <div className="font-semibold text-sm text-gray-900">SARTHI Assistant</div>
              <div className="text-xs text-gray-500">
                Analyzing: {instituteData?.instituteName || instituteData?.name || "Institute Data"}
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={toggleChat}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1.5 transition"
            title="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
          {messages.map((m, i) => {
            const isUser = m.role === "user";
            const isAssistant = m.role === "assistant";

            return (
              <div
                key={i}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative px-3 py-2 rounded-2xl max-w-[90%] text-base ${isUser
                    ? "bg-primary-blue text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                    }`}
                  style={isUser ? { backgroundColor: COLORS.PRIMARY_BLUE } : {}}
                >
                  {m.text}

                  {/* TTS Icon on assistant messages */}
                  {isAssistant && m.text && (
                    <button
                      onClick={() => handleSpeak(i, m.text)}
                      className="absolute -bottom-4 right-1 text-gray-400 hover:text-primary-blue bg-white rounded-full p-1 shadow-sm border border-gray-200 text-xs flex items-center justify-center"
                      title="Read aloud"
                    >
                      {speakingIndex === i ? (
                        <VolumeX className="w-3 h-3" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Three-dot wave typing indicator */}
          {loadingChat && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-2xl bg-white border border-gray-200 rounded-bl-sm inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-bounce [animation-delay:0ms]" style={{ backgroundColor: COLORS.PRIMARY_BLUE }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-bounce [animation-delay:150ms]" style={{ backgroundColor: COLORS.PRIMARY_BLUE }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-blue animate-bounce [animation-delay:300ms]" style={{ backgroundColor: COLORS.PRIMARY_BLUE }} />
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input + Voice Button */}
        <div className="border-t border-gray-200 px-4 py-3 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onEnter}
              placeholder="Type or use mic to ask"
              className="flex-1 bg-gray-50 border border-gray-300 text-sm rounded-lg px-3 py-2 resize-none focus:ring-1 focus:ring-primary-blue focus:border-primary-blue outline-none"
            />

            {/* Mic button for voice input */}
            <button
              onClick={toggleListening}
              className={`rounded-full p-2 border text-sm flex items-center justify-center transition ${isListening
                ? "border-primary-blue bg-light-blue text-primary-blue"
                : "border-gray-300 bg-gray-50 text-gray-500 hover:border-primary-blue hover:text-primary-blue"
                }`}
              title={
                isListening ? "Click to stop listening" : "Click to speak question"
              }
            >
              {isListening ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={loadingChat || !input.trim()}
            className={`w-full mt-3 rounded-md px-4 py-2 text-sm font-semibold ${loadingChat || !input.trim()
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-primary-blue hover:bg-deep-indigo text-white"
              }`}
            style={!(loadingChat || !input.trim()) ? { backgroundColor: COLORS.PRIMARY_BLUE } : {}}
          >
            ➤ Send Message
          </button>

          <p className="mt-2 text-xs text-gray-500">
            Press <span className="font-semibold">Enter</span> to send,{" "}
            <span className="font-semibold">Shift+Enter</span> for new line.
          </p>
        </div>
      </div>
    </>
  );
};

export default FloatingInstituteChatbot;
