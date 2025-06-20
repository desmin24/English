import React from 'react';
import { Message, Sender } from '../types';
import { BOT_NAME } from '../constants';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.sender === Sender.Bot;

  const botAvatar = (
    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-bold mr-2 flex-shrink-0">
      雅
    </div>
  );

  const userAvatar = (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold ml-2 flex-shrink-0">
      你
    </div>
  );

  const handleSpeak = (textToSpeak: string, lang: string = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang;
      
      // Attempt to find a suitable English voice
      const voices = window.speechSynthesis.getVoices();
      let desiredVoice = voices.find(voice => voice.lang === lang && voice.localService);
      if (!desiredVoice) {
        desiredVoice = voices.find(voice => voice.lang === lang);
      }
      if (!desiredVoice) {
        desiredVoice = voices.find(voice => voice.lang.startsWith('en-') && voice.localService);
      }
      if (!desiredVoice) {
        desiredVoice = voices.find(voice => voice.lang.startsWith('en-'));
      }
      if (desiredVoice) {
        utterance.voice = desiredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-speech not supported in this browser.");
      // Optionally, provide UI feedback if TTS is not supported
      alert("抱歉，您的瀏覽器不支援語音朗讀功能。");
    }
  };
  
  // Ensure voices are loaded for selection, especially on some browsers
  if ('speechSynthesis' in window && window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices loaded, no explicit action needed here unless re-triggering speech post-load
    };
  }


  if (message.isLoading) {
    return (
      <div className="flex items-center self-start my-2">
        {botAvatar}
        <div className="bg-white rounded-lg p-3 shadow animate-pulse">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-pink-600 mr-2"></div>
            <p className="text-gray-700">正在施展魔法，請稍候...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (message.isError) {
    return (
       <div className={`flex my-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
        {isBot && botAvatar}
        <div className={`max-w-xl p-3 rounded-lg shadow ${isBot ? 'bg-red-100 text-red-700' : 'bg-red-500 text-white'}`}>
          <p className="font-semibold">{isBot ? BOT_NAME : '你'}:</p>
          <p>{message.text || '發生錯誤'}</p>
        </div>
        {!isBot && userAvatar}
      </div>
    );
  }


  if (message.teachingCard) {
    const card = message.teachingCard;
    return (
      <div className="flex self-start my-2 w-full md:max-w-2xl"> {/* Adjusted width for better readability */}
        {botAvatar}
        <div className="bg-gradient-to-br from-pink-400 to-purple-500 text-white rounded-xl p-4 shadow-lg w-full">
          <h3 className="text-xl font-bold mb-2 flex items-center">
            🎯 今天的單字：<span className="text-yellow-300 underline">{card.english}</span>
            <button
              onClick={() => handleSpeak(card.english)}
              className="ml-2 p-1 rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors text-xl"
              aria-label={`Pronounce the word ${card.english}`}
            >
              🔊
            </button>
          </h3>
          {!card.isCoreVocab && (
            <p className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded mb-3 inline-block font-semibold">
              🔔 小提醒：這不是國中基本1200字喔，但挑戰一下也很棒！
            </p>
          )}
          <div className="space-y-1 text-sm md:text-base"> {/* Responsive text size */}
            <p><strong className="font-semibold">📌 詞性：</strong>{card.partOfSpeech}</p>
            <p><strong className="font-semibold">📘 中文解釋：</strong>{card.chineseCoreMeaning}</p>
            <p><strong className="font-semibold">📗 英文例句：</strong>
                {card.exampleSentence}
                <button
                    onClick={() => handleSpeak(card.exampleSentence)}
                    className="ml-2 p-1 rounded-full hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors text-xl relative top-1"
                    aria-label={`Listen to the example sentence: ${card.exampleSentence}`}
                >
                    🔊
                </button>
            </p>
            <p><strong className="font-semibold">📙 中文翻譯：</strong>{card.exampleSentenceTranslation}</p>
            <p className="mt-2"><strong className="font-semibold">🗣️ 跟讀練習：</strong>請大聲跟我念一次例句～ <em className="italic">"{card.exampleSentence}"</em></p>
            <p className="mt-3 p-3 bg-white/25 rounded-md"><strong className="font-semibold">💬 小挑戰：</strong>{card.challengePrompt}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Default text message
  return (
    <div className={`flex my-2 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && botAvatar}
      <div className={`max-w-xl px-4 py-3 rounded-2xl shadow ${
          isBot 
            ? (message.isGreeting ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white' : 'bg-white text-gray-800') 
            : 'bg-blue-600 text-white' // Slightly different blue for user
        } ${isBot ? 'rounded-bl-none' : 'rounded-br-none'}`}
      >
        <p className={`font-semibold mb-1 ${isBot && !message.isGreeting ? 'text-pink-600' : (isBot && message.isGreeting ? 'text-white' : 'text-blue-200')}`}>{isBot ? BOT_NAME : '你'}:</p>
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      {!isBot && userAvatar}
    </div>
  );
};

export default ChatMessage;