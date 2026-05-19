document.addEventListener('DOMContentLoaded', () => {
    // Elementos das telas
    const introSection = document.getElementById('intro-section');
    const nameSection = document.getElementById('name-section');
    const lastNameSection = document.getElementById('lastName-section');
    const proficiencySection = document.getElementById('proficiency-section');
    const preparationSection = document.getElementById('preparation-section');
    const quizSection = document.getElementById('quiz-section');
    const resultsSection = document.getElementById('results-section');

    // Elementos da introdução
    const startButton = document.getElementById('startButton');

    // Elementos da coleta de nome
    const firstNameInput = document.getElementById('firstNameInput');
    const nextNameButton = document.getElementById('nextNameButton');

    // Elementos da coleta de sobrenome
    const lastNameQuestion = document.getElementById('lastNameQuestion');
    const lastNameInput = document.getElementById('lastNameInput');
    const nextLastNameButton = document.getElementById('nextLastNameButton');

    // Elementos da coleta de proficiência
    const proficiencyQuestion = document.getElementById('proficiencyQuestion');
    const proficiencyOptionsContainer = document.querySelector('.proficiency-options');
    const proficiencyOptionButtons = document.querySelectorAll('.proficiency-option');
    const nextProficiencyButton = document.getElementById('nextProficiencyButton');

    // Elementos da tela de preparação
    const preparationMessage = document.getElementById('preparationMessage');
    const startQuizButton = document.getElementById('startQuizButton');

    // Elementos do quiz
    const progressBarFill = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const youtubeVideoContainer = document.getElementById('youtube-video-container');
    const nextButton = document.getElementById('nextButton');

    // Elementos dos resultados
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
    const levelDisplay = document.getElementById('levelDisplay');
    const detailedFeedback = document.getElementById('detailedFeedback');
    const restartButton = document.getElementById('restartButton');

    let currentQuestionIndex = 0;
    let userAnswers = [];
    let score = 0;
    let userData = {
        firstName: '',
        lastName: '',
        proficiencyLevel: ''
    };

    // Variáveis para o controle do YouTube Player
    let player;
    let videoPlayCounts = {}; // Objeto para armazenar a contagem de reproduções por vídeo ID
    let currentVideoId = null; // Para saber qual vídeo está carregado

    // 1. Carregar a API do YouTube IFrame Player
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // 2. Esta função será chamada automaticamente quando a API estiver pronta
    window.onYouTubeIframeAPIReady = () => {
        // O player será criado dinamicamente em loadQuestion()
    };

    // Função para embaralhar um array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Estrutura de dados para as perguntas (com as 40 perguntas)
    // As opções foram reorganizadas e os correctAnswerId ajustados para distribuir as respostas corretas.
    const questions = [
        {
            id: 'q1',
            type: 'grammar',
            topic: 'verb_tenses',
            question: "1. _________ the store. Do you want to come with me?",
            options: [
                { id: 'opt1a', text: "Am going to" },
                { id: 'opt1b', text: "I going to" },
                { id: 'opt1c', text: "I'm going to" },
                { id: 'opt1d', text: "Going to" }
            ],
            correctAnswerId: 'opt1c',
            explanation: "A forma correta para expressar uma ação futura planejada é 'I'm going to' seguido do verbo base.",
            youtubeVideoId: null
        },
        {
            id: 'q2',
            type: 'grammar',
            topic: 'past_simple',
            question: "2. Yesterday, I __________ to the cinema with my friends.",
            options: [
                { id: 'opt2a', text: "go" },
                { id: 'opt2b', text: "going" },
                { id: 'opt2c', text: "goed" },
                { id: 'opt2d', text: "went" }
            ],
            correctAnswerId: 'opt2d',
            explanation: "O passado simples de 'go' é 'went'.",
            youtubeVideoId: null
        },
        {
            id: 'q3',
            type: 'grammar',
            topic: 'present_simple',
            question: "3. My sister is a teacher. She __________ English at a school.",
            options: [
                { id: 'opt3a', text: "teaching" },
                { id: 'opt3b', text: "teaches" },
                { id: 'opt3c', text: "teached" },
                { id: 'opt3d', text: "teach" }
            ],
            correctAnswerId: 'opt3b',
            explanation: "Para a terceira pessoa do singular (she) no Present Simple, adiciona-se '-es' ao verbo 'teach'.",
            youtubeVideoId: null
        },
        {
            id: 'q4',
            type: 'vocabulary',
            topic: 'adjectives',
            question: "4. What's the weather like today? It's very ________.",
            options: [
                { id: 'opt4a', text: "hotter" },
                { id: 'opt4b', text: "hot" },
                { id: 'opt4c', text: "hotnes" },
                { id: 'opt4d', text: "hottest" }
            ],
            correctAnswerId: 'opt4b',
            explanation: "O adjetivo simples 'hot' é o correto para descrever o clima.",
            youtubeVideoId: null
        },
        {
            id: 'q5',
            type: 'grammar',
            topic: 'prepositions',
            question: "5. Can you pass ________ the salt, please?",
            options: [
                { id: 'opt5a', text: "at" },
                { id: 'opt5b', text: "me" },
                { id: 'opt5c', text: "by" },
                { id: 'opt5d', text: "for" }
            ],
            correctAnswerId: 'opt5b',
            explanation: "A construção correta é 'pass me the salt'.",
            youtubeVideoId: null
        },
        {
            id: 'q6',
            type: 'grammar',
            topic: 'there_is_are',
            question: "6. _________ a man studying in the library.",
            options: [
                { id: 'opt6a', text: "There is" },
                { id: 'opt6b', text: "There are" },
                { id: 'opt6c', text: "There were" },
                { id: 'opt6d', text: "There aren't" }
            ],
            correctAnswerId: 'opt6a',
            explanation: "Usa-se 'There is' para substantivos singulares.",
            youtubeVideoId: null
        },
        {
            id: 'q7',
            type: 'grammar',
            topic: 'quantifiers',
            question: "7. How __________ sugar do you put in your coffee?",
            options: [
                { id: 'opt7a', text: "a lot of" },
                { id: 'opt7b', text: "many" },
                { id: 'opt7c', text: "much" },
                { id: 'opt7d', text: "a little" }
            ],
            correctAnswerId: 'opt7c',
            explanation: "'Sugar' é um substantivo incontável, então usa-se 'much'.",
            youtubeVideoId: null
        },
        {
            id: 'q8',
            type: 'grammar',
            topic: 'present_perfect',
            question: "8. How many times __________ to Paris?",
            options: [
                { id: 'opt8a', text: "been you" },
                { id: 'opt8b', text: "have you been" },
                { id: 'opt8c', text: "you been" },
                { id: 'opt8d', text: "you have been" }
            ],
            correctAnswerId: 'opt8b',
            explanation: "A estrutura correta do Present Perfect em perguntas é 'Have/Has + sujeito + past participle'.",
            youtubeVideoId: null
        },
        {
            id: 'q9',
            type: 'grammar',
            topic: 'past_continuous',
            question: "9. Last weekend, while I __________ TV, the power suddenly went out.",
            options: [
                { id: 'opt9a', text: "watch" },
                { id: 'opt9b', text: "watched" },
                { id: 'opt9c', text: "were watching" },
                { id: 'opt9d', text: "was watching" }
            ],
            correctAnswerId: 'opt9d',
            explanation: "Para uma ação contínua no passado interrompida por outra, usa-se Past Continuous ('was watching').",
            youtubeVideoId: null
        },
        {
            id: 'q10',
            type: 'grammar',
            topic: 'modals',
            question: "10. You _______ smoke in this area. It's not allowed.",
            options: [
                { id: 'opt10a', text: "mustn't" },
                { id: 'opt10b', text: "don't have to" },
                { id: 'opt10c', text: "have to" },
                { id: 'opt10d', text: "must" }
            ],
            correctAnswerId: 'opt10a',
            explanation: "'Mustn't' indica proibição.",
            youtubeVideoId: null
        },
        {
            id: 'q11',
            type: 'grammar',
            topic: 'modals',
            question: "11. <strong>A:</strong> Did you study for tomorrow's exam?<br><strong>B:</strong> Yes, but I __________ dedicate more time to it this afternoon.",
            options: [
                { id: 'opt11a', text: "should" },
                { id: 'opt11b', text: "need" },
                { id: 'opt11c', text: "used to" },
                { id: 'opt11d', text: "have" }
            ],
            correctAnswerId: 'opt11a',
            explanation: "'Should' expressa uma recomendação ou obrigação leve.",
            youtubeVideoId: null
        },
        {
            id: 'q12',
            type: 'grammar',
            topic: 'used_to',
            question: "12. <strong>A:</strong> Did you play any instrument when you were younger?<br><strong>B:</strong> Yes, I __________ play the piano regularly.",
            options: [
                { id: 'opt12a', text: "used to" },
                { id: 'opt12b', text: "am used to" },
                { id: 'opt12c', text: "use to" },
                { id: 'opt12d', text: "using to" }
            ],
            correctAnswerId: 'opt12a',
            explanation: "'Used to' é usado para hábitos ou estados passados que não são mais verdadeiros.",
            youtubeVideoId: null
        },
        {
            id: 'q13',
            type: 'dialogue',
            topic: 'time',
            question: "13. <strong>A:</strong> What time is the meeting today?<br><strong>B:</strong> __________.",
            options: [
                { id: 'opt13a', text: "Sometimes in the morning" },
                { id: 'opt13b', text: "It's only at 3 p.m." },
                { id: 'opt13c', text: "Sorry, I did that" },
                { id: 'opt13d', text: "It's the same place" }
            ],
            correctAnswerId: 'opt13b',
            explanation: "A resposta 'It's only at 3 p.m.' é a única que responde diretamente à pergunta sobre o horário da reunião.",
            youtubeVideoId: null
        },
        {
            id: 'q14',
            type: 'dialogue',
            topic: 'directions',
            question: "14. <strong>A:</strong> Where should I put the package?<br><strong>B:</strong> __________.",
            options: [
                { id: 'opt14a', text: "I like the blue one" },
                { id: 'opt14b', text: "Next to the door" },
                { id: 'opt14c', text: "Because it's heavy" },
                { id: 'opt14d', text: "Here. Help me." }
            ],
            correctAnswerId: 'opt14b',
            explanation: "'Next to the door' indica o local onde o pacote deve ser colocado.",
            youtubeVideoId: null
        },
        {
            id: 'q15',
            type: 'grammar',
            topic: 'superlatives',
            question: "15. Could you recommend a good movie for me to watch this weekend?",
            options: [
                { id: 'opt15a', text: "'Inception' is the most exciting movie ever!" },
                { id: 'opt15b', text: "'Inception' is the more exciting movie ever!" },
                { id: 'opt15c', text: "'Inception' is more excitingest movie ever!" },
                { id: 'opt15d', text: "'Inception' is more exciting movie ever!" }
            ],
            correctAnswerId: 'opt15a',
            explanation: "Para superlativos com adjetivos longos, usa-se 'the most + adjective'.",
            youtubeVideoId: null
        },
        {
            id: 'q16',
            type: 'dialogue',
            topic: 'conditionals',
            question: "16. Why are you bringing an umbrella in a sunny day?",
            options: [
                { id: 'opt16a', text: "If it rained, I would need the umbrella." },
                { id: 'opt16b', text: "Sunny days make me happy." },
                { id: 'opt16c', text: "Only because it's sunny." },
                { id: 'opt16d', text: "Weather forecasts are usually accurate." }
            ],
            correctAnswerId: 'opt16a',
            explanation: "A resposta usa um condicional para explicar a precaução.",
            youtubeVideoId: null
        },
        {
            id: 'q17',
            type: 'dialogue',
            topic: 'future_continuous',
            question: "17. What will you be doing next Friday?",
            options: [
                { id: 'opt17a', text: "I will be studying for my exams." },
                { id: 'opt17b', text: "My boyfriend never goes to my house this day." },
                { id: 'opt17c', text: "I will play tennis every day." },
                { id: 'opt17d', text: "My mom likes to go to parks." }
            ],
            correctAnswerId: 'opt17a',
            explanation: "A resposta 'I will be studying for my exams' usa o Future Continuous para descrever uma ação em progresso em um ponto futuro.",
            youtubeVideoId: null
        },
        {
            id: 'q18',
            type: 'grammar',
            topic: 'conditionals',
            question: "18. Why didn't you invest in that tech company a few years ago? Now it's one of the most important in the world.",
            options: [
                { id: 'opt18a', text: "Had I been aware of it, I'll invest for sure." },
                { id: 'opt18b', text: "If I had the knowledge, I invest earlier." },
                { id: 'opt18c', text: "If I had known, I would have invested." },
                { id: 'opt18d', text: "If I know about it, I will invest next time." }
            ],
            correctAnswerId: 'opt18c',
            explanation: "Esta é uma frase condicional de Tipo 3, usada para situações hipotéticas no passado. A estrutura é 'If + Past Perfect, would have + Past Participle'.",
            youtubeVideoId: null
        },
        {
            id: 'q19',
            type: 'dialogue',
            topic: 'tag_questions',
            question: "19. I don't know what to wear to the party.",
            options: [
                { id: 'opt19a', text: "Your friends always borrow you their clothes, don't they?" },
                { id: 'opt19b', text: "We need to get there on time for her birthday, don't we?" },
                { id: 'opt19c', text: "You'd better decide quickly. We don't want to be late, do we?" },
                { id: 'opt19d', text: "You could've asked your parents to pick you up earlier, couldn't you?" }
            ],
            correctAnswerId: 'opt19c',
            explanation: "A opção 'You'd better decide quickly. We don't want to be late, do we?' é a mais relevante e usa uma 'tag question' apropriada para a situação.",
            youtubeVideoId: null
        },
        {
            id: 'q20',
            type: 'dialogue',
            topic: 'past_events',
            question: "20. I couldn't make it to the meeting because I needed to fix my car.",
            options: [
                { id: 'opt20a', text: "We could find someone to fix it for you next time." },
                { id: 'opt20b', text: "I can't help you with that, because I was traveling." },
                { id: 'opt20c', text: "You can ask for help if you needed." },
                { id: 'opt20d', text: "In the past, public transportation are able to be a good option." }
            ],
            correctAnswerId: 'opt20a',
            explanation: "A opção 'We could find someone to fix it for you next time.' oferece uma solução ou conselho para uma situação futura similar.",
            youtubeVideoId: null
        },
        {
            id: 'q21',
            type: 'dialogue',
            topic: 'advice',
            question: "21. I don't know what to read during my vacation.",
            options: [
                { id: 'opt21a', text: "Your parents must have a few books at home." },
                { id: 'opt21b', text: "I think you have little time for reading." },
                { id: 'opt21c', text: "I need a few comic books for my sister, maybe you could help me." },
                { id: 'opt21d', text: "My brother has little will to read, either." }
            ],
            correctAnswerId: 'opt21a',
            explanation: "A opção 'Your parents must have a few books at home.' oferece uma sugestão direta e útil para a situação.",
            youtubeVideoId: null
        },
        {
            id: 'q22',
            type: 'vocabulary',
            topic: 'verbs',
            question: "22. We could feel the captivating melody of the orchestra ____________ through the concert hall.",
            options: [
                { id: 'opt22a', text: "resounding" },
                { id: 'opt22b', text: "envisioning" },
                { id: 'opt22c', text: "dissolving" }
            ],
            correctAnswerId: 'opt22a',
            explanation: "'Resounding' significa ecoar ou soar fortemente, o que se encaixa no contexto de uma melodia em um salão de concertos.",
            youtubeVideoId: null
        },
        {
            id: 'q23',
            type: 'vocabulary',
            topic: 'verbs',
            question: "23. He ________ a new language during his sabbatical in Europe.",
            options: [
                { id: 'opt23a', text: "learned" },
                { id: 'opt23b', text: "developed" },
                { id: 'opt23c', text: "achieved" }
            ],
            correctAnswerId: 'opt23a',
            explanation: "'Learned' (aprender) é o verbo mais apropriado para adquirir uma nova língua.",
            youtubeVideoId: null
        },
        {
            id: 'q24',
            type: 'vocabulary',
            topic: 'verbs',
            question: "24. Make sure you ________ all the ingredients before you start cooking.",
            options: [
                { id: 'opt24a', text: "gather" },
                { id: 'opt24b', text: "compile" },
                { id: 'opt24c', text: "accumulate" }
            ],
            correctAnswerId: 'opt24a',
            explanation: "'Gather' (reunir, coletar) é o verbo mais comum e adequado para ingredientes antes de cozinhar.",
            youtubeVideoId: null
        },
        {
            id: 'q25',
            type: 'vocabulary',
            topic: 'verbs',
            question: "25. Last night, my friends laughed so loudly that it ________ through the apartment, awakening my neighbors.",
            options: [
                { id: 'opt25a', text: "echoed" },
                { id: 'opt25b', text: "vanished" },
                { id: 'opt25c', text: "criticized" }
            ],
            correctAnswerId: 'opt25a',
            explanation: "'Echoed' (ecoou) descreve o som se espalhando e sendo repetido, o que se encaixa no contexto de risadas altas.",
            youtubeVideoId: null
        },
        {
            id: 'q26',
            type: 'vocabulary',
            topic: 'verbs',
            question: "26. It's essential to ________ the historical significance of the artwork during the museum tour.",
            options: [
                { id: 'opt26a', text: "seize" },
                { id: 'opt26b', text: "comprehend" },
                { id: 'opt26c', text: "grasp" }
            ],
            correctAnswerId: 'opt26c',
            explanation: "'Grasp' (compreender, entender profundamente) é o verbo mais adequado para entender a significância de algo.",
            youtubeVideoId: null
        },
        {
            id: 'q27',
            type: 'vocabulary',
            topic: 'verbs',
            question: "27. It's important to ________ your plants regularly to help them grow strong and healthy.",
            options: [
                { id: 'opt27a', text: "inspect" },
                { id: 'opt27b', text: "check" },
                { id: 'opt27c', text: "examine" }
            ],
            correctAnswerId: 'opt27a',
            explanation: "'Inspect' (inspecionar) é o verbo mais apropriado para observar e verificar a condição das plantas.",
            youtubeVideoId: null
        },
        {
            id: 'q28',
            type: 'vocabulary',
            topic: 'verbs',
            question: "28. The delicious aroma of freshly baked cookies is ________ throughout the entire kitchen.",
            options: [
                { id: 'opt28a', text: "awaiting" },
                { id: 'opt28b', text: "spreading" },
                { id: 'opt28c', text: "concerning" }
            ],
            correctAnswerId: 'opt28b',
            explanation: "'Spreading' (espalhando-se) descreve o aroma se difundindo pelo ambiente.",
            youtubeVideoId: null
        },
        // --- Perguntas de Listening (29 a 40) ---
        {
            id: 'q29',
            type: 'listening',
            topic: 'dialogue_response',
            question: "29. Listen to Speaker #1 and choose the best option for what comes next in the conversation.<br>Speaker #1: \"Have you ever been to a music festival?\"",
            options: [
                { id: 'opt29a', text: "Yes, I love rock concerts!" },
                { id: 'opt29b', text: "I have a few friends who play instruments." },
                { id: 'opt29c', text: "I usually stay at home during the weekends." },
                { id: 'opt29d', text: "Last year, I bought a new guitar." }
            ],
            correctAnswerId: 'opt29a',
            explanation: "A opção 'Yes, I love rock concerts!' é a resposta mais direta e relevante à pergunta sobre ter ido a um festival de música.",
            youtubeVideoId: 'VV9kKLnESj0' // ID do vídeo para esta pergunta
        },
        {
            id: 'q30',
            type: 'listening',
            topic: 'dialogue_response',
            question: "30. Listen to Speaker #2 and choose the best option for what comes next in the conversation.<br>Speaker #2: \"How do you usually unwind after a long day at work?\"",
            options: [
                { id: 'opt30a', text: "I love drinking wine to relax after I get home." },
                { id: 'opt30b', text: "A cup of tea and soft music help me to sleep well." },
                { id: 'opt30c', text: "My mom cooks dinner for me almost every night." },
                { id: 'opt30d', text: "The boss at my company likes to hold meetings late at night." }
            ],
            correctAnswerId: 'opt30b',
            explanation: "A opção 'A cup of tea and soft music help me to sleep well.' descreve uma forma comum de relaxar após um dia cansativo.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q31',
            type: 'listening',
            topic: 'dialogue_response',
            question: "31. Listen to Speaker #3 and choose the best option for what comes next in the conversation.<br>Speaker #3: “How do you study to do so well in the exams?”",
            options: [
                { id: 'opt31a', text: "I never attend classes." },
                { id: 'opt31b', text: "I sleep early every day." },
                { id: 'opt31c', text: "I create a study schedule and review my notes regularly." },
                { id: 'opt31d', text: "I enjoy playing sports after exams." }
            ],
            correctAnswerId: 'opt31c',
            explanation: "A opção 'I create a study schedule and review my notes regularly.' é uma resposta direta e lógica sobre como estudar bem para exames.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q32',
            type: 'listening',
            topic: 'dialogue_response',
            question: "32. Listen to Speaker #4 and choose the best option for what comes next in the conversation.<br>Speaker #4: “I've been practicing the guitar every day for the past six months, but I still can't play an entire song.”",
            options: [
                { id: 'opt32a', text: "That's great! You must be an expert at playing songs now." },
                { id: 'opt32b', text: "Maybe you're just not cut out for music. Why don't you try something else?" },
                { id: 'opt32c', text: "I hope you're not dedicating too much time to it." },
                { id: 'opt32d', text: "You need to practice your cooking skills more." }
            ],
            correctAnswerId: 'opt32b', // Esta é uma resposta um pouco desanimadora, mas é a que melhor se encaixa como uma continuação possível de uma conversa frustrada.
            explanation: "A opção 'Maybe you're just not cut out for music. Why don't you try something else?' reflete uma possível resposta a uma frustração com a falta de progresso, sugerindo uma alternativa.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q33',
            type: 'listening',
            topic: 'dialogue_response',
            question: "33. Listen to Speaker #5 and choose the best option for what comes next in the conversation.<br>Speaker #5: “You look exhausted, did you have a long day at work?”",
            options: [
                { id: 'opt33a', text: "I bought a new book to read." },
                { id: 'opt33b', text: "I had meetings all day." },
                { id: 'opt33c', text: "I'm thinking of planning a vacation soon." },
                { id: 'opt33d', text: "I love going to the gym after work." }
            ],
            correctAnswerId: 'opt33b',
            explanation: "A opção 'I had meetings all day.' explica o motivo do cansaço, respondendo diretamente à pergunta sobre um dia longo de trabalho.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q34',
            type: 'listening',
            topic: 'dialogue_response',
            question: "34. Listen to Speaker #6 and choose the best option for what comes next in the conversation.<br>Speaker #6: “Mom, you won't believe what happened to me on the way to the grocery store!”",
            options: [
                { id: 'opt34a', text: "I'm not a fan of shopping for groceries." },
                { id: 'opt34b', text: "Tell me all about it when you get home." },
                { id: 'opt34c', text: "I have a dentist appointment next week." },
                { id: 'opt34d', text: "I've been trying a new recipe lately." }
            ],
            correctAnswerId: 'opt34b',
            explanation: "A opção 'Tell me all about it when you get home.' é uma resposta natural de uma mãe curiosa para saber o que aconteceu.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q35',
            type: 'listening',
            topic: 'dialogue_response',
            question: "35. Listen to Speaker #7 and choose the best option for what comes next in the conversation.<br>Speaker #7: “Guess what, I finally passed my driving test.”",
            options: [
                { id: 'opt35a', text: "I'm planning a road trip for next month." },
                { id: 'opt35b', text: "I bought a new bicycle recently." },
                { id: 'opt35c', text: "Congratulations! How was the test?" },
                { id: 'opt35d', text: "I prefer using public transportation." }
            ],
            correctAnswerId: 'opt35c',
            explanation: "A opção 'Congratulations! How was the test?' é uma resposta comum e apropriada para a notícia de alguém que passou em um teste.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q36',
            type: 'listening',
            topic: 'comprehension',
            question: "36. Listen to the audio in the video. Then, answer the questions below:<br>What does the speaker highlight as a significant consequence of the digital era's influence on society?",
            options: [
                { id: 'opt36a', text: "The increasing integration of artificial intelligence." },
                { id: 'opt36b', text: "The need for constant reassessment of our relationship with technology." },
                { id: 'opt36c', text: "The decline of traditional forms of communication." }
            ],
            correctAnswerId: 'opt36b',
            explanation: "O áudio enfatiza a necessidade de 'figurar onde estamos com a tecnologia e que tipo de relacionamento queremos ter com ela', indicando uma reavaliação constante.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q37',
            type: 'listening',
            topic: 'comprehension',
            question: "37. Listen to the audio in the video. Then, answer the questions below:<br>What is the speaker's attitude towards the concept of a circular economy in the audio?",
            options: [
                { id: 'opt37a', text: "Enthusiastic, considering it a crucial aspect of responsible global citizenship." },
                { id: 'opt37b', text: "Skeptical, thinking it does not have a significant impact on environmental issues." },
                { id: 'opt37c', text: "Indifferent, as they believe it is just a passing trend." }
            ],
            correctAnswerId: 'opt37a',
            explanation: "O áudio descreve a economia circular como 'ganhando força' e 'um aspecto crucial do que significa ser um cidadão global responsável', mostrando entusiasmo.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q38',
            type: 'listening',
            topic: 'comprehension',
            question: "38. Listen to the audio in the video. Then, answer the questions below:<br>How does the speaker describe the transformation in traditional workplace dynamics?",
            options: [
                { id: 'opt38a', text: "Expressing concerns about the isolation of employees in remote work settings." },
                { id: 'opt38b', text: "Highlighting a shift towards flexible and remote work arrangements." },
                { id: 'opt38c', text: "Indicating that it leads to a decline in effective communication." }
            ],
            correctAnswerId: 'opt38b',
            explanation: "O áudio menciona 'flexibilidade e trabalho remoto' como 'partes integrantes' da evolução do local de trabalho, indicando uma mudança para esses arranjos.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q39',
            type: 'listening',
            topic: 'vocabulary',
            question: "39. Listen to the audio in the video. Then, answer the questions below:<br>What does the expression \"putting up with each other\" mean?",
            options: [
                { id: 'opt39a', text: "Tolerating and accepting each other despite differences." },
                { id: 'opt39b', text: "Embracing and celebrating each other's differences." },
                { id: 'opt39c', text: "Physically putting up various objects as a symbol of unity." }
            ],
            correctAnswerId: 'opt39a',
            explanation: "No contexto do áudio, 'putting up with each other' refere-se a tolerar e aceitar as diferenças, em contraste com 'apreciar a mistura de tradições'.",
            youtubeVideoId: 'HwxcY1Ij__Q' // Placeholder, substitua pelo ID correto
        },
        {
            id: 'q40',
            type: 'listening',
            topic: 'comprehension',
            question: "40. Listen to the audio in the video. Then, answer the questions below:<br>What does the speaker mean by \"without messing everything up\"?",
            options: [
                { id: 'opt40a', text: "Experimenting with technology without considering the potential risks." },
                { id: 'opt40b', text: "Introducing groundbreaking technologies without any consequences." },
                { id: 'opt40c', text: "Utilizing transformative technologies responsibly and ethically." }
            ],
            correctAnswerId: 'opt40c',
            explanation: "A frase 'thinking hard about what we're doing' e 'figuring out the right way to use these game-changing tools' sugere um uso responsável e ético para evitar 'messing everything up'.",
            youtubeVideoId: 'HwxcY1Ij__Q' // ID do vídeo para esta pergunta
        }
    ];

    // --- Funções de Controle de Tela ---
    function showScreen(screenElement) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        screenElement.classList.remove('hidden');
        // Garante que o scroll volte ao topo ao mudar de tela
        window.scrollTo(0, 0);
    }

    // --- Event Listeners para Navegação ---
    startButton.addEventListener('click', () => {
        showScreen(nameSection);
    });

    // Adiciona evento de 'Enter' para o botão 'Iniciar'
    document.addEventListener('keydown', (event) => {
        if (!introSection.classList.contains('hidden') && event.key === 'Enter') {
            event.preventDefault();
            startButton.click();
        }
    });

    firstNameInput.addEventListener('input', () => {
        nextNameButton.disabled = firstNameInput.value.trim() === '';
    });

    nextNameButton.addEventListener('click', () => {
        userData.firstName = firstNameInput.value.trim();
        lastNameQuestion.innerHTML = `Olá, <strong>${userData.firstName}</strong>! Qual é o seu sobrenome?`;
        showScreen(lastNameSection);
    });

    document.addEventListener('keydown', (event) => {
        if (!nameSection.classList.contains('hidden') && event.key === 'Enter' && !nextNameButton.disabled) {
            event.preventDefault();
            nextNameButton.click();
        }
    });

    lastNameInput.addEventListener('input', () => {
        nextLastNameButton.disabled = lastNameInput.value.trim() === '';
    });

    nextLastNameButton.addEventListener('click', () => {
        userData.lastName = lastNameInput.value.trim();
        proficiencyQuestion.innerHTML = `Olá, <strong>${userData.firstName} ${userData.lastName}</strong>! Qual é o seu nível de proficiência em inglês?`;
        showScreen(proficiencySection);
    });

    document.addEventListener('keydown', (event) => {
        if (!lastNameSection.classList.contains('hidden') && event.key === 'Enter' && !nextLastNameButton.disabled) {
            event.preventDefault();
            nextLastNameButton.click();
        }
    });

    proficiencyOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            proficiencyOptionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            userData.proficiencyLevel = button.dataset.level;
            nextProficiencyButton.disabled = false;
        });
    });

    document.addEventListener('keydown', (event) => {
        if (!proficiencySection.classList.contains('hidden') && event.key === 'Enter' && !nextProficiencyButton.disabled) {
            event.preventDefault();
            nextProficiencyButton.click();
        }
    });

    nextProficiencyButton.addEventListener('click', () => {
        preparationMessage.innerHTML = `Seu teste irá começar.<br>Prepare-se! &#128077;`;
        showScreen(preparationSection);
    });

    startQuizButton.addEventListener('click', () => {
        showScreen(quizSection);
        loadQuestion();
    });

    document.addEventListener('keydown', (event) => {
        if (!preparationSection.classList.contains('hidden') && event.key === 'Enter') {
            event.preventDefault();
            startQuizButton.click();
        }
    });


    // --- Lógica do Quiz ---

    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        questionText.innerHTML = question.question; // Usamos innerHTML para renderizar as tags HTML na pergunta
        optionsContainer.innerHTML = '';

        // Lógica para o YouTube Player
        if (question.youtubeVideoId) {
            // Inicializa a contagem de reproduções para o vídeo atual se ainda não existir
            if (!videoPlayCounts[question.youtubeVideoId]) {
                videoPlayCounts[question.youtubeVideoId] = 0;
            }

            // Se o vídeo já foi reproduzido 2 vezes, exibe o overlay
            if (videoPlayCounts[question.youtubeVideoId] >= 2) {
                disableVideoPlayer(true); // Passa true para indicar que o limite foi atingido
                return; // Sai da função para não tentar carregar o player
            }

            // Se o vídeo atual é diferente do anterior ou não há player, cria um novo
            // Ou se o player não existe ainda
            if (!player || currentVideoId !== question.youtubeVideoId) {
                youtubeVideoContainer.innerHTML = `<div id="youtube-player"></div>`; // Div para o player
                currentVideoId = question.youtubeVideoId;
                // videoPlayedOnce = false; // Não precisamos mais dessa flag global, a contagem por vídeo é mais precisa

                // Verifica se a API do YouTube está pronta antes de criar o player
                if (typeof YT !== 'undefined' && YT.Player) {
                    player = new YT.Player('youtube-player', {
                        videoId: question.youtubeVideoId,
                        playerVars: {
                            'autoplay': 0,
                            'controls': 0, // Remove os controles do player
                            'modestbranding': 1, // Remove o logo do YouTube
                            'rel': 0, // Não mostra vídeos relacionados ao final
                            'showinfo': 0 // Não mostra título do vídeo e informações do uploader
                        },
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange
                        }
                    });
                } else {
                    // Se a API ainda não está pronta, tenta novamente após um pequeno atraso
                    // ou exibe uma mensagem de erro/carregamento
                    console.warn("API do YouTube não está pronta. Tentando novamente...");
                    setTimeout(loadQuestion, 500); // Tenta carregar a questão novamente
                    return; // Sai da função para evitar processamento duplicado
                }
            } else {
                // Se o mesmo vídeo está sendo carregado novamente e ainda não atingiu o limite
                // Garante que o player esteja visível e funcional
                youtubeVideoContainer.innerHTML = `<div id="youtube-player"></div>`; // Recria o div para o player
                if (typeof YT !== 'undefined' && YT.Player) {
                    player = new YT.Player('youtube-player', {
                        videoId: question.youtubeVideoId,
                        playerVars: {
                            'autoplay': 0,
                            'controls': 0,
                            'modestbranding': 1,
                            'rel': 0,
                            'showinfo': 0
                        },
                        events: {
                            'onReady': onPlayerReady,
                            'onStateChange': onPlayerStateChange
                        }
                    });
                }
            }
            youtubeVideoContainer.style.display = 'block';
        } else {
            // Se não há vídeo, garante que o container esteja vazio e oculto
            youtubeVideoContainer.innerHTML = '';
            youtubeVideoContainer.style.display = 'none';
            player = null; // Reseta o player
            currentVideoId = null;
            // videoPlayedOnce = false; // Não precisamos mais dessa flag global
        }

        const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const shuffledOptions = shuffleArray([...question.options]);

        shuffledOptions.forEach((option, index) => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.dataset.optionId = option.id;
            button.addEventListener('click', () => selectOption(option.id));

            const letterSpan = document.createElement('span');
            letterSpan.classList.add('option-letter');
            letterSpan.textContent = optionLetters[index];

            const textSpan = document.createElement('span');
            textSpan.classList.add('option-text');
            textSpan.textContent = option.text;

            button.appendChild(letterSpan);
            button.appendChild(textSpan);
            optionsContainer.appendChild(button);
        });

        if (userAnswers[currentQuestionIndex]) {
            const selectedOptionButton = optionsContainer.querySelector(`[data-option-id="${userAnswers[currentQuestionIndex]}"]`);
            if (selectedOptionButton) {
                selectedOptionButton.classList.add('selected');
            }
        }

        updateProgressBar();
        updateNavigationButtons();
    }

    // Funções da API do YouTube Player
    function onPlayerReady(event) {
        // O vídeo está pronto para ser reproduzido.
        // Adiciona um event listener para o clique no iframe para iniciar a reprodução
        // Isso é necessário porque 'controls: 0' impede o clique direto no player para iniciar
        event.target.getIframe().addEventListener('click', () => {
            if (player && player.getPlayerState() !== YT.PlayerState.PLAYING && videoPlayCounts[currentVideoId] < 2) {
                player.playVideo();
            }
        });
    }

    function onPlayerStateChange(event) {
        // YT.PlayerState.ENDED (0) - O vídeo terminou
        // YT.PlayerState.PLAYING (1) - O vídeo está tocando
        // YT.PlayerState.PAUSED (2) - O vídeo está pausado
        if (event.data === YT.PlayerState.ENDED) {
            if (currentVideoId) {
                videoPlayCounts[currentVideoId]++; // Incrementa a contagem de reproduções
                if (videoPlayCounts[currentVideoId] >= 2) {
                    disableVideoPlayer(true); // Limite atingido
                } else {
                    disableVideoPlayer(false); // Permite mais uma reprodução
                }
            }
        } else if (event.data === YT.PlayerState.PLAYING) {
            // O vídeo começou a tocar
            // Remove qualquer overlay temporário se houver
            const overlay = youtubeVideoContainer.querySelector('.video-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }

    function disableVideoPlayer(limitReached) {
        if (youtubeVideoContainer) {
            let message = limitReached ? "Limite de reproduções atingido." : "Vídeo já reproduzido uma vez.";
            youtubeVideoContainer.innerHTML = `
                <div class="video-overlay">
                    <p>${message}</p>
                </div>
            `;
            player = null; // Reseta o player
        }
    }


    function selectOption(optionId) {
        optionsContainer.querySelectorAll('.option-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        const selectedButton = optionsContainer.querySelector(`[data-option-id="${optionId}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
        userAnswers[currentQuestionIndex] = optionId;
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBarFill.style.width = `${progress}%`;
        progressText.textContent = `Questão ${currentQuestionIndex + 1} de ${questions.length}`;
    }

    function updateNavigationButtons() {
        nextButton.textContent = currentQuestionIndex === questions.length - 1 ? 'Finalizar Teste' : 'Próxima';
    }

    function calculateResults() {
        score = 0;
        const incorrectQuestions = [];

        questions.forEach((q, index) => {
            const userAnswer = userAnswers[index];
            const originalCorrectOption = q.options.find(opt => opt.id === q.correctAnswerId);

            if (userAnswer === originalCorrectOption.id) {
                score++;
            } else {
                const userAnswerText = q.options.find(opt => opt.id === userAnswer)?.text || "Não respondida";
                const correctAnswerText = originalCorrectOption.text;

                incorrectQuestions.push({
                    question: q.question,
                    userAnswer: userAnswerText,
                    correctAnswer: correctAnswerText,
                    explanation: q.explanation,
                    type: q.type,
                    topic: q.topic
                });
            }
        });

        displayResults(incorrectQuestions);
    }

    function displayResults(incorrectQuestions) {
        showScreen(resultsSection);

        scoreDisplay.textContent = score;
        totalQuestionsDisplay.textContent = questions.length;

        let level = '';
        if (score === questions.length) {
            level = 'C2 - Proficiência';
        } else if (score >= questions.length * 0.8) {
            level = 'C1 - Avançado';
        } else if (score >= questions.length * 0.6) {
            level = 'B2 - Intermediário Superior';
        } else if (score >= questions.length * 0.4) {
            level = 'B1 - Intermediário';
        } else if (score >= questions.length * 0.2) {
            level = 'A2 - Básico Superior';
        } else {
            level = 'A1 - Básico';
        }
        levelDisplay.textContent = level;

        detailedFeedback.innerHTML = '';
        if (incorrectQuestions.length === 0) {
            detailedFeedback.innerHTML = '<p>Parabéns! Você acertou todas as questões.</p>';
        } else {
            incorrectQuestions.forEach(item => {
                const feedbackItem = document.createElement('div');
                feedbackItem.classList.add('feedback-item');
                feedbackItem.innerHTML = `
                    <p class="question-feedback"><strong>Questão:</strong> ${item.question}</p>
                    <p class="user-answer-feedback"><strong>Sua resposta:</strong> ${item.userAnswer}</p>
                    <p class="correct-answer-feedback"><strong>Resposta correta:</strong> ${item.correctAnswer}</p>
                    <p class="explanation-feedback"><strong>Explicação:</strong> ${item.explanation}</p>
                    <p><strong>Tipo:</strong> ${item.type} | <strong>Tópico:</strong> ${item.topic}</p>
                `;
                detailedFeedback.appendChild(feedbackItem);
            });
        }
    }

    nextButton.addEventListener('click', () => {
        if (userAnswers[currentQuestionIndex] === null) {
            alert('Por favor, selecione uma opção antes de prosseguir.');
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            calculateResults();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (!quizSection.classList.contains('hidden') && event.key === 'Enter' && !nextButton.disabled) {
            event.preventDefault();
            nextButton.click();
        }
    });


    restartButton.addEventListener('click', () => {
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        score = 0;
        userData = { firstName: '', lastName: '', proficiencyLevel: '' };
        firstNameInput.value = '';
        lastNameInput.value = '';
        proficiencyOptionButtons.forEach(btn => btn.classList.remove('selected'));
        nextNameButton.disabled = true;
        nextLastNameButton.disabled = true;
        nextProficiencyButton.disabled = true;

        // Resetar a contagem de reproduções dos vídeos ao reiniciar o teste
        videoPlayCounts = {};

        showScreen(introSection);
    });

    document.addEventListener('keydown', (event) => {
        if (!resultsSection.classList.contains('hidden') && event.key === 'Enter' && !restartButton.disabled) {
            event.preventDefault();
            restartButton.click();
        }
    });

    // Inicia na tela de introdução
    showScreen(introSection);
});