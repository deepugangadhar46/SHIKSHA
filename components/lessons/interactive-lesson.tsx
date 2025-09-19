"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { VoiceNarrator } from '@/components/ui/voice-narrator'
import { useLanguage } from '@/contexts/language-context'
import { useGame } from '@/contexts/game-context'
import { backendClient, type BackendQuestion } from '@/lib/api/backend-client'

// Question interface for the component
interface Question {
  id: string
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer'
  question: {
    en: string
    od: string
    hi: string
  }
  options?: {
    en: string[]
    od: string[]
    hi: string[]
  }
  correctAnswer: number | string
  explanation: {
    en: string
    od: string
    hi: string
  }
  culturalContext?: {
    en: string
    od: string
    hi: string
  }
}

// Component props interface
interface InteractiveLessonProps {
  subject: string
  lessonTitle: {
    en: string
    od: string
    hi: string
  }
  questions?: Question[]
  onComplete: (score: number) => void
  className?: string
}

// Question bank for fallback
const getQuestionsBySubject = (subject: string): Question[] => {
  const questionBank: { [key: string]: Question[] } = {
    science: [
      {
        id: "sci-1",
        type: "multiple-choice",
        question: {
          en: "What makes the Sun Temple at Konark scientifically remarkable?",
          od: "କୋଣାର୍କର ସୂର୍ଯ୍ୟ ମନ୍ଦିର ବୈଜ୍ଞାନିକ ଦୃଷ୍ଟିରୁ କାହିଁକି ଉଲ୍ଲେଖନୀୟ?",
          hi: "कोणार्क का सूर्य मंदिर वैज्ञानिक दृष्टि से क्यों उल्लेखनीय है?"
        },
        options: {
          en: ["It's a giant sundial", "It has magnetic properties", "It predicts eclipses", "All of the above"],
          od: ["ଏହା ଏକ ବିଶାଳ ସୂର୍ଯ୍ୟଘଡ଼ି", "ଏହାର ଚୁମ୍ବକୀୟ ଗୁଣ ଅଛି", "ଏହା ଗ୍ରହଣ ପୂର୍ବାନୁମାନ କରେ", "ସବୁଗୁଡ଼ିକ"],
          hi: ["यह एक विशाल सूर्यघड़ी है", "इसमें चुंबकीय गुण हैं", "यह ग्रहण की भविष्यवाणी करता है", "उपरोक्त सभी"]
        },
        correctAnswer: 3,
        explanation: {
          en: "The Konark Sun Temple is an architectural marvel that functions as a sundial, has magnetic properties, and was designed with astronomical precision.",
          od: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ଏକ ସ୍ଥାପତ୍ୟ ଚମତ୍କାର ଯାହା ସୂର୍ଯ୍ୟଘଡ଼ି ଭାବରେ କାମ କରେ, ଚୁମ୍ବକୀୟ ଗୁଣ ଅଛି ଏବଂ ଜ୍ୟୋତିର୍ବିଜ୍ଞାନ ସଠିକତା ସହିତ ଡିଜାଇନ କରାଯାଇଛି।",
          hi: "कोणार्क सूर्य मंदिर एक स्थापत्य चमत्कार है जो सूर्यघड़ी के रूप में काम करता है, चुंबकीय गुण रखता है और खगोलीय सटीकता के साथ डिज़ाइन किया गया था।"
        },
        culturalContext: {
          en: "Ancient Odia architects combined science and spirituality in temple construction.",
          od: "ପ୍ରାଚୀନ ଓଡ଼ିଆ ସ୍ଥପତିମାନେ ମନ୍ଦିର ନିର୍ମାଣରେ ବିଜ୍ଞାନ ଏବଂ ଆଧ୍ୟାତ୍ମିକତାକୁ ମିଶ୍ରଣ କରିଥିଲେ।",
          hi: "प्राचीन ओडिया वास्तुकारों ने मंदिर निर्माण में विज्ञान और आध्यात्म का मिश्रण किया।"
        }
      },
      {
        id: "sci-2",
        type: "multiple-choice",
        question: {
          en: "What is photosynthesis?",
          od: "ଫୋଟୋସିନ୍ଥେସିସ କ'ଣ?",
          hi: "प्रकाश संश्लेषण क्या है?"
        },
        options: {
          en: ["Plants making food using sunlight", "Animals breathing", "Water evaporation", "Rock formation"],
          od: ["ସୂର୍ଯ୍ୟାଲୋକ ବ୍ୟବହାର କରି ଉଦ୍ଭିଦ ଖାଦ୍ୟ ପ୍ରସ୍ତୁତ କରିବା", "ପ୍ରାଣୀମାନଙ୍କର ଶ୍ୱାସ", "ଜଳ ବାଷ୍ପୀଭବନ", "ପଥର ଗଠନ"],
          hi: ["पौधों का सूर्य प्रकाश का उपयोग करके भोजन बनाना", "जानवरों का सांस लेना", "पानी का वाष्पीकरण", "चट्टान का निर्माण"]
        },
        correctAnswer: 0,
        explanation: {
          en: "Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to create glucose and oxygen.",
          od: "ଫୋଟୋସିନ୍ଥେସିସ ହେଉଛି ଏକ ପ୍ରକ୍ରିୟା ଯାହା ଦ୍ୱାରା ଉଦ୍ଭିଦ ସୂର୍ଯ୍ୟାଲୋକ, ଜଳ ଏବଂ କାର୍ବନ ଡାଇଅକ୍ସାଇଡ ବ୍ୟବହାର କରି ଗ୍ଲୁକୋଜ ଏବଂ ଅମ୍ଳଜାନ ସୃଷ୍ଟି କରେ।",
          hi: "प्रकाश संश्लेषण वह प्रक्रिया है जिसके द्वारा पौधे सूर्य प्रकाश, पानी और कार्बन डाइऑक्साइड का उपयोग करके ग्लूकोज और ऑक्सीजन बनाते हैं।"
        }
      },
      {
        id: "sci-3",
        type: "multiple-choice",
        question: {
          en: "Which gas do we breathe in?",
          od: "ଆମେ କେଉଁ ଗ୍ୟାସ ଶ୍ୱାସରେ ନେଇଥାଉ?",
          hi: "हम कौन सी गैस सांस में लेते हैं?"
        },
        options: {
          en: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
          od: ["ଅମ୍ଳଜାନ", "କାର୍ବନ ଡାଇଅକ୍ସାଇଡ", "ନାଇଟ୍ରୋଜେନ", "ହାଇଡ୍ରୋଜେନ"],
          hi: ["ऑक्सीजन", "कार्बन डाइऑक्साइड", "नाइट्रोजन", "हाइड्रोजन"]
        },
        correctAnswer: 0,
        explanation: {
          en: "We breathe in oxygen from the air, which is essential for our body's cellular processes.",
          od: "ଆମେ ବାୟୁରୁ ଅମ୍ଳଜାନ ଶ୍ୱାସରେ ନେଇଥାଉ, ଯାହା ଆମ ଶରୀରର କୋଷୀୟ ପ୍ରକ୍ରିୟା ପାଇଁ ଅତ୍ୟାବଶ୍ୟକ।",
          hi: "हम हवा से ऑक्सीजन सांस में लेते हैं, जो हमारे शरीर की कोशिकीय प्रक्रियाओं के लिए आवश्यक है।"
        }
      }
    ],
    technology: [
      {
        id: "tech-1",
        type: "multiple-choice",
        question: {
          en: "What is artificial intelligence?",
          od: "କୃତ୍ରିମ ବୁଦ୍ଧିମତ୍ତା କ'ଣ?",
          hi: "कृत्रिम बुद्धिमत्ता क्या है?"
        },
        options: {
          en: ["Machines that can think like humans", "Very fast computers", "Internet technology", "Mobile applications"],
          od: ["ଯନ୍ତ୍ର ଯାହା ମଣିଷ ପରି ଚିନ୍ତା କରିପାରେ", "ଅତି ଦ୍ରୁତ କମ୍ପ୍ୟୁଟର", "ଇଣ୍ଟରନେଟ ଟେକ୍ନୋଲୋଜି", "ମୋବାଇଲ ଆପ୍ଲିକେସନ"],
          hi: ["मशीनें जो इंसानों की तरह सोच सकती हैं", "बहुत तेज़ कंप्यूटर", "इंटरनेट तकनीक", "मोबाइल एप्लिकेशन"]
        },
        correctAnswer: 0,
        explanation: {
          en: "AI refers to computer systems that can perform tasks typically requiring human intelligence.",
          od: "AI କମ୍ପ୍ୟୁଟର ସିଷ୍ଟମକୁ ବୁଝାଏ ଯାହା ସାଧାରଣତଃ ମାନବ ବୁଦ୍ଧିମତ୍ତା ଆବଶ୍ୟକ କରୁଥିବା କାର୍ଯ୍ୟ କରିପାରେ।",
          hi: "AI कंप्यूटर सिस्टम को संदर्भित करता है जो आमतौर पर मानव बुद्धि की आवश्यकता वाले कार्य कर सकते हैं।"
        }
      }
    ],
    maths: [
      {
        id: "math-1",
        type: "multiple-choice",
        question: {
          en: "If you have 3/4 of a traditional Odia sweet and eat 1/4, how much is left?",
          od: "ଯଦି ଆପଣଙ୍କ ପାଖରେ ଏକ ପାରମ୍ପରିକ ଓଡ଼ିଆ ମିଠାର 3/4 ଅଂଶ ଅଛି ଏବଂ 1/4 ଖାଆନ୍ତି, ତେବେ କେତେ ବାକି ରହିଲା?",
          hi: "यदि आपके पास एक पारंपरिक ओडिया मिठाई का 3/4 हिस्सा है और आप 1/4 खाते हैं, तो कितना बचा है?"
        },
        options: {
          en: ["1/2", "2/4", "1/4", "3/8"],
          od: ["1/2", "2/4", "1/4", "3/8"],
          hi: ["1/2", "2/4", "1/4", "3/8"]
        },
        correctAnswer: 0,
        explanation: {
          en: "3/4 - 1/4 = 2/4 = 1/2. Half of the sweet remains.",
          od: "3/4 - 1/4 = 2/4 = 1/2। ମିଠାର ଅଧା ଅଂଶ ବାକି ରହିଲା।",
          hi: "3/4 - 1/4 = 2/4 = 1/2। मिठाई का आधा हिस्सा बचा है।"
        }
      },
      {
        id: "math-2",
        type: "multiple-choice",
        question: {
          en: "What is 15% of 200?",
          od: "200 ର 15% କେତେ?",
          hi: "200 का 15% कितना है?"
        },
        options: {
          en: ["30", "25", "35", "20"],
          od: ["30", "25", "35", "20"],
          hi: ["30", "25", "35", "20"]
        },
        correctAnswer: 0,
        explanation: {
          en: "15% of 200 = (15/100) × 200 = 30",
          od: "200 ର 15% = (15/100) × 200 = 30",
          hi: "200 का 15% = (15/100) × 200 = 30"
        }
      },
      {
        id: "math-3",
        type: "multiple-choice",
        question: {
          en: "If a Jagannath Temple has 108 steps and you climb 36 steps, what fraction have you climbed?",
          od: "ଯଦି ଜଗନ୍ନାଥ ମନ୍ଦିରରେ 108 ଟି ସିଡ଼ି ଅଛି ଏବଂ ଆପଣ 36 ଟି ସିଡ଼ି ଚଢ଼ନ୍ତି, ତେବେ ଆପଣ କେତେ ଭାଗ ଚଢ଼ିଛନ୍ତି?",
          hi: "यदि जगन्नाथ मंदिर में 108 सीढ़ियाँ हैं और आप 36 सीढ़ियाँ चढ़ते हैं, तो आपने कितना भाग चढ़ा है?"
        },
        options: {
          en: ["1/3", "1/4", "2/5", "1/2"],
          od: ["1/3", "1/4", "2/5", "1/2"],
          hi: ["1/3", "1/4", "2/5", "1/2"]
        },
        correctAnswer: 0,
        explanation: {
          en: "36/108 = 1/3. You have climbed one-third of the steps.",
          od: "36/108 = 1/3। ଆପଣ ସିଡ଼ିର ଏକ ତୃତୀୟାଂଶ ଚଢ଼ିଛନ୍ତି।",
          hi: "36/108 = 1/3। आपने सीढ़ियों का एक तिहाई भाग चढ़ा है।"
        },
        culturalContext: {
          en: "The Jagannath Temple in Puri is one of the most sacred temples in Odisha with many architectural features.",
          od: "ପୁରୀର ଜଗନ୍ନାଥ ମନ୍ଦିର ଓଡ଼ିଶାର ସବୁଠାରୁ ପବିତ୍ର ମନ୍ଦିର ମଧ୍ୟରୁ ଗୋଟିଏ ଯାହାର ଅନେକ ସ୍ଥାପତ୍ୟ ବିଶେଷତ୍ୱ ଅଛି।",
          hi: "पुरी का जगन्नाथ मंदिर ओडिशा के सबसे पवित्र मंदिरों में से एक है जिसमें कई स्थापत्य विशेषताएं हैं।"
        }
      }
    ],
    odissi: [
      {
        id: "odissi-1",
        type: "multiple-choice",
        question: {
          en: "What is the traditional dance form of Odisha?",
          od: "ଓଡ଼ିଶାର ପାରମ୍ପରିକ ନୃତ୍ୟ କ'ଣ?",
          hi: "ओडिशा का पारंपरिक नृत्य रूप क्या है?"
        },
        options: {
          en: ["Bharatanatyam", "Odissi", "Kathak", "Kuchipudi"],
          od: ["ଭରତନାଟ୍ୟମ୍", "ଓଡ଼ିଶୀ", "କଥକ", "କୁଚିପୁଡ଼ି"],
          hi: ["भरतनाट्यम", "ओडिसी", "कथक", "कुचिपुड़ी"]
        },
        correctAnswer: 1,
        explanation: {
          en: "Odissi is the classical dance form that originated in Odisha, known for its graceful movements and spiritual themes.",
          od: "ଓଡ଼ିଶୀ ହେଉଛି ଓଡ଼ିଶାରେ ଉତ୍ପନ୍ନ ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ, ଯାହା ଏହାର ସୁନ୍ଦର ଗତିବିଧି ଏବଂ ଆଧ୍ୟାତ୍ମିକ ବିଷୟବସ୍ତୁ ପାଇଁ ପ୍ରସିଦ୍ଧ।",
          hi: "ओडिसी एक शास्त्रीय नृत्य है जो ओडिशा में उत्पन्न हुआ, जो अपनी सुंदर गतिविधियों और आध्यात्मिक विषयों के लिए प्रसिद्ध है।"
        },
        culturalContext: {
          en: "Odissi dance is performed in temples and celebrates the rich cultural heritage of Odisha.",
          od: "ଓଡ଼ିଶୀ ନୃତ୍ୟ ମନ୍ଦିରରେ ପରିବେଷଣ କରାଯାଏ ଏବଂ ଓଡ଼ିଶାର ସମୃଦ୍ଧ ସାଂସ୍କୃତିକ ଐତିହ୍ୟକୁ ପାଳନ କରେ।",
          hi: "ओडिसी नृत्य मंदिरों में किया जाता है और ओडिशा की समृद्ध सांस्कृतिक विरासत का जश्न मनाता है।"
        }
      },
      {
        id: "odissi-2",
        type: "multiple-choice",
        question: {
          en: "When is the famous Rath Yatra festival celebrated in Puri?",
          od: "ପୁରୀରେ ପ୍ରସିଦ୍ଧ ରଥଯାତ୍ରା ପର୍ବ କେବେ ପାଳିତ ହୁଏ?",
          hi: "पुरी में प्रसिद्ध रथ यात्रा उत्सव कब मनाया जाता है?"
        },
        options: {
          en: ["Ashadha month", "Kartik month", "Chaitra month", "Magha month"],
          od: ["ଆଷାଢ଼ ମାସ", "କାର୍ତ୍ତିକ ମାସ", "ଚୈତ୍ର ମାସ", "ମାଘ ମାସ"],
          hi: ["आषाढ़ महीना", "कार्तिक महीना", "चैत्र महीना", "माघ महीना"]
        },
        correctAnswer: 0,
        explanation: {
          en: "Rath Yatra is celebrated in the month of Ashadha (June-July) when Lord Jagannath travels to Gundicha Temple.",
          od: "ରଥଯାତ୍ରା ଆଷାଢ଼ ମାସରେ (ଜୁନ-ଜୁଲାଇ) ପାଳିତ ହୁଏ ଯେତେବେଳେ ଭଗବାନ ଜଗନ୍ନାଥ ଗୁଣ୍ଡିଚା ମନ୍ଦିରକୁ ଯାତ୍ରା କରନ୍ତି।",
          hi: "रथ यात्रा आषाढ़ महीने में (जून-जुलाई) मनाई जाती है जब भगवान जगन्नाथ गुंडिचा मंदिर की यात्रा करते हैं।"
        },
        culturalContext: {
          en: "Rath Yatra is one of the most important festivals of Odisha, attracting millions of devotees worldwide.",
          od: "ରଥଯାତ୍ରା ଓଡ଼ିଶାର ସବୁଠାରୁ ଗୁରୁତ୍ୱପୂର୍ଣ୍ଣ ପର୍ବ ମଧ୍ୟରୁ ଗୋଟିଏ, ଯାହା ବିଶ୍ୱବ୍ୟାପୀ ଲକ୍ଷ ଲକ୍ଷ ଭକ୍ତଙ୍କୁ ଆକର୍ଷିତ କରେ।",
          hi: "रथ यात्रा ओडिशा के सबसे महत्वपूर्ण त्योहारों में से एक है, जो दुनिया भर से लाखों भक्तों को आकर्षित करती है।"
        }
      },
      {
        id: "odissi-3",
        type: "multiple-choice",
        question: {
          en: "What is the traditional sweet of Odisha offered to Lord Jagannath?",
          od: "ଭଗବାନ ଜଗନ୍ନାଥଙ୍କୁ ଅର୍ପଣ କରାଯାଉଥିବା ଓଡ଼ିଶାର ପାରମ୍ପରିକ ମିଠା କ'ଣ?",
          hi: "भगवान जगन्नाथ को अर्पित की जाने वाली ओडिशा की पारंपरिक मिठाई कौन सी है?"
        },
        options: {
          en: ["Rasgulla", "Kheer", "Chhena Poda", "Sandesh"],
          od: ["ରସଗୋଲା", "କ୍ଷୀର", "ଛେନା ପୋଡ଼ା", "ସନ୍ଦେଶ"],
          hi: ["रसगुल्ला", "खीर", "छेना पोड़ा", "संदेश"]
        },
        correctAnswer: 2,
        explanation: {
          en: "Chhena Poda is the traditional sweet of Odisha, often called the 'cheesecake of India' and is offered to Lord Jagannath.",
          od: "ଛେନା ପୋଡ଼ା ହେଉଛି ଓଡ଼ିଶାର ପାରମ୍ପରିକ ମିଠା, ଯାହାକୁ ପ୍ରାୟତଃ 'ଭାରତର ଚିଜକେକ' କୁହାଯାଏ ଏବଂ ଭଗବାନ ଜଗନ୍ନାଥଙ୍କୁ ଅର୍ପଣ କରାଯାଏ।",
          hi: "छेना पोड़ा ओडिशा की पारंपरिक मिठाई है, जिसे अक्सर 'भारत का चीज़केक' कहा जाता है और भगवान जगन्नाथ को अर्पित की जाती है।"
        },
        culturalContext: {
          en: "Chhena Poda originated in Nayagarh district and is an integral part of Odia cuisine and temple offerings.",
          od: "ଛେନା ପୋଡ଼ା ନୟାଗଡ଼ ଜିଲ୍ଲାରେ ଉତ୍ପନ୍ନ ହୋଇଥିଲା ଏବଂ ଓଡ଼ିଆ ରନ୍ଧନ ଏବଂ ମନ୍ଦିର ଭୋଗର ଏକ ଅବିଚ୍ଛେଦ୍ୟ ଅଂଶ।",
          hi: "छेना पोड़ा नयागढ़ जिले में उत्पन्न हुआ था और ओडिया व्यंजन और मंदिर प्रसाद का एक अभिन्न अंग है।"
        }
      }
    ],
    engineering: [
      {
        id: "eng-1",
        type: "multiple-choice",
        question: {
          en: "What engineering principle is demonstrated in the construction of ancient Odia temples?",
          od: "ପ୍ରାଚୀନ ଓଡ଼ିଆ ମନ୍ଦିର ନିର୍ମାଣରେ କେଉଁ ଇଞ୍ଜିନିୟରିଂ ନୀତି ପ୍ରଦର୍ଶିତ ହୋଇଛି?",
          hi: "प्राचीन ओडिया मंदिरों के निर्माण में कौन सा इंजीनियरिंग सिद्धांत प्रदर्शित होता है?"
        },
        options: {
          en: ["Load distribution", "Thermal expansion", "Electrical circuits", "Chemical reactions"],
          od: ["ଭାର ବଣ୍ଟନ", "ତାପୀୟ ବିସ୍ତାର", "ବିଦ୍ୟୁତ ସର୍କିଟ", "ରାସାୟନିକ ପ୍ରତିକ୍ରିୟା"],
          hi: ["भार वितरण", "तापीय विस्तार", "विद्युत सर्किट", "रासायनिक अभिक्रिया"]
        },
        correctAnswer: 0,
        explanation: {
          en: "Ancient Odia temples demonstrate excellent load distribution principles, allowing massive stone structures to stand for centuries.",
          od: "ପ୍ରାଚୀନ ଓଡ଼ିଆ ମନ୍ଦିରଗୁଡ଼ିକ ଉତ୍କୃଷ୍ଟ ଭାର ବଣ୍ଟନ ନୀତି ପ୍ରଦର୍ଶନ କରନ୍ତି, ଯାହା ବିଶାଳ ପଥର ସଂରଚନାକୁ ଶତାବ୍ଦୀ ଧରି ଠିଆ ହେବାକୁ ଅନୁମତି ଦିଏ।",
          hi: "प्राचीन ओडिया मंदिर उत्कृष्ट भार वितरण सिद्धांतों को प्रदर्शित करते हैं, जो विशाल पत्थर की संरचनाओं को सदियों तक खड़े रहने की अनुमति देते हैं।"
        },
        culturalContext: {
          en: "The Konark Sun Temple and Jagannath Temple showcase advanced engineering techniques of ancient Odisha.",
          od: "କୋଣାର୍କ ସୂର୍ଯ୍ୟ ମନ୍ଦିର ଏବଂ ଜଗନ୍ନାଥ ମନ୍ଦିର ପ୍ରାଚୀନ ଓଡ଼ିଶାର ଉନ୍ନତ ଇଞ୍ଜିନିୟରିଂ କୌଶଳ ପ୍ରଦର୍ଶନ କରେ।",
          hi: "कोणार्क सूर्य मंदिर और जगन्नाथ मंदिर प्राचीन ओडिशा की उन्नत इंजीनियरिंग तकनीकों को प्रदर्शित करते हैं।"
        }
      },
      {
        id: "eng-2",
        type: "multiple-choice",
        question: {
          en: "What is a simple machine?",
          od: "ସରଳ ଯନ୍ତ୍ର କ'ଣ?",
          hi: "सरल मशीन क्या है?"
        },
        options: {
          en: ["A device that makes work easier", "A complex computer", "An electric motor", "A chemical process"],
          od: ["ଏକ ଉପକରଣ ଯାହା କାମକୁ ସହଜ କରେ", "ଏକ ଜଟିଳ କମ୍ପ୍ୟୁଟର", "ଏକ ବିଦ୍ୟୁତ ମୋଟର", "ଏକ ରାସାୟନିକ ପ୍ରକ୍ରିୟା"],
          hi: ["एक उपकरण जो काम को आसान बनाता है", "एक जटिल कंप्यूटर", "एक इलेक्ट्रिक मोटर", "एक रासायनिक प्रक्रिया"]
        },
        correctAnswer: 0,
        explanation: {
          en: "A simple machine is a device that makes work easier by changing the direction or magnitude of force.",
          od: "ସରଳ ଯନ୍ତ୍ର ହେଉଛି ଏକ ଉପକରଣ ଯାହା ବଳର ଦିଗ କିମ୍ବା ପରିମାଣ ପରିବର୍ତ୍ତନ କରି କାମକୁ ସହଜ କରେ।",
          hi: "सरल मशीन एक उपकरण है जो बल की दिशा या परिमाण को बदलकर काम को आसान बनाता है।"
        }
      },
      {
        id: "eng-3",
        type: "multiple-choice",
        question: {
          en: "Which of these is an example of a lever?",
          od: "ଏଥିମଧ୍ୟରୁ କେଉଁଟି ଲିଭରର ଉଦାହରଣ?",
          hi: "इनमें से कौन सा लीवर का उदाहरण है?"
        },
        options: {
          en: ["Scissors", "Wheel", "Screw", "Pulley"],
          od: ["କଞ୍ଚି", "ଚକ", "ସ୍କ୍ରୁ", "ପୁଲି"],
          hi: ["कैंची", "पहिया", "स्क्रू", "पुली"]
        },
        correctAnswer: 0,
        explanation: {
          en: "Scissors are a type of lever where the fulcrum is between the effort and the load.",
          od: "କଞ୍ଚି ହେଉଛି ଏକ ପ୍ରକାର ଲିଭର ଯେଉଁଠାରେ ଆଧାର ପ୍ରୟାସ ଏବଂ ଭାର ମଧ୍ୟରେ ଥାଏ।",
          hi: "कैंची एक प्रकार का लीवर है जहाँ आधार प्रयास और भार के बीच होता है।"
        }
      }
    ],
    english: [
      {
        id: "eng-1",
        type: "multiple-choice",
        question: {
          en: "What is a noun?",
          od: "ବିଶେଷ୍ୟ କ'ଣ?",
          hi: "संज्ञा क्या है?"
        },
        options: {
          en: ["A naming word", "An action word", "A describing word", "A connecting word"],
          od: ["ନାମକରଣ ଶବ୍ଦ", "କ୍ରିୟା ଶବ୍ଦ", "ବର୍ଣ୍ଣନା ଶବ୍ଦ", "ସଂଯୋଗ ଶବ୍ଦ"],
          hi: ["नामकरण शब्द", "क्रिया शब्द", "वर्णन शब्द", "संयोजन शब्द"]
        },
        correctAnswer: 0,
        explanation: {
          en: "A noun is a word that names a person, place, thing, or idea.",
          od: "ବିଶେଷ୍ୟ ହେଉଛି ଏକ ଶବ୍ଦ ଯାହା ବ୍ୟକ୍ତି, ସ୍ଥାନ, ବସ୍ତୁ କିମ୍ବା ଧାରଣାର ନାମ ଦିଏ।",
          hi: "संज्ञा एक शब्द है जो व्यक्ति, स्थान, वस्तु या विचार का नाम देता है।"
        }
      },
      {
        id: "eng-2",
        type: "multiple-choice",
        question: {
          en: "Which sentence is grammatically correct?",
          od: "କେଉଁ ବାକ୍ୟ ବ୍ୟାକରଣଗତ ଭାବରେ ସଠିକ?",
          hi: "कौन सा वाक्य व्याकरण की दृष्टि से सही है?"
        },
        options: {
          en: ["She goes to school", "She go to school", "She going to school", "She gone to school"],
          od: ["ସେ ବିଦ୍ୟାଳୟକୁ ଯାଏ", "ସେ ବିଦ୍ୟାଳୟକୁ ଯିବା", "ସେ ବିଦ୍ୟାଳୟକୁ ଯାଉଛି", "ସେ ବିଦ୍ୟାଳୟକୁ ଯାଇଛି"],
          hi: ["वह स्कूल जाती है", "वह स्कूल जाना", "वह स्कूल जा रही", "वह स्कूल गई"]
        },
        correctAnswer: 0,
        explanation: {
          en: "'She goes to school' is correct because 'she' is a third-person singular subject that requires 'goes'.",
          od: "'ସେ ବିଦ୍ୟାଳୟକୁ ଯାଏ' ସଠିକ କାରଣ 'ସେ' ଏକ ତୃତୀୟ ପୁରୁଷ ଏକବଚନ ବିଷୟ ଯାହା 'ଯାଏ' ଆବଶ୍ୟକ କରେ।",
          hi: "'वह स्कूल जाती है' सही है क्योंकि 'वह' तीसरे व्यक्ति का एकवचन विषय है जिसके लिए 'जाती है' की आवश्यकता होती है।"
        }
      },
      {
        id: "eng-3",
        type: "multiple-choice",
        question: {
          en: "What is the past tense of 'run'?",
          od: "'run' ର ଅତୀତ କାଳ କ'ଣ?",
          hi: "'run' का भूतकाल क्या है?"
        },
        options: {
          en: ["Ran", "Running", "Runs", "Runned"],
          od: ["Ran", "Running", "Runs", "Runned"],
          hi: ["Ran", "Running", "Runs", "Runned"]
        },
        correctAnswer: 0,
        explanation: {
          en: "The past tense of 'run' is 'ran'. It is an irregular verb.",
          od: "'run' ର ଅତୀତ କାଳ ହେଉଛି 'ran'। ଏହା ଏକ ଅନିୟମିତ କ୍ରିୟା।",
          hi: "'run' का भूतकाल 'ran' है। यह एक अनियमित क्रिया है।"
        }
      }
    ]
  };
  
  return questionBank[subject] || questionBank.science;
};

const sampleQuestions: Question[] = getQuestionsBySubject('odissi')

export function InteractiveLesson({
  subject,
  lessonTitle,
  questions = sampleQuestions,
  onComplete,
  className = "",
}: InteractiveLessonProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [answers, setAnswers] = useState<(number | null)[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationType, setCelebrationType] = useState<'correct' | 'wrong' | 'perfect' | 'levelup'>('correct')

  const { language, t } = useLanguage()
  const { completeQuiz, addXP, earnBadge } = useGame()

  // Load questions from backend or use fallback
  useEffect(() => {
    const loadQuestions = async () => {
      if (questions.length > 0) {
        setGeneratedQuestions(questions)
        return
      }

      setIsLoading(true)
      try {
        // Try to get user grade from context or default to 8
        const userGrade = 8; // You can get this from user context
        
        const backendQuestions = await backendClient.generateQuestions({
          subject: subject as any,
          grade: userGrade,
          topic: subject,
          count: Math.max(3, 5), // Minimum 3 questions
          difficulty: 'medium'
        })

        // Convert backend questions to component format
        const convertedQuestions: Question[] = backendQuestions.map(q => ({
          id: q.id,
          type: q.type as any,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          culturalContext: q.culturalContext
        }))

        setGeneratedQuestions(convertedQuestions)
      } catch (error) {
        console.error('Failed to load questions from backend:', error)
        // Use fallback questions
        setGeneratedQuestions(getQuestionsBySubject(subject))
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [subject, questions])

  // Use generated questions or fallback
  const activeQuestions = generatedQuestions.length > 0 ? generatedQuestions : getQuestionsBySubject(subject)

  useEffect(() => {
    setAnswers(new Array(activeQuestions.length).fill(null))
  }, [activeQuestions])

  const currentQ = activeQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / activeQuestions.length) * 100

  // Show loading state
  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto p-8 text-center"
      >
        <div className="glass-card p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">Generating Questions...</h3>
          <p className="text-muted-foreground">
            Creating personalized questions based on Odisha curriculum for {subject}
          </p>
        </div>
      </motion.div>
    )
  }

  // Safety check - if no current question, don't render
  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="glass-card p-8">
          <p className="text-muted-foreground">No questions available. Please try again.</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Reload
          </Button>
        </div>
      </div>
    )
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (selectedAnswer !== null) {
      if (selectedAnswer === currentQ.correctAnswer) {
        setScore(score + 1)
        // Award 10 XP for each correct answer
        addXP(10, subject)
        // Show celebration for correct answer
        setCelebrationType('correct')
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 2000)
      } else {
        // Show feedback for wrong answer
        setCelebrationType('wrong')
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 1500)
      }
      setShowExplanation(true)
    }
  }

  const handleContinue = () => {
    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      // Quiz complete
      const finalScore = Math.round((score / activeQuestions.length) * 100)
      setIsComplete(true)
      
      // Award badge for perfect score
      if (score === activeQuestions.length) {
        setCelebrationType('perfect')
        setShowCelebration(true)
        setTimeout(() => {
          earnBadge({
            type: "perfect_score",
            name: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Master`,
            description: `Perfect score in ${subject}! All questions answered correctly.`,
            icon: "🏆",
            rarity: "legendary"
          })
          setShowCelebration(false)
        }, 3000)
      }
      
      completeQuiz(subject, finalScore)
      onComplete(finalScore)
    }
  }

  const getQuestionText = (textObj: { en: string; od: string; hi: string }) => {
    return textObj[language as keyof typeof textObj] || textObj.en
  }

  if (isComplete) {
    const finalScore = Math.round((score / activeQuestions.length) * 100)
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`max-w-2xl mx-auto ${className}`}
      >
        <Card className="glass-card text-center">
          <CardContent className="p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-6xl mb-4"
            >
              {finalScore >= 80 ? "🏆" : finalScore >= 60 ? "🎉" : "💪"}
            </motion.div>

            <h2 className="text-2xl font-bold mb-4">
              {finalScore >= 80
                ? t("quiz.excellent") || "Excellent!"
                : finalScore >= 60
                  ? t("quiz.good_job") || "Good Job!"
                  : t("quiz.keep_trying") || "Keep Trying!"}
            </h2>

            <div className="text-4xl font-bold text-primary mb-2">{finalScore}%</div>
            <p className="text-muted-foreground mb-6">
              {t("quiz.score_message") || "You got"} {score} {t("quiz.out_of") || "out of"} {activeQuestions.length}{" "}
              {t("quiz.questions_correct") || "questions correct"}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">+{score * 10}</div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
              <div className="bg-secondary/10 rounded-lg p-4">
                <div className="text-2xl font-bold text-secondary">{score}/{activeQuestions.length}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </div>
            </div>

            <Button onClick={() => window.location.reload()} className="w-full">
              {t("quiz.try_again") || "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {/* Celebration Overlay */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {celebrationType === 'correct' && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 0.6, repeat: 2 }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <div className="bg-green-500 text-white px-6 py-3 rounded-full text-xl font-bold shadow-lg">
                +10 XP! Correct! 🌟
              </div>
              {/* Floating balloons */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0, opacity: 1 }}
                  animate={{ 
                    y: -200, 
                    x: (Math.random() - 0.5) * 200,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                  className="absolute text-4xl"
                  style={{ 
                    left: `${50 + (Math.random() - 0.5) * 20}%`,
                    top: '50%'
                  }}
                >
                  🎈
                </motion.div>
              ))}
            </motion.div>
          )}
          
          {celebrationType === 'wrong' && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 0.4, repeat: 1 }}
                className="text-6xl mb-4"
              >
                💪
              </motion.div>
              <div className="bg-orange-500 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
                Keep trying! You're learning! 📚
              </div>
            </motion.div>
          )}

          {celebrationType === 'perfect' && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 1, repeat: 2 }}
                className="text-9xl mb-4"
              >
                🏆
              </motion.div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full text-2xl font-bold shadow-xl">
                PERFECT SCORE! 🌟 Badge Earned! 🎖️
              </div>
              {/* Confetti effect */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                  animate={{ 
                    y: Math.random() * -300 - 100,
                    x: (Math.random() - 0.5) * 400,
                    opacity: 0,
                    scale: 0,
                    rotate: Math.random() * 360
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                  className="absolute text-2xl"
                  style={{ 
                    left: `${50 + (Math.random() - 0.5) * 30}%`,
                    top: '50%'
                  }}
                >
                  {['🎊', '🎉', '⭐', '🌟', '💫'][Math.floor(Math.random() * 5)]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`max-w-2xl mx-auto ${className}`}
      >
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <CardTitle className="text-lg">{getQuestionText(lessonTitle)}</CardTitle>
              <VoiceNarrator text={getQuestionText(currentQ.question)} showButton={true} />
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {t("quiz.question") || "Question"} {currentQuestion + 1} {t("quiz.of") || "of"} {activeQuestions.length}
            </p>
          </CardHeader>

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            {!showExplanation ? (
              <motion.div
                key="question"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold mb-4">{getQuestionText(currentQ.question)}</h3>

                <div className="space-y-3">
                  {currentQ.options &&
                    currentQ.options[language as keyof typeof currentQ.options].map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`
                          w-full p-4 text-left rounded-lg border-2 transition-all
                          ${
                            selectedAnswer === index
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }
                        `}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm
                            ${
                              selectedAnswer === index
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground"
                            }
                          `}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span>{option}</span>
                        </div>
                      </motion.button>
                    ))}
                </div>

                <Button onClick={handleNext} disabled={selectedAnswer === null} className="w-full">
                  {t("common.next") || "Next"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="explanation"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl mb-2">
                    {selectedAnswer === currentQ.correctAnswer ? "✅" : "❌"}
                  </motion.div>
                  <h3 className="text-xl font-semibold">
                    {selectedAnswer === currentQ.correctAnswer
                      ? t("quiz.correct") || "Correct!"
                      : t("quiz.incorrect") || "Incorrect"}
                  </h3>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">{t("quiz.explanation") || "Explanation:"}</h4>
                  <p className="text-sm">{getQuestionText(currentQ.explanation)}</p>
                </div>

                {currentQ.culturalContext && (
                  <div className="bg-primary/10 rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-primary">
                      {t("quiz.cultural_context") || "Cultural Context:"}
                    </h4>
                    <p className="text-sm">{getQuestionText(currentQ.culturalContext)}</p>
                  </div>
                )}

                <Button onClick={handleContinue} className="w-full">
                  {currentQuestion < activeQuestions.length - 1
                    ? t("common.continue") || "Continue"
                    : t("quiz.finish") || "Finish Quiz"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
    </div>
  )
}
