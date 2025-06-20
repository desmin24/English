import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Sender, VocabularyEntry, WordTeachingData, WordTeachingData as TeachingInfo } from './types'; // WordTeachingData is TeachingInfo
import { VOCABULARY_LIST, BOT_NAME } from './constants';
import { generateWordTeachingDetails, evaluateStudentResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isBotLoading, setIsBotLoading] = useState<boolean>(false); // Specific for bot thinking
  const [currentWordForFeedback, setCurrentWordForFeedback] = useState<string | null>(null);
  const [currentVocabIndex, setCurrentVocabIndex] = useState<number>(-1); // Start at -1 to load first word on "next"
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const addMessageToList = useCallback((sender: Sender, content: Partial<Omit<Message, 'id' | 'sender' | 'timestamp'>>) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(), 
        sender,
        timestamp: Date.now(),
        ...content,
      },
    ]);
  }, []);
  
  useEffect(() => {
    addMessageToList(Sender.Bot, {
      text: `哈囉，我是最活潑的 ${BOT_NAME}！準備好跟我一起開開心心學英文了嗎？ ✨ \n請輸入你想學的英文單字，或者按「下一個單字」讓我來給你驚喜吧！ 👇`,
      isGreeting: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teachWord = useCallback(async (wordEntity: VocabularyEntry | { english: string; chinese: string; isCore: boolean }) => {
    setIsBotLoading(true);
    setCurrentWordForFeedback(null); 
    
    // Remove previous loading message if any, before adding a new one
    setMessages(prev => prev.filter(m => !m.isLoading));
    addMessageToList(Sender.Bot, { isLoading: true });

    const englishWord = wordEntity.english;
    const chineseMeaning = wordEntity.chinese;
    const isCoreVocab = 'id' in wordEntity ? true : (wordEntity as {isCore: boolean}).isCore;

    try {
      const teachingDetails = await generateWordTeachingDetails(englishWord, chineseMeaning);
      setMessages(prev => prev.filter(m => !m.isLoading)); 

      const cardData: TeachingInfo = {
        english: englishWord,
        chineseCoreMeaning: chineseMeaning,
        ...teachingDetails,
        isCoreVocab: isCoreVocab,
      };
      addMessageToList(Sender.Bot, { teachingCard: cardData });
      setCurrentWordForFeedback(englishWord); 
    } catch (error) {
      setMessages(prev => prev.filter(m => !m.isLoading));
      addMessageToList(Sender.Bot, { text: (error as Error).message, isError: true });
    } finally {
      setIsBotLoading(false);
    }
  }, [addMessageToList]);

  const handleUserSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isBotLoading) return;

    addMessageToList(Sender.User, { text: trimmedInput });
    setUserInput('');
    setIsBotLoading(true);

    if (currentWordForFeedback) { 
      try {
        setMessages(prev => prev.filter(m => !m.isLoading)); // Clean up existing loading bubbles
        addMessageToList(Sender.Bot, { isLoading: true });
        const feedbackResult = await evaluateStudentResponse(currentWordForFeedback, trimmedInput);
        setMessages(prev => prev.filter(m => !m.isLoading));
        addMessageToList(Sender.Bot, { text: feedbackResult.feedbackText });
        addMessageToList(Sender.Bot, { text: "超棒的！準備好學下一個單字，還是想試試別的呢？可以按「下一個單字」或輸入你想學的字喔！" });
      } catch (error) {
        setMessages(prev => prev.filter(m => !m.isLoading));
        addMessageToList(Sender.Bot, { text: (error as Error).message, isError: true });
      } finally {
        setCurrentWordForFeedback(null); 
        setIsBotLoading(false);
      }
    } else { 
      const foundInList = VOCABULARY_LIST.find(v => v.english.toLowerCase() === trimmedInput.toLowerCase());
      if (foundInList) {
        await teachWord(foundInList);
      } else {
        // addMessageToList(Sender.Bot, { 
        //     text: `「${trimmedInput}」嗎？這不是國中基本1200字裡面的單字耶，不過沒關係，挑戰一下也很棒！💪 我們來看看這個字吧！` 
        // });
        // The above message is now part of the teachingCard if not core vocab
        await teachWord({ english: trimmedInput, chinese: "(由你提供的單字)", isCore: false });
      }
    }
  };
  
  const handleNextWord = () => {
    if (isBotLoading) return; 
    const nextIdx = (currentVocabIndex + 1) % VOCABULARY_LIST.length;
    setCurrentVocabIndex(nextIdx);
    teachWord(VOCABULARY_LIST[nextIdx]);
  };
  
  const isApiKeyMissing = !process.env.API_KEY;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100">
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow-md text-center sticky top-0 z-10">
        <h1 className="text-2xl font-bold">{BOT_NAME} - 開心學英文！</h1>
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-2 chat-scrollbar">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 bg-white border-t border-gray-200 shadow-top sticky bottom-0 z-10">
        <form onSubmit={handleUserSubmit} className="flex gap-2 items-center">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isBotLoading ? "小雅老師思考中..." : (currentWordForFeedback ? "請回答或造句..." : "輸入單字或訊息...")}
            className="flex-grow p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent outline-none transition-shadow disabled:bg-gray-100"
            disabled={isBotLoading || isApiKeyMissing}
          />
          <button 
            type="submit"
            className="px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-50 transition-colors disabled:opacity-50"
            disabled={isBotLoading || isApiKeyMissing || !userInput.trim()}
          >
            送出
          </button>
          <button 
            type="button"
            onClick={handleNextWord}
            className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 transition-colors disabled:opacity-50"
            disabled={isBotLoading || isApiKeyMissing}
          >
            下一個單字
          </button>
        </form>
         {isApiKeyMissing && (
           <p className="text-xs text-red-600 mt-2 text-center font-semibold">
             ⚠️ 注意：Gemini API 金鑰未設定。應用程式功能將受限。請洽管理員設定 API 金鑰。
           </p>
        )}
      </footer>
    </div>
  );
};

export default App;
