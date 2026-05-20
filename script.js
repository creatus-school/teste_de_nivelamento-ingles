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
    const mediaContainer = document.getElementById('media-container'); // Container para o reprodutor de mídia nativo
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

    // Variáveis para o controle do reprodutor nativo
    let currentMediaElement = null; // O elemento <audio> ou <video> atual
    const MAX_PLAYS = 2; // Limite de reproduções por mídia
    const mediaPlayCounts = {}; // { 'mediaPath': 0 } - Armazena a contagem de reproduções
    let currentMediaPath = null; // Caminho do arquivo de mídia atual

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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
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
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q15',
            type: 'grammar',
            topic: 'superlatives',
            question: "15. This is __________ book I've ever read.",
            options: [
                { id: 'opt15a', text: "the most interesting" },
                { id: 'opt15b', text: "more interesting" },
                { id: 'opt15c', text: "most interesting" },
                { id: 'opt15d', text: "the interesting" }
            ],
            correctAnswerId: 'opt15a',
            explanation: "Para superlativos com adjetivos longos, usa-se 'the most + adjetivo'.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q16',
            type: 'grammar',
            topic: 'conditionals',
            question: "16. If I __________ more time, I would travel the world.",
            options: [
                { id: 'opt16a', text: "had" },
                { id: 'opt16b', text: "have" },
                { id: 'opt16c', text: "would have" },
                { id: 'opt16d', text: "will have" }
            ],
            correctAnswerId: 'opt16a',
            explanation: "Esta é uma Second Conditional (situação hipotética no presente), que usa Past Simple na cláusula 'if'.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q17',
            type: 'vocabulary',
            topic: 'phrasal_verbs',
            question: "17. I need to __________ my old clothes to charity.",
            options: [
                { id: 'opt17a', text: "give up" },
                { id: 'opt17b', text: "give away" },
                { id: 'opt17c', text: "give in" },
                { id: 'opt17d', text: "give out" }
            ],
            correctAnswerId: 'opt17b',
            explanation: "'Give away' significa doar ou dar algo gratuitamente.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q18',
            type: 'grammar',
            topic: 'passive_voice',
            question: "18. The new bridge __________ last year.",
            options: [
                { id: 'opt18a', text: "built" },
                { id: 'opt18b', text: "was built" },
                { id: 'opt18c', text: "has built" },
                { id: 'opt18d', text: "is built" }
            ],
            correctAnswerId: 'opt18b',
            explanation: "A voz passiva no Past Simple é 'was/were + past participle'.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q19',
            type: 'vocabulary',
            topic: 'idioms',
            question: "19. It's raining cats and dogs, so we should __________.",
            options: [
                { id: 'opt19a', text: "go for a walk" },
                { id: 'opt19b', text: "stay home" },
                { id: 'opt19c', text: "play outside" },
                { id: 'opt19d', text: "open the window" }
            ],
            correctAnswerId: 'opt19b',
            explanation: "'Raining cats and dogs' significa chover muito forte, então o ideal é 'stay home'.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q20',
            type: 'dialogue',
            topic: 'suggestions',
            question: "20. <strong>A:</strong> I couldn't go to work yesterday because I needed to fix my car.<br><strong>B:</strong> __________.",
            options: [
                { id: 'opt20a', text: "We could find someone to fix it for you next time." },
                { id: 'opt20b', text: "I can't help you with that, because I was traveling." },
                { id: 'opt20c', text: "You can ask for help if you needed." },
                { id: 'opt20d', text: "In the past, public transportation are able to be a good option." }
            ],
            correctAnswerId: 'opt20a',
            explanation: "A frase 'We could find someone to fix it for you next time' oferece uma solução futura usando 'could'.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q21',
            type: 'grammar',
            topic: 'quantifiers',
            question: "21. There isn't __________ milk left in the fridge.",
            options: [
                { id: 'opt21a', text: "many" },
                { id: 'opt21b', text: "a few" },
                { id: 'opt21c', text: "any" },
                { id: 'opt21d', text: "some" }
            ],
            correctAnswerId: 'opt21c',
            explanation: "'Any' é usado em frases negativas e interrogativas com substantivos incontáveis.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q22',
            type: 'grammar',
            topic: 'reported_speech',
            question: "22. She said that she __________ happy to see him.",
            options: [
                { id: 'opt22a', text: "is" },
                { id: 'opt22b', text: "was" },
                { id: 'opt22c', text: "will be" },
                { id: 'opt22d', text: "can be" }
            ],
            correctAnswerId: 'opt22b',
            explanation: "No Reported Speech, o Present Simple ('is') muda para Past Simple ('was').",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q23',
            type: 'vocabulary',
            topic: 'adverbs',
            question: "23. He drives very __________.",
            options: [
                { id: 'opt23a', text: "quick" },
                { id: 'opt23b', text: "quickly" },
                { id: 'opt23c', text: "fastly" },
                { id: 'opt23d', text: "good" }
            ],
            correctAnswerId: 'opt23b',
            explanation: "'Quickly' é o advérbio que modifica o verbo 'drives'.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q24',
            type: 'grammar',
            topic: 'relative_clauses',
            question: "24. This is the book __________ I told you about.",
            options: [
                { id: 'opt24a', text: "who" },
                { id: 'opt24b', text: "which" },
                { id: 'opt24c', text: "whose" },
                { id: 'opt24d', text: "where" }
            ],
            correctAnswerId: 'opt24b',
            explanation: "'Which' é usado para se referir a coisas.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q25',
            type: 'vocabulary',
            topic: 'collocations',
            question: "25. I need to __________ a decision about my future soon.",
            options: [
                { id: 'opt25a', text: "do" },
                { id: 'opt25b', text: "make" },
                { id: 'opt25c', text: "take" },
                { id: 'opt25d', text: "have" }
            ],
            correctAnswerId: 'opt25b',
            explanation: "A colocation correta é 'make a decision'.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q26',
            type: 'vocabulary',
            topic: 'verbs',
            question: "26. It's difficult to __________ the meaning of this complex text.",
            options: [
                { id: 'opt26a', text: "catch" },
                { id: 'opt26b', text: "comprehend" },
                { id: 'opt26c', text: "grasp" }
            ],
            correctAnswerId: 'opt26b',
            explanation: "'Comprehend' (compreender) é o verbo mais adequado para entender o significado de algo.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q27',
            type: 'vocabulary',
            topic: 'verbs',
            question: "27. It's important to __________ your plants regularly to help them grow strong and healthy.",
            options: [
                { id: 'opt27a', text: "inspect" },
                { id: 'opt27b', text: "check" },
                { id: 'opt27c', text: "examine" }
            ],
            correctAnswerId: 'opt27b',
            explanation: "'Check' (verificar) é o verbo mais comum para monitorar o estado de plantas regularmente.",
            mediaPath: null,
            mediaType: null
        },
        {
            id: 'q28',
            type: 'vocabulary',
            topic: 'verbs',
            question: "28. The delicious aroma of freshly baked cookies is __________ throughout the entire kitchen.",
            options: [
                { id: 'opt28a', text: "awaiting" },
                { id: 'opt28b', text: "spreading" },
                { id: 'opt28c', text: "concerning" }
            ],
            correctAnswerId: 'opt28b',
            explanation: "'Spreading' (espalhando) descreve o aroma se difundindo pela cozinha.",
            mediaPath: null,
            mediaType: null
        },
        // --- PERGUNTAS DE LISTENING (Teste_de_nivelamento__ingles_3.pdf) ---
        {
            id: 'q29',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "29. Listen to Speaker #1: \"Have you ever been to a music festival?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt29a', text: "Yes, I love rock concerts!" },
                { id: 'opt29b', text: "I have a few friends who play instruments." },
                { id: 'opt29c', text: "I usually stay at home during the weekends." },
                { id: 'opt29d', text: "Last year, I bought a new guitar." }
            ],
            correctAnswerId: 'opt29a',
            explanation: "A resposta 'Yes, I love rock concerts!' é a única que responde diretamente à pergunta sobre ter ido a um festival de música, indicando uma experiência positiva com o tema.",
            mediaPath: 'media/q29.mp3', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE ÁUDIO
            mediaType: 'audio'
        },
        {
            id: 'q30',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "30. Listen to Speaker #2: \"How do you usually unwind after a long day at work?\"<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt30a', text: "I love drinking wine to relax after I get home." },
                { id: 'opt30b', text: "A cup of tea and soft music help me to sleep well." },
                { id: 'opt30c', text: "My mom cooks dinner for me almost every night." },
                { id: 'opt30d', text: "The boss at my company likes to hold meetings late at night." }
            ],
            correctAnswerId: 'opt30b',
            explanation: "A resposta 'A cup of tea and soft music help me to sleep well.' é a mais adequada para descrever como alguém relaxa após um longo dia de trabalho.",
            mediaPath: 'media/q30.mp3', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE ÁUDIO
            mediaType: 'audio'
        },
        {
            id: 'q31',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "31. Listen to Speaker #3: “How do you study to do so well in the exams?”<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt31a', text: "I never attend classes." },
                { id: 'opt31b', text: "I sleep early every day." },
                { id: 'opt31c', text: "I create a study schedule and review my notes regularly." },
                { id: 'opt31d', text: "I enjoy playing sports after exams." }
            ],
            correctAnswerId: 'opt31c',
            explanation: "A resposta 'I create a study schedule and review my notes regularly.' explica uma estratégia de estudo eficaz.",
            mediaPath: 'media/q31.mp3', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE ÁUDIO
            mediaType: 'audio'
        },
        {
            id: 'q32',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "32. Listen to Speaker #4: “I've been practicing the guitar every day for the past six months, but I still can't play an entire song.”<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt32a', text: "That's great! You must be an expert at playing songs now." },
                { id: 'opt32b', text: "Maybe you're just not cut out for music. Why don't you try something else?" },
                { id: 'opt32c', text: "I hope you're not dedicating too much time to it." },
                { id: 'opt32d', text: "You need to practice your cooking skills more." }
            ],
            correctAnswerId: 'opt32b',
            explanation: "A resposta 'Maybe you're just not cut out for music. Why don't you try something else?' é uma sugestão desanimadora, mas é a que se encaixa no contexto de frustração do Speaker #4.",
            mediaPath: 'media/q32.mp3', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE ÁUDIO
            mediaType: 'audio'
        },
        {
            id: 'q33',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "33. Listen to Speaker #5: “You look exhausted, did you have a long day at work?”<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt33a', text: "I bought a new book to read." },
                { id: 'opt33b', text: "I had meetings all day." },
                { id: 'opt33c', text: "I'm thinking of planning a vacation soon." },
                { id: 'opt33d', text: "I love going to the gym after work." }
            ],
            correctAnswerId: 'opt33b',
            explanation: "A resposta 'I had meetings all day.' explica o motivo do cansaço, respondendo à pergunta.",
            mediaPath: 'media/q33.mp3', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE ÁUDIO
            mediaType: 'audio'
        },
        {
            id: 'q34',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "34. Listen to Speaker #6: “Mom, you won't believe what happened to me on the way to the grocery store!”<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt34a', text: "I'm not a fan of shopping for groceries." },
                { id: 'opt34b', text: "Tell me all about it when you get home." },
                { id: 'opt34c', text: "I have a dentist appointment next week." },
                { id: 'opt34d', text: "I've been trying a new recipe lately." }
            ],
            correctAnswerId: 'opt34b',
            explanation: "A resposta 'Tell me all about it when you get home.' é uma reação natural e encorajadora para a exclamação da filha.",
            mediaPath: 'media/q34.mp3', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE ÁUDIO
            mediaType: 'audio'
        },
        {
            id: 'q35',
            type: 'listening',
            topic: 'conversation_continuation',
            question: "35. Listen to Speaker #7: “Guess what, I finally passed my driving test.”<br>Choose the best option for what comes next in the conversation.",
            options: [
                { id: 'opt35a', text: "I'm planning a road trip for next month." },
                { id: 'opt35b', text: "I bought a new bicycle recently." },
                { id: 'opt35c', text: "Congratulations! How was the test?" },
                { id: 'opt35d', text: "I prefer using public transportation." }
            ],
            correctAnswerId: 'opt35c',
            explanation: "A resposta 'Congratulations! How was the test?' é uma reação apropriada e de acompanhamento à notícia de ter passado no teste de direção.",
            mediaPath: 'media/q35.mp3', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE ÁUDIO
            mediaType: 'audio'
        },
        {
            id: 'q36',
            type: 'listening',
            topic: 'comprehension',
            question: "36. Listen to the audio in the video. Then, answer the questions below:<br>Audio: \"Isn’t it fascinating how technology has, like, completely woven itself into our daily lives? I mean, from smartphones—we all have one, right?—to artificial intelligence that just keeps getting more advanced. It’s wild how much it’s changing the way we see and interact with the world. And, take social media, for example. It’s not just about sharing photos anymore, is it? It’s shaping opinions, influencing politics, and connecting people all over the globe. But at the same time, we’re kind of navigating this huge digital landscape, you know? Dealing with things like privacy concerns—and let’s be real, the whole information overload thing. It’s tricky, isn’t it? Like, this constant back-and-forth, trying to figure out where we stand with technology and what kind of relationship we want to have with it. It’s definitely a conversation we need to keep having.\"<br>What does the speaker highlight as a significant consequence of the digital era's influence on society?",
            options: [
                { id: 'opt36a', text: "The increasing integration of artificial intelligence." },
                { id: 'opt36b', text: "The need for constant reassessment of our relationship with technology." },
                { id: 'opt36c', text: "The decline of traditional forms of communication." }
            ],
            correctAnswerId: 'opt36b',
            explanation: "O áudio discute a necessidade de 'figurar onde estamos com a tecnologia' e 'que tipo de relacionamento queremos ter com ela'.",
            mediaPath: 'media/q36.mp4', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE VÍDEO
            mediaType: 'video'
        },
        {
            id: 'q37',
            type: 'listening',
            topic: 'comprehension',
            question: "37. Listen to the audio in the video. Then, answer the questions below:<br>Audio: \"Well, you know, the whole discourse around environmental sustainability—it’s really evolved a lot over the years, hasn’t it? We’re seeing, like, this paradigm shift, right? People are getting more clued in about, say, climate change, or how our daily habits actually impact the planet. And it’s not just, like, a niche thing anymore; it’s totally mainstream. Businesses are jumping on board, governments are making policies, and even, like, everyday folks are trying to do their bit, you know? It’s pretty cool how everyone’s kind of waking up to the fact that we’ve got to look after our home. It’s not just about, like, saving the polar bears, though that’s important too. It’s about making sure we’ve got a decent future for everyone. It’s a big deal, and it’s only going to get bigger.\"<br>What is the main idea conveyed by the speaker regarding environmental sustainability?",
            options: [
                { id: 'opt37a', text: "Environmental sustainability is a niche topic discussed only by scientists." },
                { id: 'opt37b', text: "The discourse around environmental sustainability has become mainstream and involves various sectors." },
                { id: 'opt37c', text: "Governments are solely responsible for addressing climate change." }
            ],
            correctAnswerId: 'opt37b',
            explanation: "O áudio enfatiza que a sustentabilidade ambiental se tornou um tópico mainstream, envolvendo empresas, governos e indivíduos.",
            mediaPath: 'media/q37.mp4', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE VÍDEO
            mediaType: 'video'
        },
        {
            id: 'q38',
            type: 'listening',
            topic: 'comprehension',
            question: "38. Listen to the audio in the video. Then, answer the questions below:<br>Audio: \"So, like, the whole idea of cultural diversity, right? It’s not just about, you know, people from different places living in the same city. It’s way more than that. It’s about appreciating the whole mash-up of traditions, languages, and stuff. And, like, it's not just this thing we say about being open-minded. It's like, genuinely seeing the awesomeness in how different cultures do their thing. You get me? It's this blend of ideas, art, and different views, and it's pretty cool how everyone can, you know, vibe together and still keep their own thing going.”<br>What is the speaker's perspective on cultural diversity?",
            options: [
                { id: 'opt38a', text: "It is limited to people from different places living in the same city." },
                { id: 'opt38b', text: "It is about genuinely appreciating the blend of traditions, languages, and different views." },
                { id: 'opt38c', text: "It is primarily about maintaining individual cultural identities without interaction." }
            ],
            correctAnswerId: 'opt38b',
            explanation: "O áudio destaca que a diversidade cultural é sobre 'genuinamente ver a grandiosidade em como diferentes culturas fazem suas coisas' e a mistura de ideias, arte e visões.",
            mediaPath: 'media/q38.mp4', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE VÍDEO
            mediaType: 'video'
        },
        {
            id: 'q39',
            type: 'listening',
            topic: 'idiomatic_expression',
            question: "39. Listen to the audio in the video. Then, answer the questions below:<br>Audio: \"So, like, the whole idea of cultural diversity, right? It’s not just about, you know, people from different places living in the same city. It’s way more than that. It’s about appreciating the whole mash-up of traditions, languages, and stuff. And, like, it's not just this thing we say about being open-minded. It's like, genuinely seeing the awesomeness in how different cultures do their thing. You get me? It's this blend of ideas, art, and different views, and it's pretty cool how everyone can, you know, vibe together and still keep their own thing going.”<br>What does the expression \"putting up with each other\" mean?",
            options: [
                { id: 'opt39a', text: "Tolerating and accepting each other despite differences." },
                { id: 'opt39b', text: "Embracing and celebrating each other's differences." },
                { id: 'opt39c', text: "Physically putting up various objects as a symbol of unity." }
            ],
            correctAnswerId: 'opt39a',
            explanation: "A expressão 'putting up with each other' significa tolerar e aceitar uns aos outros, apesar das diferenças.",
            mediaPath: 'media/q39.mp4', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE VÍDEO
            mediaType: 'video'
        },
        {
            id: 'q40',
            type: 'listening',
            topic: 'idiomatic_expression',
            question: "40. Listen to the audio in the video. Then, answer the questions below:<br>Audio: “Okay, so, like, technology is moving crazy fast, right? And, um, it's not just about all the cool stuff it brings. There's this whole other side to it, you know? Like, how should we be using all this crazy tech responsibly? It's not just a tech thing; it's, like, a big moral puzzle. Artificial intelligence making decisions and, you know, gene-editing stuff – it's not just about progress. It's about, like, really thinking hard about what we're doing. It's not just the tech wizards; it's all of us figuring out the right way to use these game-changing tools without messing everything up. It's kinda heavy, you know?”<br>What does the speaker mean by \"without messing everything up\"?",
            options: [
                { id: 'opt40a', text: "Experimenting with technology without considering the potential risks." },
                { id: 'opt40b', text: "Introducing groundbreaking technologies without any consequences." },
                { id: 'opt40c', text: "Utilizing transformative technologies responsibly and ethically." }
            ],
            correctAnswerId: 'opt40c',
            explanation: "A frase 'without messing everything up' no contexto do áudio significa utilizar as tecnologias de forma responsável e ética para evitar problemas.",
            mediaPath: 'media/q40.mp4', // <-- ATUALIZE COM O CAMINHO CORRETO DO SEU ARQUIVO DE VÍDEO
            mediaType: 'video'
        }
    ];

    // Função para mostrar uma tela e esconder as outras
    function showScreen(screenElement) {
        const allScreens = [introSection, nameSection, lastNameSection, proficiencySection, preparationSection, quizSection, resultsSection];
        allScreens.forEach(screen => {
            if (screen === screenElement) {
                screen.classList.remove('hidden');
            } else {
                screen.classList.add('hidden');
            }
        });
    }

    // --- Lógica de Navegação e Validação ---

    // Introdução
    startButton.addEventListener('click', () => {
        showScreen(nameSection);
        firstNameInput.focus(); // Foca no input do nome
    });

    // Coleta de Nome
    firstNameInput.addEventListener('input', () => {
        nextNameButton.disabled = firstNameInput.value.trim() === '';
    });
    nextNameButton.addEventListener('click', () => {
        userData.firstName = firstNameInput.value.trim();
        lastNameQuestion.innerHTML = `Qual o seu sobrenome, ${userData.firstName}?`;
        showScreen(lastNameSection);
        lastNameInput.focus(); // Foca no input do sobrenome
    });

    // Coleta de Sobrenome
    lastNameInput.addEventListener('input', () => {
        nextLastNameButton.disabled = lastNameInput.value.trim() === '';
    });
    nextLastNameButton.addEventListener('click', () => {
        userData.lastName = lastNameInput.value.trim();
        proficiencyQuestion.innerHTML = `Qual o seu nível de proficiência em inglês?`;
        showScreen(proficiencySection);
    });

    // Coleta de Proficiência
    proficiencyOptionButtons.forEach(button => {
        button.addEventListener('click', () => {
            proficiencyOptionButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            userData.proficiencyLevel = button.dataset.level;
            nextProficiencyButton.disabled = false;
        });
    });
    nextProficiencyButton.addEventListener('click', () => {
        preparationMessage.innerHTML = `Tudo pronto, ${userData.firstName}! <br>Seu teste de nivelamento está prestes a começar.`;
        showScreen(preparationSection);
    });

    // Início do Quiz
    startQuizButton.addEventListener('click', () => {
        currentQuestionIndex = 0;
        userAnswers = new Array(questions.length).fill(null);
        score = 0;
        // Reinicia a contagem de reproduções dos vídeos
        for (const path in mediaPlayCounts) {
            mediaPlayCounts[path] = 0;
        }
        loadQuestion();
        showScreen(quizSection);
    });

    // Carregamento de Questões
    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        questionText.innerHTML = question.question;
        optionsContainer.innerHTML = ''; // Limpa as opções anteriores
        mediaContainer.innerHTML = ''; // Limpa o container de mídia

        // Lógica para o reprodutor de mídia nativo
        if (question.mediaPath && question.mediaType) {
            currentMediaPath = question.mediaPath;
            // Inicializa a contagem se ainda não existir
            if (!mediaPlayCounts[currentMediaPath]) {
                mediaPlayCounts[currentMediaPath] = 0;
            }

            const mediaWrapper = document.createElement('div');
            mediaWrapper.classList.add('media-wrapper');

            if (question.mediaType === 'audio') {
                currentMediaElement = document.createElement('audio');
                currentMediaElement.src = question.mediaPath;
                currentMediaElement.preload = 'auto'; // Pré-carrega o áudio
                mediaWrapper.appendChild(currentMediaElement);
            } else if (question.mediaType === 'video') {
                currentMediaElement = document.createElement('video');
                currentMediaElement.src = question.mediaPath;
                currentMediaElement.preload = 'auto'; // Pré-carrega o vídeo
                currentMediaElement.controls = false; // Não mostra os controles nativos
                mediaWrapper.appendChild(currentMediaElement);
            }

            mediaContainer.appendChild(mediaWrapper);

            // Cria os controles personalizados
            const controlsDiv = document.createElement('div');
            controlsDiv.classList.add('media-controls');

            const playButton = document.createElement('button');
            playButton.classList.add('main-button');
            playButton.textContent = 'Play';
            controlsDiv.appendChild(playButton);

            const restartButtonMedia = document.createElement('button');
            restartButtonMedia.classList.add('main-button');
            restartButtonMedia.textContent = 'Reiniciar';
            controlsDiv.appendChild(restartButtonMedia);

            const statusSpan = document.createElement('span');
            statusSpan.classList.add('media-status');
            controlsDiv.appendChild(statusSpan);

            mediaContainer.appendChild(controlsDiv);

            // Atualiza o status inicial
            updateMediaStatus(statusSpan);

            // Event Listeners para os controles
            playButton.addEventListener('click', () => {
                if (mediaPlayCounts[currentMediaPath] < MAX_PLAYS) {
                    currentMediaElement.play();
                    playButton.disabled = true; // Desabilita o play enquanto toca
                }
            });

            restartButtonMedia.addEventListener('click', () => {
                if (mediaPlayCounts[currentMediaPath] < MAX_PLAYS) {
                    currentMediaElement.currentTime = 0;
                    currentMediaElement.play();
                    playButton.disabled = true; // Desabilita o play enquanto toca
                }
            });

            currentMediaElement.addEventListener('ended', () => {
                mediaPlayCounts[currentMediaPath]++;
                updateMediaStatus(statusSpan);
                if (mediaPlayCounts[currentMediaPath] >= MAX_PLAYS) {
                    playButton.disabled = true;
                    restartButtonMedia.disabled = true;
                } else {
                    playButton.disabled = false; // Habilita play novamente se ainda há reproduções
                }
            });

            currentMediaElement.addEventListener('pause', () => {
                if (mediaPlayCounts[currentMediaPath] < MAX_PLAYS) {
                    playButton.disabled = false; // Habilita play se pausado e ainda há reproduções
                }
            });

            // Desabilita os botões se o limite já foi atingido
            if (mediaPlayCounts[currentMediaPath] >= MAX_PLAYS) {
                playButton.disabled = true;
                restartButtonMedia.disabled = true;
            }

            mediaContainer.style.display = 'flex'; // Mostra o container de mídia
        } else {
            // Se não há mídia, garante que o container esteja vazio e oculto
            mediaContainer.innerHTML = '';
            mediaContainer.style.display = 'none';
            currentMediaElement = null; // Reseta o elemento de mídia
            currentMediaPath = null;
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

    function updateMediaStatus(statusSpan) {
        const playsLeft = MAX_PLAYS - mediaPlayCounts[currentMediaPath];
        if (playsLeft > 0) {
            statusSpan.textContent = `(${playsLeft} reprodução${playsLeft > 1 ? 'ões' : ''} restante${playsLeft > 1 ? 's' : ''})`;
        } else {
            statusSpan.textContent = `(Limite atingido)`;
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

        // Pausa qualquer mídia que esteja tocando antes de ir para a próxima questão
        if (currentMediaElement) {
            currentMediaElement.pause();
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
        for (const path in mediaPlayCounts) {
            mediaPlayCounts[path] = 0;
        }

        // Pausa qualquer mídia que esteja tocando ao reiniciar o teste
        if (currentMediaElement) {
            currentMediaElement.pause();
        }

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
